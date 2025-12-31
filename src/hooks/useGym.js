import { useLocalStorage } from "./useLocalStorage";

// Default Templates so you don't start empty
const DEFAULT_TEMPLATES = [
  { 
    id: "push_default", 
    name: "Push (Heavy)", 
    exercises: [
      { id: 1, name: "Bench Press", sets: "3", reps: "5" },
      { id: 2, name: "Overhead Press", sets: "3", reps: "8" },
      { id: 3, name: "Incline Dumbbell", sets: "3", reps: "10" }
    ] 
  },
  { 
    id: "pull_default", 
    name: "Pull (Volume)", 
    exercises: [
      { id: 4, name: "Pull Ups", sets: "3", reps: "AMRAP" },
      { id: 5, name: "Barbell Row", sets: "4", reps: "10" }
    ] 
  },
  { 
    id: "legs_default", 
    name: "Leg Day", 
    exercises: [
      { id: 6, name: "Squat", sets: "3", reps: "5" },
      { id: 7, name: "RDL", sets: "3", reps: "10" }
    ] 
  }
];

// 14 Days initialized to Rest
const DEFAULT_SCHEDULE = Array.from({ length: 14 }, (_, i) => ({
  dayIndex: i + 1,
  templateId: null // null means "Rest Day"
}));

export function useGym() {
  const [schedule, setSchedule] = useLocalStorage("bits_planner_schedule_v2", DEFAULT_SCHEDULE);
  const [templates, setTemplates] = useLocalStorage("bits_planner_templates_v2", DEFAULT_TEMPLATES);
  const [startDate, setStartDate] = useLocalStorage("bits_planner_gym_start_date_v1", new Date().toISOString());

  // --- TEMPLATE ACTIONS ---

  const createTemplate = (name) => {
    const newTemplate = { 
      id: crypto.randomUUID(), 
      name: name || "New Workout", 
      exercises: [] 
    };
    setTemplates([...templates, newTemplate]);
    return newTemplate.id;
  };

  const updateTemplate = (id, updates) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id) => {
    // 1. Remove from templates list
    setTemplates(templates.filter(t => t.id !== id));
    // 2. Remove assignments from schedule (revert those days to Rest)
    setSchedule(schedule.map(d => d.templateId === id ? { ...d, templateId: null } : d));
  };

  // --- EXERCISE ACTIONS ---

  const addExerciseToTemplate = (templateId) => {
    // ... inside addExerciseToTemplate ...
const newEx = { id: Date.now(), name: "", sets: "3", reps: "10", weight: "0" }; // Added weight

// ... inside updateExercise ...
// Ensure you allow updating the 'weight' field in the switch/logic (it's generic so it should work)
    const t = templates.find(t => t.id === templateId);
    if (!t) return;
    updateTemplate(templateId, { exercises: [...t.exercises, newEx] });
  };

  const updateExercise = (templateId, exId, field, value) => {
    const t = templates.find(t => t.id === templateId);
    if (!t) return;

    const updatedExercises = t.exercises.map(ex => 
      ex.id === exId ? { ...ex, [field]: value } : ex
    );
    updateTemplate(templateId, { exercises: updatedExercises });
  };

  const removeExercise = (templateId, exId) => {
    const t = templates.find(t => t.id === templateId);
    if (!t) return;

    const updatedExercises = t.exercises.filter(ex => ex.id !== exId);
    updateTemplate(templateId, { exercises: updatedExercises });
  };

  // --- SCHEDULE ACTIONS ---

  const assignTemplateToDay = (dayIndex, templateId) => {
    setSchedule(schedule.map(d => d.dayIndex === dayIndex ? { ...d, templateId } : d));
  };

  // --- HELPERS ---

  // Merges the Schedule (Day 1) with the Template (Legs) to give the UI full data
  const getFullDayData = (dayIndex) => {
    const day = schedule.find(d => d.dayIndex === dayIndex) || schedule[0];
    const template = templates.find(t => t.id === day.templateId);

    if (!template) {
      return { dayIndex: day.dayIndex, type: "Rest", exercises: [], templateId: null };
    }
    return { 
      dayIndex: day.dayIndex, 
      type: template.name, 
      exercises: template.exercises, 
      templateId: template.id 
    };
  };

  const getTodayCycleIndex = () => {
    try {
      const start = new Date(startDate);
      const now = new Date();
      start.setHours(0,0,0,0);
      now.setHours(0,0,0,0);
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      return ((diffDays % 14) + 14) % 14; 
    } catch (e) { return 0; }
  };

  const getTodayCycleDay = () => {
    const idx = getTodayCycleIndex();
    return getFullDayData(idx + 1);
  };

  const restartCycle = () => {
    if (confirm("Restart cycle from Day 1 today?")) {
      setStartDate(new Date().toISOString());
      window.location.reload();
    }
  };

  return {
    schedule,
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addExerciseToTemplate,
    updateExercise,
    removeExercise,
    assignTemplateToDay,
    getFullDayData,
    getTodayCycleIndex,
    getTodayCycleDay,
    restartCycle,
    resetRegime: () => { 
      if(confirm("Reset everything to default?")) { 
        setSchedule(DEFAULT_SCHEDULE); 
        setTemplates(DEFAULT_TEMPLATES); 
      } 
    }
  };
}