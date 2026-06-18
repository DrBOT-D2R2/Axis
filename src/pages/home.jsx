import React, { useState, useEffect } from "react";
import { useTimetable } from "../hooks/useTimetable";
import { useGym } from "../hooks/useGym";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../hooks/useSettings";
import { supabase } from "../lib/supabase";
import { Clock, MapPin, CheckCircle2, XCircle, CalendarDays, Dumbbell, TrendingUp, Sparkles, Play, Activity, BookOpen, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { todaysClasses, isLoaded: timetableLoaded } = useTimetable();
  const { getTodayCycleIndex, schedule, templates, isLoaded: gymLoaded, logSession, updateExercise } = useGym(); 
  const [localClasses, setLocalClasses] = useState([]);

  // Telemetry State
  const [telemetry, setTelemetry] = useState({
    workouts: 0,
    volume: 0,
    classesAttended: 0,
    classesTotal: 0
  });

  // Keep a local copy of classes to allow optimistic updates
  useEffect(() => {
    if (todaysClasses) setLocalClasses(todaysClasses);
  }, [todaysClasses]);

  // Fetch Telemetry (Weekly)
  useEffect(() => {
    if (!user) return;
    const fetchTelemetry = async () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0,0,0,0);
      const startStr = startOfWeek.toISOString();

      // Gym
      const { data: gLogs } = await supabase.from('gym_logs').select('date, weight').eq('user_id', user.id).gte('date', startStr);
      let wCount = 0;
      let vol = 0;
      if (gLogs) {
        wCount = new Set(gLogs.map(l => new Date(l.date).toDateString())).size;
        vol = gLogs.reduce((acc, log) => acc + (log.weight || 0), 0); // Simplified volume
      }

      // Academic
      const { data: eLogs } = await supabase.from('events').select('status').eq('user_id', user.id).gte('start_time', startStr).lte('start_time', now.toISOString());
      let cAttended = 0;
      let cTotal = 0;
      if (eLogs) {
        cTotal = eLogs.filter(e => e.status !== 'cancelled').length;
        cAttended = eLogs.filter(e => e.status === 'present').length;
      }

      setTelemetry({ workouts: wCount, volume: vol, classesAttended: cAttended, classesTotal: cTotal });
    };
    fetchTelemetry();
  }, [user]);

  const handleLogGym = async () => {
    if (!todayTemplate) return;
    if (window.confirm(`Log session for ${todayTemplate.name}?`)) {
      await logSession(todayTemplate);
    }
  };

  const markAttendance = async (eventId, status) => {
    setLocalClasses(prev => prev.map(c => c.id === eventId ? { ...c, status } : c));
    const { error } = await supabase.from('events').update({ status }).eq('id', eventId);
    if (error) {
      console.error("Attendance update failed:", error);
      setLocalClasses(todaysClasses);
    }
  };

  const todayIndex = getTodayCycleIndex();
  const todaySchedule = schedule.find(s => s.dayIndex === todayIndex + 1);
  const todayTemplate = templates.find(t => t.id === todaySchedule?.templateId);

  if (!timetableLoaded || !gymLoaded) return (
    <div className="h-full flex flex-col items-center justify-center text-[var(--app-text-muted)] font-mono animate-pulse gap-3">
      <div className="w-5 h-5 border-2 border-[var(--app-text-muted)] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs uppercase tracking-widest">Booting Axis Core...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
      
      {/* HUD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--app-border)]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-[var(--app-text)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[var(--app-text-muted)] text-sm mt-1">
            Welcome back, {settings?.userName || "Operator"}.
          </p>
        </div>
        <div className="text-[10px] font-mono text-[var(--app-text-muted)] uppercase tracking-widest flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
           System Synced
        </div>
      </div>

      {/* ROW 1: WEEKLY TELEMETRY (Bento Box) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Telemetry 1 */}
        <div className="premium-card p-5">
           <div className="flex items-center gap-2 text-[var(--app-text-muted)] mb-3">
             <Activity size={14} />
             <span className="text-[10px] font-mono uppercase tracking-wider">Workouts</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-mono tracking-tighter">{telemetry.workouts}</span>
             <span className="text-[10px] text-[var(--app-text-muted)] font-mono">THIS WEEK</span>
           </div>
        </div>
        
        {/* Telemetry 2 */}
        <div className="premium-card p-5">
           <div className="flex items-center gap-2 text-[var(--app-text-muted)] mb-3">
             <Dumbbell size={14} />
             <span className="text-[10px] font-mono uppercase tracking-wider">Volume Load</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-mono tracking-tighter">{telemetry.volume.toLocaleString()}</span>
             <span className="text-[10px] text-[var(--app-text-muted)] font-mono">KG</span>
           </div>
        </div>

        {/* Telemetry 3 */}
        <div className="premium-card p-5">
           <div className="flex items-center gap-2 text-[var(--app-text-muted)] mb-3">
             <BookOpen size={14} />
             <span className="text-[10px] font-mono uppercase tracking-wider">Academic</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-mono tracking-tighter">{telemetry.classesAttended}</span>
             <span className="text-[10px] text-[var(--app-text-muted)] font-mono">/ {telemetry.classesTotal} ATTENDED</span>
           </div>
        </div>

        {/* Telemetry 4 */}
        <div className="premium-card p-5">
           <div className="flex items-center gap-2 text-[var(--app-text-muted)] mb-3">
             <Target size={14} />
             <span className="text-[10px] font-mono uppercase tracking-wider">Focus Block</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-mono tracking-tighter">0.0</span>
             <span className="text-[10px] text-[var(--app-text-muted)] font-mono">HOURS</span>
           </div>
        </div>
      </div>
      
      {/* ROW 2: MAIN COMMAND SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: TRAINING (60%) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--app-text-muted)] uppercase tracking-widest">Active Protocol</h2>
            <div className="text-[10px] font-mono bg-[var(--app-surface)] border border-[var(--app-border)] px-2 py-1 rounded text-[var(--app-accent)]">
               Day {todayIndex + 1}
            </div>
          </div>

          <div className="premium-card p-6 flex-1 flex flex-col">
             {todayTemplate ? (
               <>
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="text-3xl font-heading font-bold tracking-tight mb-1">{todayTemplate.name}</h3>
                     <p className="text-xs text-[var(--app-text-muted)]">{todayTemplate.exercises?.length || 0} Movements Scheduled</p>
                   </div>
                   <button 
                     onClick={handleLogGym}
                     className="premium-button-accent text-sm py-2 px-5"
                   >
                     <Zap size={14} fill="currentColor"/> Execute
                   </button>
                 </div>

                 <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {todayTemplate.exercises?.map((ex, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] hover:border-[var(--app-accent)] transition-colors">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                           <span className="text-[10px] font-mono text-[var(--app-text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                           <span className="font-medium text-sm line-clamp-1">{ex.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex items-center bg-[var(--app-surface)] px-2 py-1.5 rounded border border-[var(--app-border)]">
                            <input type="number" value={ex.weight || ''} onChange={(e) => updateExercise(todayTemplate.id, i, 'weight', e.target.value)} placeholder="0" className="w-10 bg-transparent text-[var(--app-text)] text-right outline-none text-xs font-mono" />
                            <span className="text-[9px] text-[var(--app-text-muted)] uppercase ml-1">kg</span>
                          </div>
                          <div className="flex items-center bg-[var(--app-surface)] px-2 py-1.5 rounded border border-[var(--app-border)]">
                            <input type="number" value={ex.sets || ''} onChange={(e) => updateExercise(todayTemplate.id, i, 'sets', e.target.value)} className="w-6 bg-transparent text-[var(--app-text)] text-right outline-none text-xs font-mono" />
                            <span className="text-[9px] text-[var(--app-text-muted)] uppercase ml-1">sets</span>
                          </div>
                          <div className="flex items-center bg-[var(--app-surface)] px-2 py-1.5 rounded border border-[var(--app-border)]">
                            <input type="number" value={ex.reps || ''} onChange={(e) => updateExercise(todayTemplate.id, i, 'reps', e.target.value)} className="w-6 bg-transparent text-[var(--app-text)] text-right outline-none text-xs font-mono" />
                            <span className="text-[9px] text-[var(--app-text-muted)] uppercase ml-1">reps</span>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-[var(--app-text-muted)] opacity-50 py-12 gap-3">
                 <Dumbbell size={32} strokeWidth={1} />
                 <p className="text-xs font-mono uppercase tracking-widest">Active Recovery Day</p>
               </div>
             )}
          </div>
        </div>

        {/* RIGHT: ACADEMIC (40%) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <h2 className="text-sm font-medium text-[var(--app-text-muted)] uppercase tracking-widest">Academic Schedule</h2>
          
          <div className="premium-card p-6 flex-1 bg-[var(--app-surface)]">
            <div className="space-y-3">
              {localClasses.length > 0 ? localClasses.map((cls, i) => (
                <div key={i} className={`p-4 rounded-lg border flex flex-col gap-3 transition-colors ${
                  cls.status === 'present' ? 'border-emerald-500/30 bg-emerald-500/5' : 
                  cls.status === 'absent' ? 'border-rose-500/30 bg-rose-500/5' : 
                  'border-[var(--app-border)] bg-[var(--app-bg)]'
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{cls.name}</h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)]">
                        {cls.type === 'Lecture' ? 'LEC' : 'TUT/LAB'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--app-text-muted)]">
                      <span className="flex items-center gap-1"><Clock size={10} className="text-[var(--app-accent)]"/> {cls.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} className="text-[var(--app-accent)]"/> {cls.room}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => markAttendance(cls.id, 'present')} 
                      className={`flex-1 py-1.5 rounded transition-all text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 ${cls.status === 'present' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-emerald-500/50 hover:text-emerald-500'}`}
                    >
                      <CheckCircle2 size={12}/> Present
                    </button>
                    <button 
                      onClick={() => markAttendance(cls.id, 'absent')} 
                      className={`flex-1 py-1.5 rounded transition-all text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 ${cls.status === 'absent' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-rose-500/50 hover:text-rose-500'}`}
                    >
                      <XCircle size={12}/> Absent
                    </button>
                  </div>
                </div>
              )) : (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center border border-dashed border-[var(--app-border)] rounded-lg bg-[var(--app-bg)]">
                  <CalendarDays className="text-[var(--app-text-muted)] mb-3 opacity-50" size={24}/>
                  <p className="text-xs font-medium text-[var(--app-text-muted)]">No mandatory sessions.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
