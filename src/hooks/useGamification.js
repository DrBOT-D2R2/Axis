import { useLocalStorage } from "./useLocalStorage";

export function useGamification() {
  const [stats, setStats] = useLocalStorage("bits_gamification_v2", {
    streaks: { gym: 0, study: 0, budget: 0 },
    lastLog: { gym: null, study: null, budget: null },
    points: 0
  });

  const checkIn = (type) => {
    const today = new Date().toDateString();
    const last = stats.lastLog[type];

    if (last === today) return; // Already checked in

    // Calculate gap
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = stats.streaks[type];
    
    if (last === yesterday.toDateString()) {
      newStreak += 1; // Continued streak
    } else {
      newStreak = 1; // Reset or Start
    }

    setStats(prev => ({
      ...prev,
      streaks: { ...prev.streaks, [type]: newStreak },
      lastLog: { ...prev.lastLog, [type]: today },
      points: prev.points + 10
    }));
  };

  return { stats, checkIn };
}