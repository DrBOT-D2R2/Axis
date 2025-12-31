import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import { parseICS } from "../utils/ics";
import { toDate, isSameDay } from "../utils/time";

export function useTimetable() {
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.TIMETABLE_EVENTS, []);
  // Format: { "CS F211": { present: 10, total: 12 } }
  const [attendance, setAttendance] = useLocalStorage("bits_attendance_v1", {});

  const importTimetable = (fileContent) => {
    try {
      const parsedEvents = parseICS(fileContent);
      if (parsedEvents.length === 0) { alert("No events found."); return; }
      setEvents(parsedEvents);
      alert(`Imported ${parsedEvents.length} events.`);
    } catch (error) { console.error(error); alert("Failed to parse."); }
  };

  const markAttendance = (courseCode, status) => {
    setAttendance(prev => {
      const current = prev[courseCode] || { present: 0, total: 0 };
      return {
        ...prev,
        [courseCode]: {
          present: status === 'present' ? current.present + 1 : current.present,
          total: current.total + 1
        }
      };
    });
  };

  const getTodayClasses = () => {
    const now = new Date();
    
    // 1. Check for Exams Today (Override Rule)
    const todayExams = events.filter(e => 
      isSameDay(toDate(e.start), now) && (e.slotType === "EXAM" || e.slotType === "MIDSEM" || e.slotType === "ENDSEM")
    );

    if (todayExams.length > 0) {
      return todayExams.sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    // 2. If no exams, show classes
    return events.filter(e => {
      const d = toDate(e.start);
      // Basic check: is it this recurring day?
      return e.isRecurring && d.getDay() === now.getDay() && !e.slotType.includes("EXAM");
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  const getUpcomingExams = () => {
    const now = new Date();
    return events
      .filter(e => (e.slotType === "EXAM" || e.slotType === "MIDSEM" || e.slotType === "ENDSEM") && new Date(e.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  return { events, attendance, importTimetable, getTodayClasses, markAttendance, getUpcomingExams, clearTimetable: () => setEvents([]) };
}