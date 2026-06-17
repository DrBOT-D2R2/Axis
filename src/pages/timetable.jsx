import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Upload, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import ICAL from 'ical.js';

export default function Timetable() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [uploading, setUploading] = useState(false);

  // Helper: Get the Monday of the current week
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // 1. Fetch Events for the selected week
  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const startStr = currentWeekStart.toISOString();
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 7);
      const endStr = end.toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startStr)
        .lt('start_time', endStr)
        .order('start_time', { ascending: true });

      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);
    };

    fetchEvents();
  }, [user, currentWeekStart]);

  // 2. Handle .ics Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jcalData = ICAL.parse(event.target.result);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        const newEvents = [];

        const limit = new Date();
        limit.setMonth(limit.getMonth() + 4);

        vevents.forEach((ev) => {
          const eventObj = new ICAL.Event(ev);
          const summary = eventObj.summary;
          const location = eventObj.location || 'TBD';
          const type = summary.toLowerCase().includes('lab') ? 'Lab' : 
                       (summary.toLowerCase().includes('exam') ? 'Exam' : 'Lecture');

          if (eventObj.isRecurring()) {
            const iterator = eventObj.iterator();
            let next;
            while ((next = iterator.next()) && next.toJSDate() < limit) {
              const start = next.toJSDate();
              const duration = eventObj.duration.toSeconds() * 1000;
              const endTimestamp = start.getTime() + duration;

              newEvents.push({
                user_id: user.id,
                title: summary,
                start_time: start.toISOString(),
                end_time: new Date(endTimestamp).toISOString(),
                location: location,
                type: type,
                status: 'pending'
              });
            }
          } else {
            newEvents.push({
              user_id: user.id,
              title: summary,
              start_time: eventObj.startDate.toJSDate().toISOString(),
              end_time: eventObj.endDate.toJSDate().toISOString(),
              location: location,
              type: type,
              status: 'pending'
            });
          }
        });

        const { error } = await supabase.from('events').insert(newEvents);
        if (error) throw error;

        alert(`Success! Imported ${newEvents.length} classes.`);
        window.location.reload();

      } catch (err) {
        console.error(err);
        alert("Failed to parse file. Ensure it's a valid .ics file.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const updateStatus = async (id, status) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status } : ev));
    await supabase.from('events').update({ status }).eq('id', id);
  };

  const changeWeek = (offset) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentWeekStart(newDate);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const eventsByDay = Array(7).fill([]).map(() => []);

  events.forEach(ev => {
    const date = new Date(ev.start_time);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    eventsByDay[dayIndex] = [...eventsByDay[dayIndex], ev];
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-4 md:p-8 text-text">

      {/* Header & controls */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Academic Timetable</h1>
          <p className="text-sm text-text-muted font-medium mt-1">
            Week of {currentWeekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-surface p-1 rounded-xl border border-border shadow-sm">
            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-bg rounded-lg transition-colors text-text-muted hover:text-accent"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))} className="px-4 text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors">Today</button>
            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-bg rounded-lg transition-colors text-text-muted hover:text-accent"><ChevronRight size={18}/></button>
          </div>

          <label className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg ${uploading ? 'bg-surface text-text-muted opacity-50' : 'bg-accent text-bg hover:opacity-90 shadow-accent/20 active:scale-95'}`}>
            <Upload size={14}/> {uploading ? "Importing..." : "Sync .ics"}
            <input type="file" accept=".ics" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6">
        {days.map((dayName, idx) => {
          const dayEvents = eventsByDay[idx];
          const currentDayDate = new Date(currentWeekStart);
          currentDayDate.setDate(currentWeekStart.getDate() + idx);
          const isToday = currentDayDate.getTime() === today.getTime();

          return (
            <div key={dayName} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${isToday ? 'text-accent' : 'text-text-muted opacity-40'}`}>{dayName}</h3>
                 {isToday && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>}
              </div>

              <div className="flex flex-col gap-3">
                {dayEvents.length === 0 ? (
                  <div className="text-center py-12 opacity-20 text-[10px] font-black uppercase tracking-widest border border-dashed border-border rounded-2xl bg-surface/30">
                    No Classes
                  </div>
                ) : (
                  dayEvents.map(ev => {
                    const startTime = new Date(ev.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                    return (
                      <div key={ev.id} className={`group p-4 rounded-2xl border-2 transition-all hover:shadow-xl ${
                        ev.status === 'present' ? 'bg-emerald-500/5 border-emerald-500/30' :
                        ev.status === 'absent' ? 'bg-rose-500/5 border-rose-500/30' :
                        ev.status === 'cancelled' ? 'bg-surface border-border opacity-40' :
                        'bg-surface border-border/50 hover:border-accent/40'
                      }`}>

                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] font-black font-mono tracking-tighter ${ev.status === 'present' ? 'text-emerald-500' : ev.status === 'absent' ? 'text-rose-500' : 'text-accent opacity-70'}`}>
                            {startTime}
                          </span>
                          <span className="text-[9px] bg-bg px-2 py-0.5 rounded-lg text-text-muted border border-border font-black uppercase tracking-tighter shadow-sm">
                            {ev.location}
                          </span>
                        </div>

                        <div className="font-black text-sm leading-snug mb-4 group-hover:text-accent transition-colors line-clamp-2" title={ev.title}>
                          {ev.title}
                        </div>

                        <div className="flex gap-2 justify-end items-center">
                          {ev.status === 'present' ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                              <CheckCircle size={14}/> Attended
                            </div>
                          ) : ev.status === 'absent' ? (
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-tighter">
                              <XCircle size={14}/> Missed
                            </div>
                          ) : (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => updateStatus(ev.id, 'present')}
                                className="p-2 rounded-xl hover:bg-emerald-500 hover:text-white text-emerald-500 transition-all border border-emerald-500/20 shadow-sm"
                                title="Mark Present"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => updateStatus(ev.id, 'absent')}
                                className="p-2 rounded-xl hover:bg-rose-500 hover:text-white text-rose-500 transition-all border border-rose-500/20 shadow-sm"
                                title="Mark Absent"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}

                          {ev.status !== 'pending' && (
                            <button 
                              onClick={() => updateStatus(ev.id, 'pending')} 
                              className="text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-accent opacity-30 hover:opacity-100 ml-2 font-mono"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}