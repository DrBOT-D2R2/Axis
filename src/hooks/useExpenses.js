import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";

export function useExpenses() {
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEYS.EXPENSE_TRANSACTIONS, []);
  // NEW: Store the monthly limit
  const [budgetLimit, setBudgetLimit] = useLocalStorage("bits_budget_limit_v1", 5000); 

  const addTransaction = (t) => {
    const newTransaction = { ...t, id: crypto.randomUUID(), date: new Date().toISOString() };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return { transactions, budgetLimit, setBudgetLimit, addTransaction, deleteTransaction };
}