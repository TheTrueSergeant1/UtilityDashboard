'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext'; // Import hook
import { 
  Save, Layout, Globe, Zap, Monitor, Shield, Cpu, CheckCircle2 
} from 'lucide-react';

export default function PowerSettingsPage() {
  const { settings, updateSettings } = useSettings(); // Get global settings
  
  // Local "Draft" state (so we don't apply changes instantly)
  const [draft, setDraft] = useState(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync draft if global settings change externally
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  // Check for unsaved changes
  useEffect(() => {
    setIsDirty(JSON.stringify(settings) !== JSON.stringify(draft));
  }, [draft, settings]);

  const update = (key: string, value: any) => {
    setDraft((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveChanges = () => {
    updateSettings(draft); // Commit to Global Context
    setIsDirty(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const discardChanges = () => {
    setDraft(settings);
    setIsDirty(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-neutral-800 rounded-2xl border border-white/5">
          <Layout size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
          <p className="text-neutral-400 text-sm">Customize dashboard behavior and visualization preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: GENERAL */}
        <SettingsCard title="General Preferences" icon={Globe}>
          <InputGroup label="Server Identity" desc="DisplayName for the main dashboard header.">
             <input 
               type="text" 
               value={draft.serverName}
               onChange={(e) => update('serverName', e.target.value)}
               className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
             />
          </InputGroup>

          <InputGroup label="Weather City" desc="City name for automatic forecast lookup.">
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={draft.weatherCity}
                 onChange={(e) => update('weatherCity', e.target.value)}
                 className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
               />
               <Toggle 
                 left="°F" right="°C" 
                 state={draft.tempUnit === 'C'} 
                 onClick={() => update('tempUnit', draft.tempUnit === 'F' ? 'C' : 'F')} 
               />
             </div>
          </InputGroup>
        </SettingsCard>

        {/* SECTION 2: PERFORMANCE */}
        <SettingsCard title="Dashboard Performance" icon={Zap}>
           <InputGroup label="Data Polling Rate" desc="How often the dashboard fetches fresh data.">
             <div className="grid grid-cols-4 gap-2">
               {[1000, 2000, 5000, 10000].map((rate) => (
                 <button
                   key={rate}
                   onClick={() => update('refreshRate', rate)}
                   className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                     draft.refreshRate === rate 
                       ? 'bg-blue-600 border-blue-500 text-white' 
                       : 'bg-neutral-800 border-white/5 text-neutral-400 hover:bg-neutral-700'
                   }`}
                 >
                   {rate / 1000}s
                 </button>
               ))}
             </div>
           </InputGroup>

           <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-white/5">
             <div>
               <div className="text-sm font-bold text-white">Reduced Motion</div>
               <div className="text-xs text-neutral-500">Disable complex animations.</div>
             </div>
             <Switch active={!draft.animations} onClick={() => update('animations', !draft.animations)} />
           </div>
        </SettingsCard>

        {/* SECTION 3: APPEARANCE */}
        <SettingsCard title="Visual Personalization" icon={Monitor}>
          <InputGroup label="Accent Color" desc="Primary color used for highlights.">
            <div className="flex gap-3">
              {['blue', 'purple', 'green', 'orange', 'cyan'].map((color: any) => (
                <button
                  key={color}
                  onClick={() => update('accentColor', color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                     draft.accentColor === color ? 'border-white scale-110 ring-2 ring-white/20' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `var(--color-${color})` }}
                >
                  <div className={`w-full h-full rounded-full bg-${color}-500`} /> 
                </button>
              ))}
            </div>
          </InputGroup>
        </SettingsCard>

        {/* SECTION 4: ADVANCED */}
        <SettingsCard title="Advanced" icon={Shield}>
          <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-white/5">
             <div>
               <div className="text-sm font-bold text-white">Debug Mode</div>
               <div className="text-xs text-neutral-500">Show API JSON output.</div>
             </div>
             <Switch active={draft.showDebug} onClick={() => update('showDebug', !draft.showDebug)} />
           </div>
        </SettingsCard>

      </div>

      {/* FLOATING ACTION BAR */}
      <AnimatePresence>
        {isDirty && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50"
          >
            <div className="bg-[#111] border border-white/10 shadow-2xl rounded-2xl p-2 pl-6 flex items-center gap-6 max-w-xl w-full backdrop-blur-xl">
              <div className="flex-1">
                <div className="text-white font-bold text-sm">Unsaved Changes</div>
                <div className="text-neutral-400 text-xs">Careful, your configuration has been modified.</div>
              </div>
              <div className="flex gap-2">
                <button onClick={discardChanges} className="px-4 py-2 rounded-lg text-sm font-bold text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">Discard</button>
                <button onClick={saveChanges} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95">
                  <Save size={16} /> Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {isSaved && (
          <motion.div 
            initial={{ top: -50, opacity: 0 }}
            animate={{ top: 24, opacity: 1 }}
            exit={{ top: -50, opacity: 0 }}
            className="fixed left-1/2 -translate-x-1/2 bg-green-500 text-black px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 z-50"
          >
            <CheckCircle2 size={18} /> Settings Saved Successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// UI Helpers (Same as before)
function SettingsCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-neutral-900/60 border border-white/5 rounded-3xl p-6 h-full backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <Icon size={20} className="text-neutral-400" />
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
function InputGroup({ label, desc, children }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline"><label className="text-sm font-bold text-neutral-200">{label}</label></div>
      {children}
      <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}
function Switch({ active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-12 h-7 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-neutral-700'}`}>
      <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: active ? 20 : 0 }} />
    </button>
  );
}
function Toggle({ left, right, state, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-neutral-800 border border-white/10 rounded-lg flex items-center p-1">
      <span className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!state ? 'bg-neutral-600 text-white' : 'text-neutral-500'}`}>{left}</span>
      <span className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${state ? 'bg-neutral-600 text-white' : 'text-neutral-500'}`}>{right}</span>
    </button>
  );
}