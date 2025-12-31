/**
 * TIME UTILITY
 * Strict date handling. 
 * Input: Date objects or ISO strings.
 * Output: Formatted strings or boolean checks.
 */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- NORMALIZE ---

/** Ensure we have a valid Date object */
export const toDate = (input) => {
  const date = new Date(input);
  if (isNaN(date.getTime())) return new Date(); // Fail safe to "now"
  return date;
};

// --- CHECKS ---

export const isSameDay = (d1, d2) => {
  const date1 = toDate(d1);
  const date2 = toDate(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isToday = (date) => isSameDay(date, new Date());

// --- FORMATTING ---

/** Returns "HH:MM" in 24h format */
export const formatTime = (date) => {
  const d = toDate(date);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

/** Returns "DD MMM" (e.g., "14 Nov") */
export const formatDateShort = (date) => {
  const d = toDate(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** Returns "Monday", "Tuesday", etc. */
export const getDayName = (date) => DAYS[toDate(date).getDay()];

// --- MANIPULATION ---

/** Get start of the current week (Monday) */
export const getStartOfWeek = (date = new Date()) => {
  const d = toDate(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Add days to a date (Immutable) */
export const addDays = (date, days) => {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return d;
};