import { useMemo } from "react";
import { useExpenses } from "./useExpenses";
import { useGamification } from "./useGamification";

export function useInsights() {
  const { transactions } = useExpenses();
  const { streaks } = useGamification();

  const insights = useMemo(() => {
    const tips = [];
    
    // 1. Streak Analysis
    if (streaks.gym.count > 3) tips.push({ type: "success", msg: `🔥 Beast Mode: ${streaks.gym.count} day gym streak! Keep pushing.` });
    if (streaks.gym.count === 0 && streaks.gym.highest > 5) tips.push({ type: "danger", msg: "⚠️ You broke your gym streak. Get back in there today." });

    // 2. Spending Analysis
    const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
    const foodSpend = transactions.filter(t => t.category === "Food").reduce((acc, t) => acc + t.amount, 0);
    
    if (foodSpend > totalSpent * 0.4) {
      tips.push({ type: "warning", msg: "🍔 High Food Spend: You're eating 40% of your budget. Cook more?" });
    }

    // 3. Motivational Filler (if empty)
    if (tips.length === 0) {
      tips.push({ type: "neutral", msg: "🤖 System Optimal. Log your activities to generate insights." });
    }

    return tips;
  }, [transactions, streaks]);

  return insights;
}