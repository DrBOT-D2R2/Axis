import React, { useState } from "react";
import { useGym } from "../hooks/useGym";
import { useGymHistory } from "../hooks/useGymHistory";
import { Edit2, RotateCcw, Plus, Trash2, Calendar, Dumbbell, ChevronRight, Activity } from "lucide-react";

export default function Gym() {
  const { 
    schedule, templates, getTodayCycleIndex, assignTemplateToDay, 
    updateTemplateName, addExercise, deleteExercise, updateExercise, resetCycle, isLoaded, logSession 
  } = useGym();

  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const todayIndex = getTodayCycleIndex();

  // Initialize selected template once loaded
  useEffect(() => {
    if (isLoaded && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [isLoaded, templates, selectedTemplateId]);

  const handleLogSession = async (template) => {
    if (window.confirm(`Log session for ${template.name}?`)) {
      await logSession(template);
    }
  };

  if (!isLoaded) return <div className="h-full flex items-center justify-center text-text-muted font-heading animate-pulse">Syncing Gym OS...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 text-text">

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-border/50">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tight flex items-center gap-3">
             Routine Manager
          </h1>
          <p className="text-sm text-text-muted flex items-center gap-2 font-medium">
            <Activity size={16} className="text-accent animate-pulse"/> 
            Adaptive {schedule.length}-day Training Architecture
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <button 
              onClick={resetCycle} 
              className="p-3 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-border/50 hover:border-rose-500/30 group" 
              title="Restart Cycle"
            >
              <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500"/>
            </button>

            <div className="bg-surface p-1 rounded-2xl border border-border flex flex-1 sm:flex-none">
                <button 
                  onClick={() => setActiveTab('schedule')} 
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-bg text-accent shadow-lg border border-border' : 'text-text-muted hover:text-text'}`}
                >
                    <Calendar size={14}/> Schedule
                </button>
                <button 
                  onClick={() => setActiveTab('editor')} 
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-bg text-accent shadow-lg border border-border' : 'text-text-muted hover:text-text'}`}
                >
                    <Edit2 size={14}/> Editor
                </button>
            </div>
        </div>
      </div>

      {/* SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {schedule.map((day) => {
            const isToday = day.dayIndex === todayIndex + 1;
            const assignedTemplate = templates.find(t => t.id === day.templateId);

            return (
              <div 
                key={day.dayIndex} 
                className={`relative p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col h-[200px] md:h-[220px] group ${
                  isToday 
                  ? "bg-surface border-accent shadow-[0_0_40px_-10px_var(--app-accent-glow)] ring-1 ring-accent/20 z-10 scale-[1.02]" 
                  : "bg-surface border-border/50 hover:border-accent/30 hover:-translate-y-1"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isToday ? "text-accent" : "text-text-muted opacity-50"}`}>
                      Day {String(day.dayIndex).padStart(2, '0')}
                    </span>
                    {isToday && <span className="text-[9px] font-black text-accent/60 uppercase tracking-tighter">Current Target</span>}
                  </div>
                  {isToday && <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <select 
                      className={`w-full bg-transparent text-xl font-black outline-none appearance-none cursor-pointer transition-colors ${!assignedTemplate ? 'text-text-muted/40 text-sm italic' : 'text-text group-hover:text-accent'}`}
                      value={day.templateId || ""} 
                      onChange={(e) => assignTemplateToDay(day.dayIndex, e.target.value)}
                    >
                      <option value="">Rest & Recover</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                   <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                      {assignedTemplate ? `${assignedTemplate.exercises?.length || 0} Movements` : "Active Rest"}
                   </div>
                   {isToday && assignedTemplate && (
                      <button 
                        onClick={() => handleLogSession(assignedTemplate)}
                        className="p-2 bg-accent text-bg rounded-lg hover:scale-110 transition-transform shadow-lg shadow-accent/20"
                      >
                         <Play size={12} fill="currentColor"/>
                      </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDITOR VIEW */}
      {activeTab === 'editor' && (
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 min-h-[600px]">

          {/* Routine Sidebar */}
          <div className="lg:w-1/4 bg-surface rounded-3xl border border-border p-4 md:p-6 flex flex-col gap-3 h-fit max-h-[400px] lg:max-h-none overflow-y-auto custom-scrollbar sticky top-8">
            <div className="flex items-center justify-between mb-2 px-2">
               <h3 className="text-[10px] font-black uppercase text-text-muted tracking-widest font-mono">My Arsenal</h3>
               <span className="text-[10px] font-black text-accent">{templates.length}</span>
            </div>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center group ${selectedTemplateId === template.id ? 'bg-bg border-accent text-text' : 'bg-transparent border-transparent text-text-muted hover:bg-bg hover:border-border/50'}`}
              >
                <span className="font-black text-sm tracking-tight">{template.name}</span>
                <ChevronRight size={16} className={`transition-transform duration-300 ${selectedTemplateId === template.id ? 'text-accent translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}/>
              </button>
            ))}
          </div>

          {/* Movement Editor */}
          <div className="lg:w-3/4 bg-surface rounded-3xl border border-border p-6 md:p-10 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

            {selectedTemplateId ? (
              <>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10 pb-8 border-b border-border/50 relative z-10">
                   <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest font-mono block">Routine Identity</label>
                       <input 
                          className="text-3xl md:text-5xl font-black bg-transparent outline-none text-text placeholder-text-muted/30 w-full tracking-tighter focus:text-accent transition-colors"
                          value={templates.find(t => t.id === selectedTemplateId)?.name}
                          onChange={(e) => updateTemplateName(selectedTemplateId, e.target.value)}
                          placeholder="e.g., Push Hypertrophy"
                       />
                   </div>
                </div>

                <div className="flex-1 space-y-3 relative z-10 pr-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                  {templates.find(t => t.id === selectedTemplateId)?.exercises?.map((ex, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-4 items-center p-4 md:p-5 bg-bg/50 backdrop-blur-sm rounded-2xl border border-border/50 group hover:border-accent/40 hover:bg-bg transition-all">
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <span className="text-accent font-black font-mono text-xs w-6 opacity-40">{String(i + 1).padStart(2, '0')}</span>
                        <input 
                          className="flex-1 bg-transparent font-bold text-base md:text-lg outline-none text-text placeholder-text-muted/50 w-full" 
                          value={ex.name} 
                          onChange={(e) => updateExercise(selectedTemplateId, i, 'name', e.target.value)} 
                          placeholder="Movement Name"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex-1 sm:w-20 bg-surface rounded-xl p-2 border border-border flex flex-col items-center group-hover:border-accent/20 transition-colors">
                           <span className="text-[8px] text-text-muted font-black uppercase tracking-tighter">Sets</span>
                           <input className="w-full bg-transparent text-center text-sm font-black outline-none text-accent" value={ex.sets} onChange={(e) => updateExercise(selectedTemplateId, i, 'sets', e.target.value)}/>
                        </div>

                        <div className="flex-1 sm:w-20 bg-surface rounded-xl p-2 border border-border flex flex-col items-center group-hover:border-accent/20 transition-colors">
                           <span className="text-[8px] text-text-muted font-black uppercase tracking-tighter">Reps</span>
                           <input className="w-full bg-transparent text-center text-sm font-black outline-none text-accent" value={ex.reps} onChange={(e) => updateExercise(selectedTemplateId, i, 'reps', e.target.value)}/>
                        </div>

                        <button 
                          onClick={() => deleteExercise(selectedTemplateId, i)} 
                          className="p-3 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all sm:opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => addExercise(selectedTemplateId)} 
                    className="w-full py-6 border-2 border-dashed border-border rounded-2xl text-text-muted font-black text-xs uppercase tracking-widest hover:border-accent hover:text-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-3 mt-6 group"
                  >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300"/> Add Movement
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4 opacity-30">
                <Dumbbell size={64} strokeWidth={1}/>
                <p className="font-black text-xs uppercase tracking-[0.2em]">Select an Arsenal Routine</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}