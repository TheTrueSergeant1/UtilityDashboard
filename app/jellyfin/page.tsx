'use client';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, Activity, Film, Tv, Monitor, Cpu, Info } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JellyfinCinemaPage() {
  const { data } = useSWR('/api/jellyfin/power', fetcher, { refreshInterval: 3000 });

  if (!data) return <div className="p-12 text-center text-neutral-500 font-mono animate-pulse">Initializing Theater...</div>;

  const activeStreams = data.sessions.filter((s: any) => s.NowPlayingItem);
  const totalUsers = data.users.length;
  
  // Calculate percentage of users active
  const activeUserCount = activeStreams.length;
  const activityRate = totalUsers > 0 ? (activeUserCount / totalUsers) * 100 : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. HUD Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HudCard 
          icon={Activity}
          label="Server Load"
          value={activeStreams.length > 0 ? "High Activity" : "Idle"}
          sub={`${activeStreams.length} Active Stream(s)`}
          accent="text-blue-400"
          active={activeStreams.length > 0}
        />
        <HudCard 
          icon={Users}
          label="Audience"
          value={`${activeUserCount} / ${totalUsers}`}
          sub="Users Online"
          accent="text-purple-400"
          active={activeUserCount > 0}
        />
        <HudCard 
          icon={Film}
          label="Library Access"
          value="Authorized"
          sub="System Healthy"
          accent="text-green-400"
          active={true}
        />
      </div>

      {/* 2. Main Stage (Now Playing) */}
      <section className="min-h-[400px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Play className="text-orange-500 fill-orange-500" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Now Showing</h2>
        </div>
        
        {activeStreams.length === 0 ? (
          <EmptyTheater />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <AnimatePresence>
              {activeStreams.map((session: any) => (
                <CinemaCard key={session.Id} session={session} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 3. Operational Data (Split View) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left: User Roster */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-3xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-neutral-200 mb-6 flex items-center gap-2">
            <Users size={18} className="text-neutral-400" /> 
            Registered Users
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {data.users.map((user: any) => {
              const isActive = activeStreams.some((s: any) => s.UserId === user.Id);
              return (
                <div key={user.Id} className={`group p-3 rounded-xl flex items-center gap-3 border transition-all ${isActive ? 'bg-purple-500/10 border-purple-500/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg ${isActive ? 'bg-purple-600' : 'bg-neutral-800'}`}>
                    {user.Name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-neutral-400'}`}>{user.Name}</div>
                    {isActive && <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Watching Now</div>}
                  </div>
                  {isActive && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: System Logs */}
        <div className="xl:col-span-2 bg-[#0F0F0F] border border-white/5 rounded-3xl p-6 h-[400px] flex flex-col">
           <h3 className="text-lg font-semibold text-neutral-200 mb-6 flex items-center gap-2">
             <Activity size={18} className="text-neutral-400" /> 
             System Events
           </h3>
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
             <table className="w-full text-left border-collapse">
               <thead className="text-xs text-neutral-500 uppercase tracking-wider sticky top-0 bg-[#0F0F0F] pb-4 block">
                 <tr className="flex border-b border-white/5 pb-2">
                   <th className="w-24 pl-2">Status</th>
                   <th className="w-32">Time</th>
                   <th className="flex-1">Event</th>
                 </tr>
               </thead>
               <tbody className="block space-y-1 mt-2">
                 {data.logs.map((log: any) => (
                   <tr key={log.Id} className="flex items-center text-sm p-2 hover:bg-white/5 rounded-lg transition-colors group">
                     <td className="w-24">
                       <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                         log.Severity === 'Error' 
                           ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                           : 'bg-green-500/10 text-green-400 border-green-500/20'
                       }`}>
                         {log.Severity || 'Info'}
                       </span>
                     </td>
                     <td className="w-32 text-neutral-500 font-mono text-xs">
                       {new Date(log.Date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                     </td>
                     <td className="flex-1 text-neutral-300 truncate group-hover:text-white transition-colors" title={log.Name}>
                       {log.Name}
                       <span className="text-neutral-600 text-xs ml-2">- {log.ShortMessage}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function CinemaCard({ session }: any) {
  const item = session.NowPlayingItem;
  // High-res backdrop or fallback
  const imgUrl = item.BackdropImageTags && item.BackdropImageTags[0] 
    ? `${process.env.NEXT_PUBLIC_JELLYFIN_URL}/Items/${item.Id}/Images/Backdrop?fillWidth=1200&quality=90`
    : null;

  const progress = session.PlayState.PositionTicks && item.RunTimeTicks
    ? (session.PlayState.PositionTicks / item.RunTimeTicks) * 100
    : 0;

  const isTranscoding = session.TranscodingInfo != null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative overflow-hidden rounded-3xl bg-neutral-900 aspect-video group shadow-2xl border border-white/10 ring-1 ring-white/5"
    >
      {/* Dynamic Background */}
      {imgUrl ? (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
          style={{ backgroundImage: `url(${imgUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
      )}
      
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
         <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
           <User size={14} className="text-white" />
           <span className="text-xs font-bold text-white">{session.UserName}</span>
         </div>

         {/* Tech Badge */}
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${isTranscoding ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-green-500/20 border-green-500/30 text-green-200'}`}>
           <Cpu size={14} />
           <span className="text-[10px] font-bold uppercase tracking-wider">
             {isTranscoding ? 'Transcoding' : 'Direct Play'}
           </span>
         </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 text-orange-400 text-sm font-bold uppercase tracking-widest mb-2">
            <Tv size={16} />
            <span>{item.SeriesName || 'Movie'}</span>
            {item.ParentIndexNumber && <span>S{item.ParentIndexNumber}:E{item.IndexNumber}</span>}
          </div>
          
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg line-clamp-1">
            {item.Name}
          </h3>
          
          <div className="flex items-center gap-2 text-neutral-300 text-sm mb-6">
            <Monitor size={14} />
            <span>Playing on {session.DeviceName}</span>
            {session.Client && <span className="opacity-50">• {session.Client}</span>}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
             <motion.div 
               className="h-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 1 }}
             />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function HudCard({ icon: Icon, label, value, sub, accent, active }: any) {
  return (
    <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden group">
      {/* Background Glow */}
      {active && <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-white/10 transition-colors`} />}
      
      <div className={`p-3 rounded-xl ${active ? 'bg-white/10' : 'bg-neutral-800'} transition-colors`}>
        <Icon size={24} className={active ? accent : 'text-neutral-500'} />
      </div>
      <div>
        <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{label}</div>
        <div className="text-xl font-bold text-white mt-0.5">{value}</div>
        <div className={`text-xs ${active ? accent : 'text-neutral-600'}`}>{sub}</div>
      </div>
    </div>
  );
}

function EmptyTheater() {
  return (
    <div className="w-full h-[400px] rounded-3xl border border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-[#0a0a0a] to-black flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
       {/* Ambient Elements */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
       
       <div className="relative z-10 bg-neutral-900/50 p-6 rounded-full border border-white/5 mb-6">
         <Play size={48} className="text-neutral-700 ml-2" />
       </div>
       <h3 className="text-2xl font-bold text-white mb-2 z-10">The Theater is Quiet</h3>
       <p className="text-neutral-500 max-w-md z-10">
         No active streams detected. When a user starts watching a movie or show, it will appear here in real-time.
       </p>
    </div>
  );
}

function User({ className }: any) { return <div className={className} /> } // Helper