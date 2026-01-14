'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  Server, HardDrive, Cpu, Activity, 
  Thermometer, Router, Database, Box, 
  ArrowUp, ArrowDown
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NasTelemetryPage() {
  const { data } = useSWR('/api/nas', fetcher, { refreshInterval: 2000 });

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Server size={48} className="text-blue-500 animate-pulse" />
      <div className="font-mono text-blue-400">CONNECTING TO HOST...</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Identity Header */}
      <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-900/20">
             <Server size={32} className="text-white" />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-white tracking-tight">{data.os.hostname.toUpperCase()}</h1>
             <div className="flex items-center gap-2 text-neutral-400 text-sm mt-1 font-mono">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span>{data.os.distro} {data.os.release}</span>
               <span className="text-neutral-600">•</span>
               <span>{data.os.arch}</span>
             </div>
           </div>
        </div>
        
        {/* Hardware Tag */}
        <div className="text-right hidden md:block">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Hardware ID</div>
          <div className="text-sm text-neutral-300 font-medium">{data.hardware.manufacturer} {data.hardware.model}</div>
        </div>
      </div>

      {/* 2. Core Resources (Gauges) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CPU Module */}
        <ResourceCard 
          title="CPU Processor" 
          icon={Cpu} 
          accent="text-blue-400"
          border="group-hover:border-blue-500/30"
        >
          <div className="flex justify-between items-end mb-4">
            <div className="text-4xl font-black text-white">{data.cpu.load.toFixed(1)}<span className="text-lg text-neutral-500 font-medium">%</span></div>
            <div className="flex items-center gap-1 text-sm text-neutral-400 mb-1">
              <Thermometer size={14} /> {data.cpu.temp}°C
            </div>
          </div>
          {/* Core Visualizer */}
          <div className="flex gap-1 h-8 items-end">
            {data.cpu.cores.map((core: number, i: number) => (
              <div key={i} className="flex-1 bg-neutral-800 rounded-sm overflow-hidden h-full relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${core}%` }}
                  className="absolute bottom-0 w-full bg-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono text-center">CORE DISTRIBUTION</div>
        </ResourceCard>

        {/* Memory Module */}
        <ResourceCard 
          title="Memory Allocation" 
          icon={Database} 
          accent="text-purple-400"
          border="group-hover:border-purple-500/30"
        >
           <div className="flex justify-between items-end mb-6">
            <div>
               <div className="text-4xl font-black text-white">
                 {(data.mem.used / 1024 / 1024 / 1024).toFixed(1)}
                 <span className="text-lg text-neutral-500 font-medium">GB</span>
               </div>
               <div className="text-xs text-neutral-500 mt-1">
                 of {(data.mem.total / 1024 / 1024 / 1024).toFixed(1)} GB Total
               </div>
            </div>
            {/* Pie Chart Representation */}
            <div 
              className="w-16 h-16 rounded-full bg-neutral-800 relative flex items-center justify-center"
              style={{ background: `conic-gradient(#a855f7 ${(data.mem.used / data.mem.total) * 100}%, #262626 0)` }}
            >
              <div className="w-12 h-12 bg-neutral-900 rounded-full" />
            </div>
          </div>
          
          {/* Swap Indicator */}
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500/30" style={{ width: `${(data.mem.swapused / data.mem.swaptotal) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono uppercase">
             <span>Swap Mem</span>
             <span>{(data.mem.swapused / 1024 / 1024).toFixed(0)} MB Used</span>
          </div>
        </ResourceCard>

        {/* Network Module */}
        <ResourceCard 
          title="Network Interface" 
          icon={Router} 
          accent="text-green-400"
          border="group-hover:border-green-500/30"
        >
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-lg text-green-400"><ArrowDown size={18} /></div>
                  <div>
                    <div className="text-xs text-neutral-500 font-bold uppercase">Down</div>
                    <div className="font-mono text-white">{(data.net.rx_sec / 1024 / 1024).toFixed(2)} MB/s</div>
                  </div>
                </div>
             </div>
             
             <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400"><ArrowUp size={18} /></div>
                  <div>
                    <div className="text-xs text-neutral-500 font-bold uppercase">Up</div>
                    <div className="font-mono text-white">{(data.net.tx_sec / 1024 / 1024).toFixed(2)} MB/s</div>
                  </div>
                </div>
             </div>
          </div>
          <div className="mt-3 text-xs text-neutral-600 font-mono text-center truncate">
            {data.net.iface} • {data.net.mac}
          </div>
        </ResourceCard>

      </div>

      {/* 3. Storage Array (Physical & Logical) */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2 pt-4">
        <HardDrive className="text-neutral-500" /> Storage Matrix
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Logical Mounts */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 px-2">Logical Volumes</div>
          {data.storage.logical.map((disk: any) => (
            <div key={disk.mount} className="bg-neutral-900 border border-white/5 p-4 rounded-xl flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${disk.use > 80 ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-400'}`}>
                <Box size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-neutral-200">{disk.mount}</div>
                  <div className="text-xs font-mono text-neutral-500">{disk.fs}</div>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${disk.use}%` }}
                    className={`h-full ${disk.use > 90 ? 'bg-red-500' : disk.use > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-400 mt-1.5">
                  <span>{disk.use.toFixed(1)}% Used</span>
                  <span>{(disk.size / 1024 / 1024 / 1024).toFixed(0)} GB Total</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Physical Disks */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 px-2">Physical Hardware</div>
          {data.storage.physical.map((disk: any, i: number) => (
            <div key={i} className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="bg-neutral-800 p-2 rounded-lg text-neutral-400">
                   <HardDrive size={20} />
                 </div>
                 <div>
                   <div className="font-bold text-white text-sm">{disk.name}</div>
                   <div className="text-xs text-neutral-500">{disk.vendor} • {disk.interfaceType}</div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-sm font-mono text-neutral-300">
                   {(disk.size / 1024 / 1024 / 1024).toFixed(0)} GB
                 </div>
                 <div className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                   HEALTHY
                 </div>
               </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

function ResourceCard({ title, icon: Icon, children, accent, border }: any) {
  return (
    <div className={`bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 group transition-colors ${border}`}>
      <div className="flex items-center gap-3 mb-6">
        <Icon size={20} className={accent} />
        <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  );
}