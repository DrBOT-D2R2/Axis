import React, { useState } from "react";
import { useGym } from "../hooks/useGym";
import { useGymHistory } from "../hooks/useGymHistory";
import ExerciseChart from "../components/ExerciseChart";
import { Plus, X, RotateCcw, Dumbbell, Trash2, TrendingUp, Save } from "lucide-react";

export default function Gym() {
  const { 
    schedule, templates, 
    assignTemplateToDay, createTemplate, updateTemplate, deleteTemplate,
    addExerciseToTemplate, updateExercise, removeExercise,
    getFullDayData, getTodayCycleIndex, restartCycle 
  } = useGym();

  const { logSet, getHistoryForExercise, getPR } = useGymHistory();

  // Navigation State
  const todayIndex = getTodayCycleIndex(); 
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex + 1);
  const [chartExercise, setChartExercise] = useState(null); // Tracks which chart is open
  
  const activeDayData = getFullDayData(activeDayIndex);

  // --- Handlers ---

  const handleCreateTemplate = () => {
    const name = prompt("Enter Template Name (e.g., 'Push Heavy'):");
    if (name) {
      const id = createTemplate(name);
      assignTemplateToDay(activeDayIndex, id); 
    }
  };

  const handleDeleteTemplate = (id) => {
    if (confirm("Delete this template?")) deleteTemplate(id);
  };

  const handleLogWeight = (ex) => {
    if (!ex.weight || ex.weight === "0") return;
    logSet(ex.name, ex.weight);
    alert(`Logged ${ex.weight}kg for ${ex.name}`);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto">
      
      {/* CHART OVERLAY */}
      {chartExercise && (
        <ExerciseChart 
          exerciseName={chartExercise} 
          data={getHistoryForExercise(chartExercise)} 
          onClose={() => setChartExercise(null)} 
        />
      )}

      {/* LEFT: Schedule */}
      <div className="w-full md:w-64 premium-card overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-[var(--app-border)] bg-[var(--app-surface)] flex justify-between items-center">
          <h2 className="font-bold text-[var(--app-text)]">14-Day Cycle</h2>
          <button onClick={restartCycle} className="text-xs text-[var(--app-accent)] hover:underline flex items-center gap-1">
             <RotateCcw size={10} /> Restart
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {schedule.map((day, idx) => {
            const isToday = idx === todayIndex;
            const tName = templates.find(t => t.id === day.templateId)?.name || "Rest";
            return (
              <button
                key={day.dayIndex}
                onClick={() => setActiveDayIndex(day.dayIndex)}
                className={`
                  w-full text-left px-4 py-3 border-b border-[var(--app-border)] flex items-center justify-between text-sm transition-colors
                  ${day.dayIndex === activeDayIndex 
                    ? "bg-[var(--app-bg)] text-[var(--app-accent)] font-medium border-l-4 border-l-[var(--app-accent)]" 
                    : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]"}
                  ${isToday ? "bg-[var(--app-accent)]/5" : ""}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>Day {day.dayIndex}</span>
                  {isToday && <span className="text-[10px] bg-[var(--app-accent)] text-white px-1.5 rounded">TODAY</span>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border truncate max-w-[90px] ${
                   day.templateId ? "bg-[var(--app-surface)] border-[var(--app-accent)] text-[var(--app-accent)]" : "bg-[var(--app-bg)] border-[var(--app-border)] text-[var(--app-text-muted)]"
                }`}>
                  {tName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Main Panel */}
      <div className="flex-1 premium-card flex flex-col overflow-hidden h-full">
        
        {/* HEADER */}
        <div className="p-6 border-b border-[var(--app-border)] bg-[var(--app-bg)]/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--app-text)]">Day {activeDayIndex}</h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">Configure your workout for this day.</p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                value={activeDayData.templateId || ""}
                onChange={(e) => assignTemplateToDay(activeDayIndex, e.target.value || null)}
                className="premium-input md:w-64 bg-[var(--app-surface)]"
              >
                <option value="">-- Rest Day --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={handleCreateTemplate} className="p-2 premium-card hover:bg-[var(--app-surface-hover)] text-[var(--app-accent)]">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* EDITOR */}
        {activeDayData.templateId ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-[var(--app-border)] bg-[var(--app-surface)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Dumbbell size={16} className="text-[var(--app-accent)]" />
                <input 
                  type="text" 
                  value={activeDayData.type}
                  onChange={(e) => updateTemplate(activeDayData.templateId, { name: e.target.value })}
                  className="font-bold text-[var(--app-text)] bg-transparent outline-none focus:border-b border-[var(--app-accent)] w-full md:w-auto"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addExerciseToTemplate(activeDayData.templateId)} className="flex items-center gap-1 text-xs bg-[var(--app-accent)] text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                  <Plus size={14} /> Add Ex
                </button>
                <button onClick={() => handleDeleteTemplate(activeDayData.templateId)} className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-danger)]">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[var(--app-bg)]">
              {activeDayData.exercises.length === 0 ? (
                <div className="text-center py-12 text-[var(--app-text-muted)]">No exercises. Add one to start.</div>
              ) : (
                activeDayData.exercises.map((ex, index) => (
                  <div key={ex.id} className="flex flex-col md:flex-row gap-3 items-center bg-[var(--app-surface)] p-3 rounded-lg border border-[var(--app-border)] shadow-sm group">
                    <span className="text-[var(--app-text-muted)] font-bold w-6 text-center">{index + 1}</span>
                    
                    {/* Name */}
                    <input 
                      type="text" 
                      value={ex.name} 
                      placeholder="Exercise Name"
                      onChange={(e) => updateExercise(activeDayData.templateId, ex.id, "name", e.target.value)}
                      className="flex-1 font-medium text-[var(--app-text)] bg-transparent outline-none placeholder-[var(--app-text-muted)] w-full md:w-auto"
                    />
                    
                    {/* Stats Group */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                      <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                        <input type="text" value={ex.sets} onChange={(e) => updateExercise(activeDayData.templateId, ex.id, "sets", e.target.value)} className="w-10 text-center bg-transparent border-b border-[var(--app-border)] focus:border-[var(--app-accent)] outline-none text-[var(--app-text)]" />
                        <span>sets</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                        <input type="text" value={ex.reps} onChange={(e) => updateExercise(activeDayData.templateId, ex.id, "reps", e.target.value)} className="w-10 text-center bg-transparent border-b border-[var(--app-border)] focus:border-[var(--app-accent)] outline-none text-[var(--app-text)]" />
                        <span>reps</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
                        <input 
                           type="text" 
                           value={ex.weight || ""} 
                           placeholder="0"
                           onChange={(e) => updateExercise(activeDayData.templateId, ex.id, "weight", e.target.value)} 
                           className="w-12 text-center bg-[var(--app-bg)] border border-[var(--app-border)] rounded focus:border-[var(--app-accent)] outline-none text-[var(--app-text)] font-bold py-1" 
                        />
                        <span>kg</span>
                      </div>
                    </div>

                    {/* Actions Group */}
                    <div className="flex items-center gap-2 border-l border-[var(--app-border)] pl-3">
                       <button onClick={() => handleLogWeight(ex)} title="Log Weight History" className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-success)] hover:bg-[var(--app-bg)] rounded-md transition-colors">
                          <Save size={16} />
                       </button>
                       <button onClick={() => setChartExercise(ex.name)} title="View Progress" className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:bg-[var(--app-bg)] rounded-md transition-colors">
                          <TrendingUp size={16} />
                       </button>
                       <button onClick={() => removeExercise(activeDayData.templateId, ex.id)} className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-danger)] transition-colors">
                          <X size={16} />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--app-text-muted)]">
            <div className="p-4 rounded-full bg-[var(--app-bg)] mb-4"><Dumbbell size={32} opacity={0.5} /></div>
            <p className="font-medium">Rest Day</p>
          </div>
        )}
      </div>
    </div>
  );
}