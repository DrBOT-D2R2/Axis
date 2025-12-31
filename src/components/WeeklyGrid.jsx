import React from "react";
import { toDate } from "../utils/time";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function WeeklyGrid({ events }) {
  
  const getEventsForSlot = (dayName, hour) => {
    return events.filter(e => {
      const d = toDate(e.start);
      const eventDayIndex = d.getDay(); 
      const dayNameIndex = DAYS.indexOf(dayName) + 1; 
      const eventHour = d.getHours();
      return (
        e.isRecurring && 
        eventDayIndex === dayNameIndex && 
        eventHour === hour &&
        !e.slotType.includes("EXAM")
      );
    });
  };

  return (
    <div className="h-full overflow-auto bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)]">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] bg-[var(--app-surface)] border-b border-[var(--app-border)] sticky top-0 z-10">
          <div className="p-3 text-xs font-semibold text-app-text-muted text-center border-r border-[var(--app-border)]">TIME</div>
          {DAYS.map(day => (
            <div key={day} className="p-3 text-sm font-bold text-app-text text-center uppercase border-r border-[var(--app-border)] last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-[var(--app-border)] min-h-[100px]">
            {/* Time Label */}
            <div className="p-2 text-xs font-medium text-app-text-muted text-center border-r border-[var(--app-border)] bg-[var(--app-surface)]/50">
              {hour}:00
            </div>

            {/* Days */}
            {DAYS.map(day => {
              const slotEvents = getEventsForSlot(day, hour);
              return (
                <div key={`${day}-${hour}`} className="p-1 border-r border-[var(--app-border)] last:border-r-0 relative group hover:bg-[var(--app-surface-hover)] transition-colors">
                  {slotEvents.map(ev => (
                    <div 
                      key={ev.id}
                      className={`
                        p-2 rounded-md text-xs border mb-1 cursor-pointer transition-transform hover:scale-[1.02]
                        ${ev.slotType === "L" 
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"  /* Lecture */
                          : ev.slotType === "P" 
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400" /* Practical */
                            : "bg-orange-500/10 border-orange-500/20 text-orange-400" /* Tutorial */
                        }
                      `}
                    >
                      <div className="font-bold truncate opacity-90">{ev.title}</div>
                      <div className="opacity-75 truncate text-[10px]">{ev.location}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}