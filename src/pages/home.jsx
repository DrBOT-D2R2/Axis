import React, { useState, useEffect } from "react";
import { useTimetable } from "../hooks/useTimetable";
import { useGym } from "../hooks/useGym";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../hooks/useSettings";
import { supabase } from "../lib/supabase";
import { Clock, MapPin, CheckCircle2, XCircle, CalendarDays, Dumbbell, TrendingUp, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { todaysClasses, isLoaded: timetableLoaded } = useTimetable();
  const { getTodayCycleIndex, schedule, templates, isLoaded: gymLoaded, logSession, updateExercise } = useGym(); 
  const [localClasses, setLocalClasses] = useState([]);


  // Keep a local copy of classes to allow optimistic updates
  useEffect(() => {
    if (todaysClasses) setLocalClasses(todaysClasses);
  }, [todaysClasses]);

  const handleLogGym = async () => {
    if (!todayTemplate) return;
    if (window.confirm(`Log session for ${todayTemplate.name}?`)) {
      await logSession(todayTemplate);
    }
  };

  const markAttendance = async (eventId, status) => {
    // 1. Optimistic Update
    setLocalClasses(prev => prev.map(c => c.id === eventId ? { ...c, status } : c));

    // 2. Relational Update (events table)
    const { error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', eventId);
    
    if (error) {
      console.error("Attendance update failed:", error);
      // Rollback on error
      setLocalClasses(todaysClasses);
    }
  };

  const todayIndex = getTodayCycleIndex();
  const todaySchedule = schedule.find(s => s.dayIndex === todayIndex + 1);
  const todayTemplate = templates.find(t => t.id === todaySchedule?.templateId);

  if (!timetableLoaded || !gymLoaded) return <div className="h-full flex items-center justify-center text-text-muted font-heading animate-pulse">Initializing Axis...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-64 md:h-96 bg-accent/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text mb-1">
            Hola, <span className="text-accent">{settings?.userName || "Druhin"}</span> <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-text-muted text-sm font-medium">Your daily briefing.</p>
        </div>
        <Link to="/insights" className="premium-button bg-surface hover:bg-surface-hover !text-text shadow-sm border border-border !text-xs !py-2.5 !px-5 w-fit">
          <TrendingUp size={14} className="text-accent"/> View Insights
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LECTURE COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-muted font-heading">Academic Schedule</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
            {localClasses.length > 0 ? localClasses.map((cls, i) => (
              <div key={i} className={`group relative bg-surface border p-4 rounded-xl transition-all hover:shadow-lg flex flex-col justify-between h-full ${cls.status === 'present' ? 'border-emerald-500/50 bg-emerald-500/5' : cls.status === 'absent' ? 'border-rose-500/50 bg-rose-500/5' : 'border-border hover:border-accent/40'}`}>
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors line-clamp-1">{cls.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap ${cls.type === 'Lecture' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {cls.type === 'Lecture' ? 'LEC' : 'TUT'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted mb-4 font-mono">
                    <span className="flex items-center gap-1"><Clock size={12} className="text-accent"/> {cls.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-accent"/> {cls.room}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => markAttendance(cls.id, 'present')} 
                    className={`flex-1 py-2 rounded-lg transition-all text-[10px] font-bold flex justify-center items-center gap-1.5 ${cls.status === 'present' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}
                  >
                    <CheckCircle2 size={12}/> {cls.status === 'present' ? 'Attended' : 'Present'}
                  </button>
                  <button 
                    onClick={() => markAttendance(cls.id, 'absent')} 
                    className={`flex-1 py-2 rounded-lg transition-all text-[10px] font-bold flex justify-center items-center gap-1.5 ${cls.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white'}`}
                  >
                    <XCircle size={12}/> {cls.status === 'absent' ? 'Missed' : 'Absent'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl bg-surface/50">
                <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                    <CalendarDays className="text-text-muted" size={20}/>
                </div>
                <p className="text-xs font-medium text-text-muted">No classes scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* GYM COLUMN (8 cols) - COMPACT WEB LAYOUT */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
           <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent"/>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-muted font-heading">Physical Training</h2>
          </div>

          <div className="relative flex-1 bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row gap-8 overflow-hidden">
            
            {/* Left Panel: Info & Actions */}
            <div className="md:w-2/5 flex flex-col justify-between relative z-10 space-y-6">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                    <TrendingUp size={10}/> Cycle Day {todayIndex + 1}
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-black text-text tracking-tight leading-tight">
                    {todayTemplate ? todayTemplate.name : "Rest Day"}
                  </h3>
                  
                  <p className="text-sm text-text-muted font-medium max-w-xs">
                    {todayTemplate 
                      ? `${todayTemplate.exercises?.length || 0} exercises precision-engineered for growth.` 
                      : "Active recovery and metabolic restoration recommended today."}
                  </p>
               </div>

               {/* Background Watermark (Compact) */}
               <div className="absolute -top-10 -left-12 text-[12rem] md:text-[15rem] font-black text-text opacity-[0.03] select-none font-heading leading-none -z-10 pointer-events-none">
                  {(todayIndex + 1).toString().padStart(2, '0')}
               </div>

               {todayTemplate ? (
                 <button 
                   onClick={handleLogGym}
                   className="w-full py-4 bg-accent hover:opacity-90 text-bg font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                 >
                   <Play size={16} fill="currentColor"/> Log Session
                 </button>
               ) : (
                 <div className="p-4 bg-surface-hover rounded-xl border border-border">
                    <div className="flex items-center gap-2 text-text-muted">
                        <Dumbbell size={18}/>
                        <span className="text-sm font-medium">Rest is when the magic happens.</span>
                    </div>
                 </div>
               )}
            </div>

            {/* Right Panel: Exercise Grid */}
            <div className="md:w-3/5 border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-8">
              {todayTemplate ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full content-start overflow-y-auto pr-1 max-h-[400px] md:max-h-full custom-scrollbar">
                  {todayTemplate.exercises?.map((ex, i) => (
                    <div key={i} className="flex flex-col p-4 bg-bg rounded-xl border border-border hover:border-accent/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-text-muted font-mono font-bold tracking-tighter opacity-50">{String(i + 1).padStart(2, '0')}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-accent transition-colors"></div>
                      </div>
                      <span className="font-bold text-text text-sm mb-2 group-hover:text-accent transition-colors line-clamp-1" title={ex.name}>{ex.name}</span>
                      
                      {/* Interactive Inputs */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-text-muted mt-auto font-bold">
                        <div className="flex items-center bg-surface-hover px-2 py-1.5 rounded-lg border border-border/50 focus-within:border-accent/50 transition-colors">
                          <input type="number" value={ex.weight || ''} onChange={(e) => updateExercise(todayTemplate.id, i, 'weight', e.target.value)} placeholder="0" className="w-8 md:w-10 bg-transparent text-accent text-right outline-none placeholder-accent/30" />
                          <span className="opacity-60 uppercase text-[9px] ml-1">kg</span>
                        </div>
                        <div className="flex items-center bg-surface-hover px-2 py-1.5 rounded-lg border border-border/50 focus-within:border-accent/50 transition-colors">
                          <input type="number" value={ex.sets || ''} onChange={(e) => updateExercise(todayTemplate.id, i, 'sets', e.target.value)} className="w-6 md:w-8 bg-transparent text-accent text-right outline-none" />
                          <span className="opacity-60 uppercase text-[9px] ml-1">sets</span>
                        </div>
                        <div className="flex items-center bg-surface-hover px-2 py-1.5 rounded-lg border border-border/50 focus-within:border-accent/50 transition-colors">
                          <input type="number" value={ex.reps || ''} onChange={(e) => updateExercise(todayTemplate.id, i, 'reps', e.target.value)} className="w-6 md:w-8 bg-transparent text-accent text-right outline-none" />
                          <span className="opacity-60 uppercase text-[9px] ml-1">reps</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4 opacity-50 min-h-[250px]">
                  <Dumbbell size={48} strokeWidth={1.5}/>
                  <p className="text-sm font-medium">No training session today</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}