import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "./useSettings";

export function useExpenses() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [expenses, setExpenses] = useState([]);
  const budgetLimit = settings.budgetLimit || 5000;
  const [isLoaded, setIsLoaded] = useState(false);

  // FETCH ON LOAD
  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        if (data) setExpenses(data);
      } catch (error) {
        console.error("Error loading expenses:", error.message);
      } finally {
        setIsLoaded(true);
      }
    };

    load();
  }, [user]);

  // ADD
  const addExpense = async (amount, category) => {
    if (!user || !amount) return;

    const newExpense = { 
      user_id: user.id, 
      amount: parseFloat(amount), 
      category: category, 
      date: new Date().toISOString() 
    };

    // Optimistic Update
    const tempId = Date.now();
    setExpenses(prev => [{ ...newExpense, id: tempId }, ...prev]);

    const { data, error } = await supabase.from('expenses').insert([newExpense]).select();

    if (data) {
      setExpenses(prev => prev.map(t => t.id === tempId ? data[0] : t));
    }
    if (error) {
      console.error("Sync error:", error);
      // Rollback on error
      setExpenses(prev => prev.filter(t => t.id !== tempId));
    }
  };

  // DELETE
  const deleteExpense = async (id) => {
    const original = [...expenses];
    setExpenses(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error("Delete error:", error);
      setExpenses(original); // Rollback
    }
  };

  return { 
    expenses, 
    budgetLimit, 
    addExpense, 
    deleteExpense, 
    isLoaded 
  };
}