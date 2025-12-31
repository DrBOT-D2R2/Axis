import React from "react";
import { useSettings, THEMES } from "../hooks/useSettings";
import { User, Palette, Check } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-app-text">App Settings</h1>

      {/* IDENTITY SECTION */}
      <div className="bg-app-surface p-6 rounded-xl shadow-sm border border-app-border">
        <div className="flex items-center gap-3 mb-4 text-app-text">
          <User size={24} className="text-app-primary" />
          <h2 className="text-xl font-semibold">Identity</h2>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-app-text-muted uppercase">Display Name</label>
          <input 
            type="text" 
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            className="w-full p-3 bg-app-bg border border-app-border rounded-lg text-app-text focus:ring-2 focus:ring-app-primary outline-none"
            placeholder="Enter your name"
          />
          <p className="text-xs text-app-text-muted">This name will appear on your dashboard.</p>
        </div>
      </div>

      {/* THEME SECTION */}
      <div className="bg-app-surface p-6 rounded-xl shadow-sm border border-app-border">
        <div className="flex items-center gap-3 mb-6 text-app-text">
          <Palette size={24} className="text-app-primary" />
          <h2 className="text-xl font-semibold">Aesthetics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(THEMES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateSettings({ theme: key })}
              className={`
                flex items-center justify-between p-4 rounded-lg border transition-all
                ${settings.theme === key 
                  ? "border-app-primary bg-app-bg ring-1 ring-app-primary" 
                  : "border-app-border hover:bg-app-bg"}
              `}
            >
              <span className="text-app-text font-medium">{label}</span>
              {settings.theme === key && <Check size={16} className="text-app-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}