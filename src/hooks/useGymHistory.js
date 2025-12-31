import { useLocalStorage } from "./useLocalStorage";

export function useGymHistory() {
  // Format: [ { id: 123, exercise: "Bench Press", weight: 80, date: "2025-12-31" } ]
  const [history, setHistory] = useLocalStorage("bits_gym_history_v1", []);

  const logSet = (exerciseName, weight) => {
    const newLog = {
      id: Date.now(),
      exercise: exerciseName,
      weight: parseFloat(weight),
      date: new Date().toISOString()
    };
    setHistory([...history, newLog]);
  };

  const getHistoryForExercise = (exerciseName) => {
    return history
      .filter(h => h.exercise === exerciseName)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: h.weight
      }));
  };

  // Get Personal Best (Max Weight)
  const getPR = (exerciseName) => {
    const logs = history.filter(h => h.exercise === exerciseName);
    if (logs.length === 0) return 0;
    return Math.max(...logs.map(h => h.weight));
  };

  return { history, logSet, getHistoryForExercise, getPR };
}