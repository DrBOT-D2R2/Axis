import React from "react";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../context/AuthContext";
import { Palette, LogOut, User, Moon, Sun, Wallet, Dumbbell } from "lucide-react";

// Expanded Theme List with Paired Light/Dark options
const THEMES = [
  // Base
  { id: 'graphite', name: 'Graphite', type: 'Dark', color: '#18181b', border: '#27272a' },
  { id: 'paper', name: 'Paper', type: 'Light', color: '#f5f5f4', border: '#d6d3cc' },

  // Crimson Pair
  { id: 'bloodlust', name: 'Bloodlust', type: 'Dark', color: '#0f0505', accent: '#f43f5e' },
  { id: 'bloodlust-light', name: 'Rose', type: 'Light', color: '#fff1f2', accent: '#e11d48' },

  // Purple Pair
  { id: 'obsidian', name: 'Obsidian', type: 'Dark', color: '#020005', accent: '#d8b4fe' },
  { id: 'obsidian-light', name: 'Lilac', type: 'Light', color: '#fdf4ff', accent: '#c084fc' },

  // Blue Pair
  { id: 'blueberry', name: 'Blueberry', type: 'Dark', color: '#020617', accent: '#3b82f6' },
  { id: 'blueberry-light', name: 'Sky', type: 'Light', color: '#f0f9ff', accent: '#0ea5e9' },

  // Green Pair
  { id: 'olive', name: 'Olive', type: 'Dark', color: '#050a05', accent: '#4ade80' },
  { id: 'olive-light', name: 'Sage', type: 'Light', color: '#f0fdf4', accent: '#65a30d' },
];

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { signOut } = useAuth();

  const handleThemeChange = (themeId) => {
    updateSettings({ theme: themeId });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSettings({ [name]: name === 'userName' ? value : Number(value) });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 text-text">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-text-muted font-medium">Configure your Axis OS experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

        {/* Left Column: Core Prefs */}
        <div className="space-y-6 md:space-y-8">

          {/* Identity Section */}
          <section className="premium-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <User size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Identity</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 font-mono">Display Name</label>
                <input 
                  type="text" 
                  name="userName"
                  value={settings.userName || ""} 
                  onChange={handleChange}
                  className="w-full text-base px-5 py-3.5 rounded-xl font-bold bg-bg border border-border focus:border-accent transition-all placeholder-text-muted outline-none"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          </section>

          {/* Budget Config */}
          <section className="premium-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <Wallet size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Financials</h2>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 font-mono">Monthly Budget (₹)</label>
              <input 
                type="number" 
                name="budgetLimit"
                value={settings.budgetLimit || 5000} 
                onChange={handleChange}
                className="w-full text-base px-5 py-3.5 rounded-xl font-bold bg-bg border border-border focus:border-accent transition-all placeholder-text-muted outline-none"
              />
            </div>
          </section>

          {/* Gym Config */}
          <section className="premium-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <Dumbbell size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Training</h2>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 font-mono">Microcycle Length (Days)</label>
              <select 
                name="gymCycleLength"
                value={settings.gymCycleLength || 14} 
                onChange={handleChange}
                className="w-full text-base px-5 py-3.5 rounded-xl font-bold bg-bg border border-border focus:border-accent transition-all outline-none appearance-none cursor-pointer"
              >
                <option value={7}>7 Days (Weekly)</option>
                <option value={10}>10 Days</option>
                <option value={14}>14 Days (Standard)</option>
                <option value={21}>21 Days</option>
                <option value={28}>28 Days</option>
              </select>
            </div>
          </section>

        </div>

        {/* Right Column: Aesthetics */}
        <div>
          <section className="premium-card p-6 md:p-8 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <Palette size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Aesthetics</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group overflow-hidden ${
                    settings.theme === theme.id 
                      ? 'border-accent bg-surface-hover shadow-lg shadow-accent/10 scale-[1.02]' 
                      : 'border-border bg-bg hover:border-text-muted/50 hover:-translate-y-1'
                  }`}
                >
                  {/* Theme Preview Circle */}
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full shadow-inner relative flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                    style={{ backgroundColor: theme.color }}
                  >
                    {theme.accent && (
                      <div 
                        className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-lg" 
                        style={{ backgroundColor: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }}
                      />
                    )}
                  </div>

                  <div className="text-center z-10">
                    <span className={`block font-bold text-xs ${settings.theme === theme.id ? 'text-accent' : 'text-text'}`}>
                      {theme.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted opacity-60 flex items-center justify-center gap-1 mt-1 font-mono">
                      {theme.type === 'Light' ? <Sun size={8}/> : <Moon size={8}/>} {theme.type}
                    </span>
                  </div>

                  {settings.theme === theme.id && (
                    <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

      </div>

      {/* Danger Zone */}
      <section className="pt-8 border-t border-border flex justify-end">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-rose-500/10 text-rose-500 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </section>
    </div>
  );
}