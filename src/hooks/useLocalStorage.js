import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../utils/storage";

export function useLocalStorage(key, initialValue) {
  // Load initial state strictly once on mount
  const [storedValue, setStoredValue] = useState(() => {
    return loadFromStorage(key, initialValue);
  });

  // Whenever state changes, persist to localStorage
  useEffect(() => {
    saveToStorage(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}