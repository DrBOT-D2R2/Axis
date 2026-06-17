import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, Dumbbell, Wallet, Home, Settings, Activity } from "lucide-react";

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/timetable", label: "Timetable", icon: <Calendar size={18} /> },
    { path: "/gym", label: "Training", icon: <Dumbbell size={18} /> },
    { path: "/expenses", label: "Ledger", icon: <Wallet size={18} /> },
    { path: "/insights", label: "Insights", icon: <Activity size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-bg flex transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed md:sticky top-0 h-screen z-50
          w-64 md:w-72 bg-surface/95 backdrop-blur-xl border-r border-border/50 transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-20 flex items-center px-8 border-b border-border/50">
          {/* LOGO / BRAND */}
          <Link to="/" onClick={closeSidebar} className="text-3xl font-black text-text tracking-tighter hover:opacity-80 transition-opacity">
            Axis<span className="text-accent">.</span>
          </Link>
          <button onClick={closeSidebar} className="md:hidden ml-auto p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-5 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 pt-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/50 font-mono">Core Modules</span>
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group
                  ${isActive 
                    ? "bg-accent/10 text-accent" 
                    : "text-text-muted hover:bg-surface-hover hover:text-text"
                  }
                `}
              >
                <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'} transition-transform duration-300`}>
                   {item.icon}
                </div>
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--app-accent)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-border/50 mt-auto">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-black text-xs">
                 OS
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-text">System Active</span>
                 <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   All nodes secure
                 </span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-bg relative">
        {/* Mobile Header */}
        <header className="h-16 md:hidden flex items-center justify-between px-4 bg-surface/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsOpen(true)} className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <span className="font-black text-text tracking-tight">
              {navItems.find(i => i.path === location.pathname)?.label || "Axis OS"}
            </span>
          </div>
          {/* Small mobile logo indicator */}
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Activity size={16}/>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}