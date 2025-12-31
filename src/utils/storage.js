/**
 * CORE STORAGE UTILITY
 * Single source of truth for localStorage keys and access patterns.
 */

export const STORAGE_KEYS = {
  TIMETABLE_EVENTS: "bits_planner_timetable_events_v1",
  GYM_REGIME: "bits_planner_gym_regime_v1",
  EXPENSE_TRANSACTIONS: "bits_planner_transactions_v1",
  THEME_PREF: "bits_planner_theme_v1", // Future proofing
};

/**
 * Safely retrieve data from localStorage
 * @param {string} key - One of STORAGE_KEYS
 * @param {any} defaultValue - Fallback if key doesn't exist or error occurs
 */
export const loadFromStorage = (key, defaultValue) => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return defaultValue;
    return JSON.parse(serialized);
  } catch (err) {
    console.error(`[Storage Error] Failed to load ${key}:`, err);
    return defaultValue;
  }
};

/**
 * Safely save data to localStorage
 * @param {string} key - One of STORAGE_KEYS
 * @param {any} value - Data to serialize
 */
export const saveToStorage = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error(`[Storage Error] Failed to save ${key}:`, err);
    // In a real app, we might alert the user here if quota is exceeded
  }
};

/**
 * Clear specific key (Use with caution)
 */
export const clearStorageKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[Storage Error] Failed to clear ${key}:`, err);
  }
};