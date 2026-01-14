'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define what our settings look like
interface AppSettings {
  serverName: string;
  weatherCity: string; // Changed from Zip to City for easier API lookup
  refreshRate: number;
  animations: boolean;
  accentColor: 'blue' | 'purple' | 'green' | 'orange' | 'cyan';
  density: 'comfortable' | 'compact';
  showDebug: boolean;
  tempUnit: 'F' | 'C';
}

// Default values
const DEFAULTS: AppSettings = {
  serverName: 'HOMELAB-01',
  weatherCity: 'Conroe',
  refreshRate: 2000,
  animations: true,
  accentColor: 'blue',
  density: 'comfortable',
  showDebug: false,
  tempUnit: 'F'
};

const SettingsContext = createContext<any>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  // Load from LocalStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem('homelab_settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch (e) { console.error('Settings parse error'); }
    }
    setMounted(true);
  }, []);

  // Save to LocalStorage whenever settings change
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('homelab_settings', JSON.stringify(newSettings));
  };

  // Helper to get Tailwind classes based on the selected accent color
  const getTheme = () => {
    const colors: any = {
      blue: { text: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/30', glow: 'shadow-blue-500/50' },
      purple: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500/30', glow: 'shadow-purple-500/50' },
      green: { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/30', glow: 'shadow-green-500/50' },
      orange: { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/30', glow: 'shadow-orange-500/50' },
      cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/50' },
    };
    return colors[settings.accentColor] || colors.blue;
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);