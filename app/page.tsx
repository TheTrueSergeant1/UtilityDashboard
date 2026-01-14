'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  Activity, HardDrive, Wifi, Download, 
  Users, Server, Cpu, Zap, CloudRain, Wind, 
  AlertTriangle, CheckCircle2, ArrowRight,
  Database, Play, Film, Gamepad2, Globe
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MissionControl() {
  const { data: dash } = useSWR('/api/dashboard', fetcher, { refreshInterval: 2000 });
  const { data: weather } = useSWR(
    'https://api.open-meteo.com/v1/forecast?latitude=30.31&longitude=-95.46&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph',
    fetcher
  );

  if (!dash) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity size={24} className="text-blue-500" />
        </div>
      </div>
      <div className="font-mono text-blue-400 tracking-widest text-sm">INITIALIZING MISSION CONTROL...</div>
    </div>
  );

  // --- Derived State (Smart Alerts) ---
  const cpuWarning = dash.system.cpuLoad > 80;
  const memWarning = (dash.system.memUsed / dash.system.memTotal) > 0.9;
  const storageWarning = dash.system.storage.some((d: any) => d.use > 90);
  const systemHealthy = !cpuWarning && !memWarning && !storageWarning;

  // Time-based Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 1. HERO SECTION: Greeting & Status Orb */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
            {greeting}, Admin.
          </h1>
          <div className="flex items-center gap-3 text-neutral-400">
            <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${systemHealthy ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {systemHealthy ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {systemHealthy ? 'All Systems Nominal' : 'Attention Required'}
            </span>
            <span className="text-xs font-mono">
              UPTIME: {new Date(dash.system.uptime * 1000).toISOString().substr(11, 8)}
            </span>
          </div>
        </div>

        {/* Weather Widget (Glass) */}
        <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 min-w-[200px]">
          <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
             <CloudRain size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{weather?.current_weather?.temperature}°F</div>
            <div className="text-xs text-neutral-400 flex items-center gap-1">
              <Wind size={12} /> {weather?.current_weather?.windspeed} mph • Conroe
            </div>
          </div>
        </div>
      </div>

      {/* 2. ALERT BANNER (Conditional) */}
      {!systemHealthy && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4"
        >
          <AlertTriangle className="text-red-500" />
          <div className="text-red-200 text-sm">
            <strong>System Warning:</strong>
            {cpuWarning && <span className="ml-2">CPU Load High ({dash.system.cpuLoad.toFixed(0)}%).</span>}
            {memWarning && <span className="ml-2">Memory Critical.</span>}
            {storageWarning && <span className="ml-2">Storage near capacity.</span>}
          </div>
        </motion.div>
      )}

      {/* 3. CORE METRICS (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* CPU Visualizer */}
        <BentoCard className="md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <Cpu size={20} />
              <span className="font-bold text-xs uppercase tracking-widest">Processing Power</span>
            </div>
            
            <div className="flex items-end gap-1 h-32 mt-4">
               {/* Animated Bar Graph */}
               {[...Array(12)].map((_, i) => {
                 const height = Math.min(100, Math.max(10, dash.system.cpuLoad + (Math.sin(i + Date.now()) * 20)));
                 return (
                   <div key={i} className="flex-1 bg-neutral-800 rounded-sm overflow-hidden h-full relative">
                     <motion.div 
                       animate={{ height: `${height}%` }}
                       transition={{ type: 'spring', stiffness: 50 }}
                       className={`absolute bottom-0 w-full ${dash.system.cpuLoad > 80 ? 'bg-red-500' : 'bg-purple-500'}`}
                     />
                   </div>
                 );
               })}
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <div className="text-3xl font-bold text-white">{dash.system.cpuLoad.toFixed(1)}%</div>
                <div className="text-xs text-neutral-500">Total Load</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{(dash.system.memUsed / 1024 / 1024 / 1024).toFixed(1)} GB</div>
                <div className="text-xs text-neutral-500">RAM In Use</div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Network I/O */}
        <BentoCard className="flex flex-col justify-between">
           <div className="flex items-center gap-2 text-green-400 mb-2">
            <Activity size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">Network</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-neutral-500 uppercase mb-1">Download</div>
              <div className="text-2xl font-mono text-white flex items-baseline gap-1">
                {(dash.system.netRx / 1024 / 1024).toFixed(1)} <span className="text-sm text-neutral-600">MB/s</span>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <motion.div animate={{ width: "60%" }} className="h-full bg-green-500/50" />
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase mb-1">Upload</div>
              <div className="text-2xl font-mono text-white flex items-baseline gap-1">
                {(dash.system.netTx / 1024 / 1024).toFixed(1)} <span className="text-sm text-neutral-600">MB/s</span>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <motion.div animate={{ width: "20%" }} className="h-full bg-blue-500/50" />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Storage Summary */}
        <BentoCard className="flex flex-col justify-between">
           <div className="flex items-center gap-2 text-orange-400 mb-2">
            <HardDrive size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">Storage</span>
          </div>
          <div className="space-y-4">
            {dash.system.storage.slice(0, 3).map((disk: any) => (
              <div key={disk.mount}>
                <div className="flex justify-between text-xs mb-1 text-neutral-400">
                  <span>{disk.mount}</span>
                  <span>{disk.use.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${disk.use > 90 ? 'bg-red-500' : 'bg-orange-500'}`} 
                    style={{ width: `${disk.use}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* 4. QUICK LAUNCH DOCK (UPDATED) */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Quick Navigation</h3>
        {/* Updated Grid for 5 items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <QuickLink href="/nas" title="NAS Telemetry" icon={Server} color="bg-blue-600" desc="Hardware Stats" />
          <QuickLink href="/network" title="Network Ops" icon={Globe} color="bg-cyan-600" desc="Traffic Control" />
          <QuickLink href="/arr" title="Arr Logistics" icon={Download} color="bg-indigo-600" desc="Manage Media" />
          <QuickLink href="/jellyfin" title="Jellyfin Theater" icon={Play} color="bg-orange-600" desc="Now Playing" />
          <QuickLink href="/minecraft" title="Minecraft Ops" icon={Gamepad2} color="bg-green-600" desc="Server Console" />
        </div>
      </div>

      {/* 5. SERVICE HEALTH MATRIX */}
      <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-white">Service Matrix</h3>
           <div className="text-xs text-neutral-500 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             Live Monitoring
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceNode 
            name="Jellyfin" 
            status={dash.services.jellyfin.online} 
            detail={`${dash.services.jellyfin.activeUsers} Users Active`} 
            icon={Film}
            accent="emerald"
          />
          <ServiceNode 
            name="Sonarr" 
            status={dash.services.sonarr.online} 
            detail={`${dash.services.sonarr.queue} Items Queued`} 
            icon={Wifi}
            accent="blue"
          />
          <ServiceNode 
            name="Radarr" 
            status={dash.services.radarr.online} 
            detail={`${dash.services.radarr.queue} Items Queued`} 
            icon={Database}
            accent="amber"
          />
        </div>
      </div>

    </div>
  );
}

// --- COMPONENTS ---

function BentoCard({ children, className }: any) {
  return (
    <div className={`bg-neutral-900 border border-white/5 rounded-3xl p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function QuickLink({ href, title, icon: Icon, color, desc }: any) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-4 hover:border-white/10 transition-all hover:-translate-y-1 h-full">
      <div className={`absolute top-0 right-0 p-12 ${color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
      <div className="relative z-10 flex flex-col gap-3">
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${color} text-white shadow-lg`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="font-bold text-white text-sm">{title}</div>
          <div className="text-xs text-neutral-500">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

function ServiceNode({ name, status, detail, icon: Icon, accent }: any) {
  const colors: any = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  const style = status ? colors[accent] : colors.red;

  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${status ? 'bg-neutral-900/50 border-white/5' : 'bg-red-900/10 border-red-500/20'}`}>
      <div className={`p-3 rounded-xl ${style}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-white">{name}</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {status ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="text-xs text-neutral-500">{status ? detail : 'Connection Lost'}</div>
      </div>
    </div>
  );
}