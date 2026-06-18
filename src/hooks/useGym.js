import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "./useSettings";

export function useGym() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [templates, setTemplates] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const cycleLength = settings.gymCycleLength || 14;

  useEffect(() => {
    if (!user) { setIsLoaded(true); return; }
    const loadData = async () => {
      const { data } = await supabase.from('gym_data').select('*').eq('user_id', user.id).single();
      if (data) {
        setTemplates(data.templates || []);
        let dbSchedule = data.schedule || [];
        // Ensure schedule length matches cycleLength immediately on load
        if (dbSchedule.length === 0) {
          dbSchedule = Array.from({ length: cycleLength }, (_, i) => ({ dayIndex: i + 1, templateId: null }));
        } else if (dbSchedule.length > cycleLength) {
          dbSchedule = dbSchedule.slice(0, cycleLength);
        } else if (dbSchedule.length < cycleLength) {
          const extra = Array.from({ length: cycleLength - dbSchedule.length }, (_, i) => ({ dayIndex: dbSchedule.length + i + 1, templateId: null }));
          dbSchedule = [...dbSchedule, ...extra];
        }
        setSchedule(dbSchedule);
      } else {
        setSchedule(Array.from({ length: cycleLength }, (_, i) => ({ dayIndex: i + 1, templateId: null })));
      }
      setIsLoaded(true);
    };
    loadData();
  }, [user]); // Removed cycleLength from dep array to prevent re-fetching on setting change

  // Watch for cycleLength changes dynamically (e.g. user changes setting in UI)
  useEffect(() => {
    if (isLoaded && schedule.length > 0 && schedule.length !== cycleLength) {
      let newS = [...schedule];
      if (newS.length > cycleLength) {
        newS = newS.slice(0, cycleLength);
      } else if (newS.length < cycleLength) {
        const extra = Array.from({ length: cycleLength - newS.length }, (_, i) => ({ dayIndex: newS.length + i + 1, templateId: null }));
        newS = [...newS, ...extra];
      }
      setSchedule(newS);
      saveToCloud(templates, newS);
    }
  }, [cycleLength, isLoaded]); // Resizes schedule automatically when setting changes


  const saveToCloud = async (newT, newS) => {
    if (!user) return;
    await supabase.from('gym_data').upsert({ user_id: user.id, templates: newT, schedule: newS });
  };

  // --- CYCLE LOGIC (Fixed) ---
  const getTodayCycleIndex = () => {
    // Uses LocalStorage to allow resetting the cycle without changing DB schema
    const startEpoch = parseInt(localStorage.getItem('gym_cycle_start') || '0');
    const currentEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    
    // If startEpoch is 0 (first run), we just use standard epoch
    // Otherwise, we offset by the start date to make that day "Day 1" (Index 0)
    let dayDiff = currentEpoch - startEpoch;
    if (startEpoch === 0) dayDiff = currentEpoch;
    
    // Ensure positive modulo
    return ((dayDiff % cycleLength) + cycleLength) % cycleLength; 
  };

  const resetCycle = () => {
    if (window.confirm(`Restart the ${cycleLength}-day cycle to Day 1 starting today?`)) {
      const currentEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      localStorage.setItem('gym_cycle_start', currentEpoch.toString());
      window.location.reload(); // Reload to reflect changes immediately
    }
  };

  // --- SCHEDULING ---
  const assignTemplateToDay = (dayIndex, templateId) => {
    const newSched = schedule.map(d => d.dayIndex === dayIndex ? { ...d, templateId } : d);
    setSchedule(newSched);
    saveToCloud(templates, newSched);
  };

  // --- EDITING ---
  const updateTemplateName = (id, newName) => {
    const newT = templates.map(t => t.id === id ? { ...t, name: newName } : t);
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const addExercise = (templateId) => {
    const newT = templates.map(t => {
      if (t.id === templateId) {
        return { 
          ...t, 
          exercises: [...(t.exercises || []), { name: "New Exercise", sets: 3, reps: 10, weight: 0 }] 
        };
      }
      return t;
    });
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const updateExercise = (templateId, index, field, value) => {
    const newT = templates.map(t => {
      if (t.id === templateId) {
        const newEx = [...(t.exercises || [])];
        newEx[index] = { ...newEx[index], [field]: value };
        return { ...t, exercises: newEx };
      }
      return t;
    });
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const deleteExercise = (templateId, index) => {
    const newT = templates.map(t => {
      if (t.id === templateId) {
        const newEx = [...(t.exercises || [])];
        newEx.splice(index, 1);
        return { ...t, exercises: newEx };
      }
      return t;
    });
    setTemplates(newT);
    saveToCloud(newT, schedule);
  };

  const logSession = async (template) => {
    if (!user || !template) return;
    
    const logs = (template.exercises || []).map(ex => ({
      user_id: user.id,
      exercise: ex.name,
      weight: parseFloat(ex.weight || 0), // Default to 0 if not set
      date: new Date().toISOString()
    }));

    if (logs.length > 0) {
      const { error } = await supabase.from('gym_logs').insert(logs);
      if (error) console.error("Failed to log gym session:", error);
      else alert(`${template.name} session logged!`);
    }
  };

  return { 
    schedule, templates, isLoaded, 
    getTodayCycleIndex, resetCycle,
    assignTemplateToDay, updateTemplateName, 
    addExercise, updateExercise, deleteExercise,
    logSession
  };
}