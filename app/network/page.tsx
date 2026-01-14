'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  Activity, Globe, Shield, Wifi, 
  ArrowDown, ArrowUp, Zap, Radio, 
  Lock, Unlock
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NetworkOpsPage() {
  const { data } = useSWR('/api/network', fetcher, { refreshInterval: 1000 }); // Fast refresh for speed

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Radio size={48} className="text-cyan-500 animate-pulse" />
      <div className="font-mono text-cyan-400 tracking-widest text-sm">SCANNING FREQUENCIES...</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
          <Globe size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Network Operations</h1>
          <div className="flex items-center gap-2 text-sm text-cyan-500/60 font-mono mt-1">
             <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
             Live Traffic Monitoring
          </div>
        </div>
      </div>

      {/* 2. Speedometer Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BandwidthCard 
          label="Inbound Traffic" 
          val={data.speed.rx_sec} 
          max={100 * 1024 * 1024} // Assuming 100mbps max for scale visuals
          icon={ArrowDown}
          color="cyan"
        />
        <BandwidthCard 
          label="Outbound Traffic" 
          val={data.speed.tx_sec} 
          max={50 * 1024 * 1024} 
          icon={ArrowUp}
          color="purple"
        />
      </div>

      {/* 3. Interface Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.interfaces.map((iface: any) => (
          <div key={iface.mac} className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-neutral-800 rounded-lg text-white">
                  {iface.type === 'wired' ? <Activity size={20} /> : <Wifi size={20} />}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded">
                  Active
                </div>
              </div>
              
              <div className="font-mono text-xl text-white font-bold truncate mb-1">{iface.ip4}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-widest mb-4">{iface.iface} • {iface.mac}</div>
              
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Active Connections Table (Matrix Style) */}
      <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-900/80 backdrop-blur">
           <h3 className="font-bold text-white flex items-center gap-2">
             <Shield size={18} className="text-cyan-400" /> 
             Active Socket Connections
           </h3>
           <div className="text-xs font-mono text-neutral-500">
             {data.connections.length} Sessions Active
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-4">Process</th>
                <th className="p-4">Protocol</th>
                <th className="p-4">Local</th>
                <th className="p-4">Remote Peer</th>
                <th className="p-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-mono text-neutral-300">
              {data.connections.map((conn: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Zap size={14} className="text-neutral-600 group-hover:text-yellow-400 transition-colors" />
                      {conn.process || 'System'}
                    </div>
                  </td>
                  <td className="p-4 text-cyan-600">{conn.protocol.toUpperCase()}</td>
                  <td className="p-4">{conn.localPort}</td>
                  <td className="p-4 text-neutral-400">
                    {conn.peerAddress ? conn.peerAddress : <span className="text-neutral-700 italic">localhost</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      conn.state === 'LISTEN' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      {conn.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// --- Components ---

function BandwidthCard({ label, val, max, icon: Icon, color }: any) {
  // Convert bytes/sec to readable format
  const mbps = (val * 8) / 1000 / 1000;
  const displayVal = val > 1024 * 1024 
    ? `${(val / 1024 / 1024).toFixed(1)} MB/s`
    : `${(val / 1024).toFixed(0)} KB/s`;

  // Dynamic colors
  const colors: any = {
    cyan: 'text-cyan-400 bg-cyan-500',
    purple: 'text-purple-400 bg-purple-500'
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden">
      <div className={`p-4 rounded-2xl bg-neutral-800 ${colors[color].split(' ')[0]}`}>
        <Icon size={32} />
      </div>
      
      <div className="flex-1 z-10">
        <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">{label}</div>
        <div className="text-4xl font-black text-white font-mono tracking-tighter">
          {displayVal}
        </div>
        
        {/* Visualizer Bars */}
        <div className="flex items-end gap-1 h-8 mt-3 opacity-50">
          {[...Array(20)].map((_, i) => {
             // Fake history graph effect based on current value intensity
             const randomHeight = Math.random() * 100;
             const active = i > 15; // Highlight last few bars
             return (
               <div 
                 key={i} 
                 className={`flex-1 rounded-sm ${active ? colors[color].split(' ')[1] : 'bg-neutral-800'}`}
                 style={{ height: active ? `${Math.min(100, (val / max) * 100)}%` : `${randomHeight}%` }} 
               />
             )
          })}
        </div>
      </div>
    </div>
  );
}