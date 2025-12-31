import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, Dumbbell, Wallet, Home, Settings } from "lucide-react";

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={20} /> },
    { path: "/timetable", label: "Timetable", icon: <Calendar size={20} /> },
    { path: "/gym", label: "Gym Plan", icon: <Dumbbell size={20} /> },
    { path: "/expenses", label: "Expenses", icon: <Wallet size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-[var(--app-surface)] border-r border-[var(--app-border)] transform transition-transform duration-200 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-[var(--app-border)]">
          {/* LOGO / BRAND */}
          <span className="text-2xl font-black text-[var(--app-text)] tracking-tighter">
            Axis<span className="text-[var(--app-accent)]">.</span>
          </span>
          <button onClick={closeSidebar} className="md:hidden ml-auto p-1 text-[var(--app-text)]">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all
                  ${isActive 
                    ? "bg-[var(--app-bg)] text-[var(--app-accent)] border border-[var(--app-border)] shadow-sm" 
                    : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]"
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 md:hidden flex items-center px-4 bg-[var(--app-surface)] border-b border-[var(--app-border)]">
          <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-[var(--app-text)]">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-[var(--app-text)]">
            {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
          </span>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[var(--app-bg)]">
          {children}
        </div>
      </main>
    </div>
  );
}