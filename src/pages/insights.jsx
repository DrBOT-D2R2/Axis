import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { exportDataForAI } from "../utils/dataHelper";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, Dumbbell, BookOpen, Calendar, TrendingUp, Activity } from "lucide-react";

export default function Insights() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('academic');
  const [attendanceData, setAttendanceData] = useState([]);
  const [gymLogs, setGymLogs] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');

  useEffect(() => {
    if (user) {
      // 1. Fetch Attendance from Relational Events Table
      supabase.from('events').select('title, type, status').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            
            const normalizeSubject = (title) => {
              return title
                .replace(/\s+-\s+(Lecture|Tutorial|Practical|Lab).*$/i, '')
                .replace(/\s+([LTP]\d*)$/i, '')
                .trim();
            };

            const grouped = data.reduce((acc, curr) => {
              // Skip exams and non-class events
              if (curr.type === 'Exam' || curr.title.toLowerCase().includes('exam') || curr.title.toLowerCase().includes('compre')) return acc;
              
              const subject = normalizeSubject(curr.title);
              if (!acc[subject]) acc[subject] = { present: 0, total: 0 };
              
              // Count only if status is not 'cancelled'
              if (curr.status !== 'cancelled') {
                 acc[subject].total += 1;
                 if (curr.status === 'present') acc[subject].present += 1;
              }
              return acc;
            }, {});

            const chartData = Object.entries(grouped)
              .filter(([_, stats]) => stats.total > 0) // Ensure no divide by zero from 0 totals
              .map(([subject, stats]) => ({
                subject,
                present: stats.present,
                total: stats.total,
                percentage: Math.round((stats.present / stats.total) * 100)
              }));
            setAttendanceData(chartData);
          }
        });

      // 2. Fetch Gym Logs
      supabase.from('gym_logs').select('*').eq('user_id', user.id).order('date', { ascending: true })
        .then(({ data }) => setGymLogs(data || []));
    }
  }, [user]);

  // Attendance Chart Data
  const attendanceChartData = attendanceData;

  // Format Gym Data
  const uniqueExercises = [...new Set(gymLogs.map(log => log.exercise || log.exercise_name))];
  const gymChartData = gymLogs.filter(log => (log.exercise || log.exercise_name) === selectedExercise).map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
    weight: log.weight
  }));

  // Stats
  const avgAttendance = attendanceData.length > 0 
    ? Math.round(attendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceData.length) 
    : 0;

  const totalWorkouts = new Set(gymLogs.map(l => new Date(l.date).toDateString())).size;

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 text-text">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Intelligence Dashboard</h1>
          <p className="text-sm text-text-muted font-medium mt-1">Cross-domain performance analytics</p>
        </div>
        <button 
          onClick={() => exportDataForAI(attendanceData, gymLogs)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover text-text font-black text-xs uppercase tracking-widest rounded-xl border border-border shadow-sm transition-all active:scale-95 group"
        >
          <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Export for AI
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
         <div className="premium-card p-6 bg-surface flex items-center gap-5 border-l-4 border-l-accent">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
               <BookOpen size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest font-mono">Academic Avg.</p>
               <h3 className="text-2xl font-black">{avgAttendance}%</h3>
            </div>
         </div>

         <div className="premium-card p-6 bg-surface flex items-center gap-5 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
               <Calendar size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest font-mono">Total Workouts</p>
               <h3 className="text-2xl font-black">{totalWorkouts}</h3>
            </div>
         </div>

         <div className="premium-card p-6 bg-surface flex items-center gap-5 border-l-4 border-l-orange-500">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
               <TrendingUp size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest font-mono">Top Goal</p>
               <h3 className="text-2xl font-black">Consistency</h3>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-2xl border border-border w-fit">
        <button 
          onClick={() => setActiveTab('academic')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'academic' ? 'bg-bg text-accent shadow-lg border border-border' : 'text-text-muted hover:text-text'}`}
        >
          Education
        </button>
        <button 
          onClick={() => setActiveTab('gym')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'gym' ? 'bg-bg text-accent shadow-lg border border-border' : 'text-text-muted hover:text-text'}`}
        >
          Athletics
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[500px]">
        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-8 premium-card p-6 md:p-8 bg-surface shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full"></div>
              <h3 className="text-[10px] font-black uppercase text-text-muted tracking-widest font-mono mb-8">Attendance Distribution</h3>
              <div className="h-[300px] md:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                    <XAxis dataKey="subject" stroke="var(--app-text-muted)" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 'bold'}} />
                    <YAxis stroke="var(--app-text-muted)" fontSize={10} tickLine={false} domain={[0, 100]} axisLine={false} tick={{fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: 'var(--app-bg)', opacity: 0.2}} contentStyle={{backgroundColor: 'var(--app-surface)', borderRadius: '12px', border:'1px solid var(--app-border)', fontWeight: 'bold', fontSize: '12px'}} />
                    <Bar dataKey="percentage" fill="var(--app-accent)" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Details List */}
            <div className="lg:col-span-4 premium-card p-6 md:p-8 bg-surface h-fit lg:sticky lg:top-8">
              <h3 className="text-[10px] font-black uppercase text-text-muted tracking-widest font-mono mb-6">Subject Inventory</h3>
              <div className="space-y-3">
                {attendanceChartData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-bg rounded-2xl border border-border group hover:border-accent/30 transition-all">
                    <div className="space-y-1">
                      <div className="font-black text-sm tracking-tight">{item.subject}</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-tighter font-mono">
                        {item.present} / {item.total} SESSIONS
                      </div>
                    </div>
                    <div className={`text-lg font-black font-mono ${item.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {item.percentage}%
                    </div>
                  </div>
                ))}
                {attendanceChartData.length === 0 && (
                   <div className="text-center py-10 opacity-30 text-[10px] font-black uppercase font-mono">No academic data found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gym' && (
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between premium-card p-4 md:p-6 bg-surface">
              <div className="flex items-center gap-3">
                 <Dumbbell size={20} className="text-accent"/>
                 <h3 className="text-sm font-black uppercase tracking-widest">Growth Analytics</h3>
              </div>
              <select 
                className="w-full sm:w-64 p-3 rounded-xl bg-bg border border-border font-black text-xs uppercase tracking-widest outline-none focus:border-accent transition-all cursor-pointer shadow-sm"
                onChange={(e) => setSelectedExercise(e.target.value)}
                value={selectedExercise}
              >
                <option value="">Select Movement</option>
                {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>

            <div className="premium-card p-6 md:p-10 bg-surface shadow-2xl relative overflow-hidden min-h-[450px]">
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 blur-[100px] rounded-full"></div>
              {selectedExercise ? (
                <>
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-lg md:text-2xl font-black tracking-tighter">{selectedExercise} Progression</h3>
                     <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] font-mono">Load Over Time (kg)</span>
                  </div>
                  <div className="h-[300px] md:h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gymChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                        <XAxis dataKey="date" stroke="var(--app-text-muted)" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 'bold'}} />
                        <YAxis stroke="var(--app-text-muted)" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 'bold'}} />
                        <Tooltip contentStyle={{backgroundColor: 'var(--app-surface)', borderRadius: '12px', border:'1px solid var(--app-border)', fontWeight: 'bold', fontSize: '12px'}} />
                        <Line type="monotone" dataKey="weight" stroke="var(--app-accent)" strokeWidth={4} dot={{r: 6, fill: 'var(--app-bg)', strokeWidth: 3}} activeDot={{r: 8, strokeWidth: 0}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted gap-6 opacity-40 py-20">
                  <Activity size={64} strokeWidth={1} className="animate-pulse" />
                  <p className="font-black text-xs uppercase tracking-[0.2em] text-center max-w-xs leading-relaxed">Select a movement from your arsenal to visualize your strength trajectory</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}