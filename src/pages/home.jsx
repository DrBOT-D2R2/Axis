import React from "react";
import { Link } from "react-router-dom";
import { useTimetable } from "../hooks/useTimetable";
import { useGym } from "../hooks/useGym";
import { useSettings } from "../hooks/useSettings";
import { useGamification } from "../hooks/useGamification";
import { formatTime, formatDateShort, getDayName } from "../utils/time";
import { Calendar, Dumbbell, Check, X, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { getTodayClasses, markAttendance, getUpcomingExams, attendance } = useTimetable();
  const { getTodayCycleDay } = useGym(); 
  const { settings } = useSettings();
  const { stats, checkIn } = useGamification();
  
  const todayClasses = getTodayClasses();
  const upcomingExams = getUpcomingExams().slice(0, 3); // Top 3
  const currentGymDay = getTodayCycleDay(); 

  // Detect if today is an exam day
  const isExamDay = todayClasses.some(c => c.slotType.includes("EXAM"));

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-app-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-app-text">Good Morning, {settings.userName}</h1>
          <p className="text-app-text-muted text-sm mt-1">{getDayName(new Date())}, {formatDateShort(new Date())}</p>
        </div>
        <div className="flex gap-2">
            {/* Simple Streak Pills */}
            <div className="px-3 py-1 rounded-full bg-app-surface border border-app-border text-xs font-medium text-app-text">
                🔥 {stats.streaks.gym} Gym
            </div>
            <div className="px-3 py-1 rounded-full bg-app-surface border border-app-border text-xs font-medium text-app-text">
                ⚡ {stats.streaks.study || 0} Focus
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1: SCHEDULE & ATTENDANCE */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* UPCOMING EXAMS ALERT (Only if exams exist) */}
            {upcomingExams.length > 0 && (
                <div className="premium-card p-4 border-l-4 border-l-app-warning bg-app-warning/5">
                    <h3 className="text-sm font-bold text-app-warning uppercase tracking-wide mb-2 flex items-center gap-2">
                        <AlertTriangle size={14} /> Upcoming Exams
                    </h3>
                    <div className="space-y-2">
                        {upcomingExams.map(ex => (
                            <div key={ex.id} className="flex justify-between text-sm">
                                <span className="text-app-text font-medium">{ex.title}</span>
                                <span className="text-app-text-muted">{formatDateShort(ex.start)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TODAY'S CLASSES */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <h2 className="text-lg font-bold text-app-text">
                     {isExamDay ? "Exam Schedule" : "Today's Classes"}
                   </h2>
                </div>
                
                {todayClasses.length === 0 ? (
                    <div className="premium-card p-8 text-center text-app-text-muted">No classes scheduled today.</div>
                ) : (
                    todayClasses.map((cls, idx) => {
                        // Get attendance stats for this subject
                        const subjectName = cls.title.split("-")[0].trim(); // Extract "CS F211"
                        const stats = attendance[subjectName] || { present: 0, total: 0 };
                        const percent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;

                        return (
                            <div key={idx} className="premium-card p-4 flex gap-4 items-center group">
                                <div className="w-14 text-center">
                                    <div className="text-sm font-bold text-app-text">{formatTime(cls.start)}</div>
                                    <div className="text-[10px] text-app-text-muted">{cls.location}</div>
                                </div>
                                
                                <div className="flex-1 border-l border-app-border pl-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-app-text">{cls.title}</h3>
                                        {!isExamDay && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${percent < 75 ? 'bg-app-danger/20 text-app-danger' : 'bg-app-surface text-app-text-muted'}`}>
                                                {percent}% Att.
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-app-text-muted mt-0.5">{cls.slotType}</div>
                                </div>

                                {/* ATTENDANCE BUTTONS (Only show for classes, not exams) */}
                                {!isExamDay && (
                                    <div className="flex gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => markAttendance(subjectName, 'present')}
                                            className="p-2 rounded-lg hover:bg-app-success/20 text-app-success border border-app-border hover:border-app-success"
                                            title="Mark Present"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button 
                                            onClick={() => markAttendance(subjectName, 'absent')}
                                            className="p-2 rounded-lg hover:bg-app-danger/20 text-app-danger border border-app-border hover:border-app-danger"
                                            title="Mark Absent"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* COL 2: WORKOUT & INSIGHTS */}
        <div className="space-y-6">
            <div className="premium-card p-6 relative overflow-hidden h-[300px] flex flex-col">
                <div className="absolute top-0 right-0 p-24 bg-app-accent opacity-10 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h2 className="font-bold text-lg text-app-text flex items-center gap-2"><Dumbbell className="text-app-accent" size={18} /> Workout</h2>
                    <Link to="/gym" className="text-xs font-medium text-app-accent hover:underline">Open</Link>
                </div>

                <div className="flex-1 z-10">
                    <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Day {currentGymDay.dayIndex}</p>
                    <h3 className="text-3xl font-bold text-app-text mb-4">{currentGymDay.type}</h3>
                    
                    {currentGymDay.exercises.length > 0 ? (
                        <div className="space-y-2">
                             {currentGymDay.exercises.slice(0, 3).map((ex, i) => (
                                <div key={i} className="flex justify-between text-sm py-1 border-b border-app-border/50 last:border-0">
                                    <span className="text-app-text">{ex.name}</span>
                                    <span className="text-app-text-muted text-xs">{ex.sets}x{ex.reps}</span>
                                </div>
                             ))}
                        </div>
                    ) : (
                        <div className="text-app-text-muted text-sm italic">Rest and Recover.</div>
                    )}
                </div>

                <button 
                    onClick={() => checkIn('gym')} 
                    className="mt-4 w-full py-2.5 rounded-lg bg-app-accent/10 text-app-accent font-medium hover:bg-app-accent hover:text-white transition-all z-10 text-sm"
                >
                    Complete Session
                </button>
            </div>
        </div>

      </div>
    </motion.div>
  );
}