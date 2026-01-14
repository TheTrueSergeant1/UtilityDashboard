'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Download, Clock, Film, Tv, 
  Filter, AlertCircle, CheckCircle2, ArrowDownCircle,
  HardDrive
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArrLogisticsPage() {
  const { data } = useSWR('/api/arr/full', fetcher, { refreshInterval: 5000 });
  const [view, setView] = useState<'queue' | 'calendar' | 'history'>('queue');
  const [filter, setFilter] = useState<'all' | 'tv' | 'movie'>('all');

  // Loading Skeleton
  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <div className="font-mono text-sm tracking-widest uppercase">Syncing Logistics...</div>
    </div>
  );

  // --- Derived Data & filtering ---
  
  // 1. Find the absolute next airing show
  const nextAiring = data.calendar && data.calendar.length > 0 
    ? data.calendar.sort((a: any, b: any) => new Date(a.airDateUtc).getTime() - new Date(b.airDateUtc).getTime())[0]
    : null;

  // 2. Filter logic
  const filterFn = (item: any) => {
    if (filter === 'all') return true;
    // Heuristic: Sonarr items usually have 'episodeId' or 'series', Radarr has 'movieId'
    const isTv = item.series || item.episodeId;
    return filter === 'tv' ? isTv : !isTv;
  };

  const filteredQueue = data.queue.filter(filterFn);
  const filteredHistory = data.history.filter((item: any) => {
    if (filter === 'all') return true;
    const isTv = item.seriesId || item.episodeId; 
    return filter === 'tv' ? isTv : !isTv;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. HERO SECTION: Next Up & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Up Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/10 p-8 flex flex-col justify-center group">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
          
          <div className="relative z-10">
             <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">
               <CalendarIcon size={14} /> Next Premiere
             </div>
             
             {nextAiring ? (
               <div>
                 <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                   {nextAiring.series?.title || 'Unknown Series'}
                 </h2>
                 <div className="flex items-center gap-4 text-neutral-400 text-lg">
                   <span className="text-white font-medium">{nextAiring.title}</span>
                   <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                   <span>S{nextAiring.seasonNumber}:E{nextAiring.episodeNumber}</span>
                   <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                   <span className="text-blue-400 font-mono">
                     {new Date(nextAiring.airDateUtc).toLocaleTimeString([], {weekday: 'short', hour: 'numeric', minute:'2-digit'})}
                   </span>
                 </div>
               </div>
             ) : (
               <div className="text-neutral-500 text-xl">No upcoming premieres detected.</div>
             )}
          </div>
        </div>

        {/* Mini Stats Column */}
        <div className="space-y-4">
          <StatTile 
            icon={Download} 
            label="Active Downloads" 
            value={data.queue.length} 
            color="bg-green-500" 
            sub="Items in Queue"
          />
          <StatTile 
            icon={Clock} 
            label="Recent Grabs" 
            value={data.history.length} 
            color="bg-purple-500" 
            sub="Last 24 Hours"
          />
          <StatTile 
            icon={HardDrive} 
            label="System Status" 
            value="Operational" 
            color="bg-blue-500" 
            sub="All Systems Go"
          />
        </div>
      </div>

      {/* 2. CONTROLS: Tabs & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl">
        
        {/* View Switcher (Segmented Control) */}
        <div className="flex bg-neutral-900/80 p-1 rounded-xl border border-white/5">
           <TabButton active={view === 'queue'} onClick={() => setView('queue')} label="Queue" />
           <TabButton active={view === 'calendar'} onClick={() => setView('calendar')} label="Calendar" />
           <TabButton active={view === 'history'} onClick={() => setView('history')} label="History" />
        </div>

        {/* Filter Toggles */}
        <div className="flex items-center gap-2 px-4">
          <Filter size={14} className="text-neutral-500" />
          <div className="flex gap-2">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
            <FilterChip active={filter === 'tv'} onClick={() => setFilter('tv')} label="TV" icon={Tv} />
            <FilterChip active={filter === 'movie'} onClick={() => setFilter('movie')} label="Movies" icon={Film} />
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="min-h-[500px]">
        <AnimatePresence mode='wait'>
          
          {/* --- QUEUE VIEW --- */}
          {view === 'queue' && (
            <motion.div 
              key="queue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredQueue.length === 0 ? (
                 <EmptyState icon={CheckCircle2} label="Queue is clear" sub="No active downloads." />
              ) : (
                filteredQueue.map((item: any) => (
                  <div key={item.id} className="group bg-neutral-900 hover:bg-neutral-800/80 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${item.episodeId ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {item.episodeId ? <Tv size={24} /> : <Film size={24} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">{item.title}</h3>
                          <div className="text-sm text-neutral-400 flex items-center gap-2">
                            <span className="uppercase text-xs font-bold tracking-wider bg-white/5 px-2 py-0.5 rounded">
                              {item.status}
                            </span>
                            <span>•</span>
                            <span>{item.timeleft || 'Calculating...'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xl font-mono font-bold text-white">
                           {(item.sizeleft / 1024 / 1024).toFixed(0)} <span className="text-sm text-neutral-500">MB</span>
                         </div>
                         <div className="text-xs text-neutral-500">Remaining</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - (item.sizeleft / item.size * 100)}%` }}
                        className={`h-full relative overflow-hidden ${item.status === 'Warning' ? 'bg-red-500' : 'bg-blue-500'}`}
                      >
                         {/* Animated Stripes */}
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-move-stripes" />
                      </motion.div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* --- CALENDAR VIEW --- */}
          {view === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {data.calendar.map((event: any) => (
                <div key={event.id} className="bg-neutral-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                  
                  <div className="flex justify-between items-start mb-3 pl-3">
                    <span className="text-xs font-bold text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">
                      {new Date(event.airDateUtc).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      {new Date(event.airDateUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className="pl-3">
                    <h4 className="font-bold text-white leading-tight truncate" title={event.series?.title}>{event.series?.title || 'Unknown'}</h4>
                    <p className="text-sm text-neutral-400 mt-1 truncate">{event.title}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <span className="bg-white/5 px-1.5 py-0.5 rounded">S{event.seasonNumber}</span>
                      <span className="bg-white/5 px-1.5 py-0.5 rounded">E{event.episodeNumber}</span>
                      {event.hasFile && <span className="text-green-500 ml-auto flex items-center gap-1"><CheckCircle2 size={10} /> Ready</span>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* --- HISTORY VIEW --- */}
          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden"
            >
              {filteredHistory.map((item: any, i: number) => (
                <div key={item.id + i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${item.eventType === 'grabbed' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                    <ArrowDownCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{item.sourceTitle}</div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                      <span className="uppercase tracking-wider">{item.quality?.quality?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{item.language?.name || 'English'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-neutral-400">{new Date(item.date).toLocaleDateString()}</div>
                    <div className="text-[10px] text-neutral-600 uppercase font-bold mt-0.5">{item.eventType}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all relative ${active ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
    >
      {active && (
        <motion.div 
          layoutId="activeTabBg"
          className="absolute inset-0 bg-neutral-700 shadow-sm rounded-lg"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function FilterChip({ active, onClick, label, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
        active 
          ? 'bg-white text-black border-white' 
          : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600'
      }`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
}

function StatTile({ icon: Icon, label, value, color, sub }: any) {
  return (
    <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label, sub }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-neutral-600 bg-neutral-900/50 rounded-3xl border border-white/5 border-dashed">
      <Icon size={48} className="mb-4 opacity-20" />
      <div className="text-lg font-medium text-neutral-400">{label}</div>
      <div className="text-sm">{sub}</div>
    </div>
  );
}