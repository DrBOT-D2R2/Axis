import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useTimetable() {
  const { user } = useAuth();
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setIsLoaded(true); return; }

    const fetchAndMigrate = async () => {
      try {
        // 1. Check if relational events exist for today or future
        const { data: existingEvents, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        if (fetchError) throw fetchError;

        // 2. MIGRATION BRIDGE: If no relational events exist, try to migrate from legacy JSON
        if (!existingEvents || existingEvents.length === 0) {
          const { data: userData } = await supabase
            .from('user_data')
            .select('timetable_json')
            .eq('user_id', user.id)
            .single();

          if (userData?.timetable_json) {
            console.log("Migrating legacy timetable to relational events...");
            await migrateLegacyToRelational(user.id, userData.timetable_json);
          }
        }

        // 3. FETCH TODAY'S CLASSES FROM RELATIONAL TABLE
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
          .order('start_time', { ascending: true });

        if (events) {
          const formatted = events.map(ev => ({
            id: ev.id,
            name: ev.title,
            time: new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            room: ev.location,
            type: ev.type,
            status: ev.status
          }));
          setTodaysClasses(formatted);
        }
      } catch (err) {
        console.error("Timetable sync failed:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchAndMigrate();
  }, [user]);

  // Helper: Migration Logic
  const migrateLegacyToRelational = async (userId, raw) => {
    try {
      const tMap = raw.timetable ? raw.timetable : raw;
      const newEvents = [];
      const now = new Date();

      // Expand for the next 7 days starting from Monday of this week
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      for (let i = 0; i < 14; i++) { // Migrate 2 weeks
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const jsDay = currentDate.getDay();
        const cycleDay = jsDay === 0 ? 7 : jsDay;

        const dayClasses = tMap[cycleDay] || tMap[String(cycleDay)] || [];

        dayClasses.forEach(cls => {
          // Parse "09:00" format
          const [hours, minutes] = cls.time.split(':').map(Number);
          const startTime = new Date(currentDate);
          startTime.setHours(hours, minutes, 0, 0);

          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1); // Default 1hr duration

          newEvents.push({
            user_id: userId,
            title: cls.name,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            location: cls.room,
            type: cls.type || 'Lecture',
            status: 'pending'
          });
        });
      }

      if (newEvents.length > 0) {
        await supabase.from('events').insert(newEvents);
      }
    } catch (e) {
      console.error("Migration failed:", e);
    }
  };

  return { todaysClasses, isLoaded };
}