'use client';
import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  Terminal, Sun, Moon, CloudRain, CloudOff, 
  Shield, Swords, Skull, RefreshCw, Zap, Server, 
  MoreHorizontal, Command, UserX
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MinecraftEnterprisePage() {
  const { data, mutate } = useSWR('/api/minecraft/status', fetcher, { refreshInterval: 5000 });
  const [logs, setLogs] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runCmd = async (cmd: string, label?: string) => {
    setIsSending(true);
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${label || cmd}`]);

    try {
      const res = await fetch('/api/minecraft/command', {
        method: 'POST',
        body: JSON.stringify({ command: cmd }),
      });
      const result = await res.json();
      if (result.response) {
        setLogs(prev => [...prev, `[SERVER] ${result.response}`]);
      }
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] Connection refused`]);
    }
    
    setIsSending(false);
    mutate();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-3 rounded-2xl shadow-lg shadow-green-900/20">
            <Server className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Production Server</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${data?.online ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-neutral-400 font-mono">
                {data?.online ? `Online • ${data.version}` : 'Offline • Connection Lost'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => mutate()} 
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors border border-white/5"
          >
            <RefreshCw size={14} className={!data ? 'animate-spin' : ''} />
            Refresh Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Controls & Terminal */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Environment Controls */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-neutral-400 text-sm font-medium uppercase tracking-wider">
              <Command size={14} /> Environment Variables
            </div>
            
            <div className="space-y-4">
              {/* Time Strip */}
              <div className="flex items-center justify-between p-1 bg-neutral-950/50 rounded-xl border border-white/5">
                <ControlStripBtn onClick={() => runCmd('time set day', 'Set Time: Day')} icon={Sun} label="Day" />
                <div className="w-px h-6 bg-white/5" />
                <ControlStripBtn onClick={() => runCmd('time set 6000', 'Set Time: Noon')} icon={Zap} label="Noon" />
                <div className="w-px h-6 bg-white/5" />
                <ControlStripBtn onClick={() => runCmd('time set night', 'Set Time: Night')} icon={Moon} label="Night" />
              </div>

              {/* Weather & Difficulty Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-1 bg-neutral-950/50 rounded-xl border border-white/5">
                  <ControlStripBtn onClick={() => runCmd('weather clear', 'Weather: Clear')} icon={CloudOff} label="Clear" />
                  <div className="w-px h-6 bg-white/5" />
                  <ControlStripBtn onClick={() => runCmd('weather rain', 'Weather: Rain')} icon={CloudRain} label="Storm" />
                </div>

                <div className="flex items-center justify-between p-1 bg-neutral-950/50 rounded-xl border border-white/5">
                   <ControlStripBtn onClick={() => runCmd('difficulty peaceful', 'Mode: Peaceful')} icon={Shield} label="Peaceful" />
                   <div className="w-px h-6 bg-white/5" />
                   <ControlStripBtn onClick={() => runCmd('difficulty hard', 'Mode: Hard')} icon={Skull} label="Hard" />
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Terminal */}
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between text-xs text-neutral-400 border-b border-black/20">
              <div className="flex items-center gap-2">
                <Terminal size={12} />
                <span>rcon@minecraft-server:~</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1 text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700">
               {logs.length === 0 && <span className="opacity-30">Waiting for input...</span>}
               {logs.map((log, i) => (
                 <div key={i} className="break-all border-l-2 border-transparent hover:border-blue-500/50 pl-2 -ml-2 py-0.5">
                   <span className="opacity-50 select-none mr-2">$</span>
                   {log}
                 </div>
               ))}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as any).cmd;
                if(input.value) {
                  runCmd(input.value);
                  input.value = '';
                }
              }}
              className="p-3 bg-[#252526] border-t border-black/20 flex gap-2"
            >
              <input 
                name="cmd"
                autoComplete="off"
                className="flex-1 bg-transparent border-none outline-none text-neutral-200 font-mono text-sm placeholder:text-neutral-600"
                placeholder="Enter RCON command..." 
              />
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Roster */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-neutral-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Active Roster
            </h2>
            <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-md font-mono">
              {data?.players?.length || 0}/20
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
             {!data?.players?.length && (
               <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                 <UserX size={32} strokeWidth={1.5} />
                 <p className="text-sm">No players online</p>
               </div>
             )}

             {data?.players?.map((player: string) => (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={player} 
                 className="group bg-neutral-900 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:border-white/10 hover:bg-neutral-800 transition-all"
               >
                  <img 
                    src={`https://minotar.net/helm/${player}/64.png`} 
                    alt={player}
                    className="w-10 h-10 rounded-lg bg-neutral-800 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-neutral-200 truncate">{player}</div>
                    <div className="text-xs text-green-500 flex items-center gap-1">
                      Online <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Action Menu (Hidden until hover) */}
                  <button 
                     onClick={() => runCmd(`kick ${player}`, `Kicked ${player}`)}
                     className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 text-neutral-500 rounded-lg transition-all"
                     title="Kick Player"
                  >
                    <UserX size={16} />
                  </button>
               </motion.div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Micro-Component for the "Control Strip" style buttons
function ControlStripBtn({ onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all group active:scale-95"
    >
      <Icon size={18} className="group-hover:text-blue-400 transition-colors" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}