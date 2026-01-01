import React from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, Lock } from "lucide-react";

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--app-bg)] relative overflow-hidden p-6 transition-colors duration-500">
      
      {/* Ambient Royal Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--app-accent)] opacity-10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--app-accent)] opacity-5 blur-[150px] rounded-full pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-[var(--app-surface)] border border-[var(--app-border)] p-8 md:p-12 rounded-[2rem] shadow-2xl relative z-10 flex flex-col items-center text-center backdrop-blur-xl">
        
        {/* Logo Icon */}
        <div className="w-20 h-20 bg-[var(--app-surface-hover)] rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-[var(--app-border)] group">
          <Sparkles size={40} className="text-[var(--app-accent)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black text-[var(--app-text)] mb-3 font-heading tracking-tight">
          Axis<span className="text-[var(--app-accent)]">.</span>
        </h1>
        <p className="text-[var(--app-text-muted)] text-sm mb-12 font-medium max-w-xs leading-relaxed">
          Your personal life operating system. <br/> Sync your reality.
        </p>

        {/* Google Login Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-[var(--app-text)] hover:bg-[var(--app-text)]/90 text-[var(--app-bg)] font-bold text-lg rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-xl hover:shadow-2xl group relative overflow-hidden"
        >
          {/* Google Icon SVG */}
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
          <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 absolute right-6" />
        </button>

        {/* Footer */}
        <div className="mt-10 flex items-center gap-2 text-[10px] text-[var(--app-text-muted)] font-mono uppercase tracking-widest opacity-60">
          <Lock size={12} />
          <span>Secure & Encrypted</span>
        </div>
      </div>
    </div>
  );
}