import React, { useRef } from "react";
import { useTimetable } from "../hooks/useTimetable";
import WeeklyGrid from "../components/WeeklyGrid";
import { Upload, Trash2, Info, FileText } from "lucide-react";

export default function Timetable() {
  const { events, importTimetable, clearTimetable } = useTimetable();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      importTimetable(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col space-y-6">
      
      {/* HEADER CARD - Now uses premium-card to sync with theme */}
      <div className="premium-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text)] tracking-tight">Academic Timetable</h1>
          <p className="text-sm text-[var(--app-text-muted)] flex items-center gap-2 mt-1">
            <FileText size={14} /> {events.length} events loaded
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-lg shadow-[var(--app-accent)]/20"
          >
            <Upload size={16} /> Import .ics
          </button>
          <input 
            type="file" 
            accept=".ics" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          
          {events.length > 0 && (
            <button 
              onClick={() => { if(confirm("Clear all timetable data?")) clearTimetable(); }}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[var(--app-border)] text-[var(--app-danger)] rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors text-sm font-medium"
            >
              <Trash2 size={16} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* GRID AREA */}
      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-surface)]/50">
          <Info className="text-[var(--app-text-muted)] mb-3" size={40} />
          <p className="text-[var(--app-text)] font-medium text-lg">No timetable imported</p>
          <p className="text-sm text-[var(--app-text-muted)] mt-1">Upload your BITS ERP .ics file to view your schedule</p>
        </div>
      ) : (
        <div className="flex-1 premium-card overflow-hidden relative shadow-none">
          <WeeklyGrid events={events} />
        </div>
      )}
    </div>
  );
}