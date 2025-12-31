import { toDate } from "./time";

// --- HELPERS ---

// ICS files wrap long lines. We must "unfold" them first.
const unfoldLines = (text) => {
  return text.replace(/\r\n[ \t]/g, "");
};

// Parse ICS date format: 20231006T143000Z or 20231006T090000
const parseICSDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Remove 'Z' if present (treat as UTC if Z exists, else local)
  const isUTC = dateStr.endsWith("Z");
  const cleanStr = dateStr.replace("Z", "");
  
  const y = parseInt(cleanStr.substring(0, 4));
  const m = parseInt(cleanStr.substring(4, 6)) - 1; // Months are 0-indexed
  const d = parseInt(cleanStr.substring(6, 8));
  const h = parseInt(cleanStr.substring(9, 11));
  const min = parseInt(cleanStr.substring(11, 13));
  const s = parseInt(cleanStr.substring(13, 15));

  if (isUTC) {
    return new Date(Date.UTC(y, m, d, h, min, s));
  }
  return new Date(y, m, d, h, min, s);
};

// Detect academic slot type based on Summary/Title
const detectSlotType = (summary) => {
  const s = summary ? summary.toUpperCase() : "";
  if (s.includes("MIDSEM") || s.includes("QUIZ") || s.includes("TEST")) return "EXAM";
  if (s.includes("COMPRE") || s.includes("ENDSEM")) return "EXAM";
  if (s.includes(" L ") || s.includes("LECTURE")) return "L";
  if (s.includes(" T ") || s.includes("TUTORIAL")) return "T";
  if (s.includes(" P ") || s.includes("PRACTICAL") || s.includes("LAB")) return "P";
  return "L"; // Default fallback
};

// --- MAIN PARSER ---

export const parseICS = (icsContent) => {
  if (!icsContent) return [];
  const unfolded = unfoldLines(icsContent);
  const lines = unfolded.split(/\r\n|\n|\r/);
  
  const events = [];
  let currentEvent = null;
  let insideEvent = false;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = { raw: {} };
      insideEvent = true;
      continue;
    }

    if (line.startsWith("END:VEVENT")) {
      insideEvent = false;
      if (currentEvent) {
        // Normalize immediately upon closing the block
        const start = parseICSDate(currentEvent.raw["DTSTART"]);
        const end = parseICSDate(currentEvent.raw["DTEND"]);
        const summary = currentEvent.raw["SUMMARY"] || "Unknown Event";
        
        if (start && end) {
           events.push({
            id: currentEvent.raw["UID"] || `${start.getTime()}-${Math.random()}`,
            title: summary,
            location: currentEvent.raw["LOCATION"] || "",
            description: currentEvent.raw["DESCRIPTION"] || "",
            start: start, // Keep as Date object
            end: end,     // Keep as Date object
            slotType: detectSlotType(summary),
            isRecurring: !!currentEvent.raw["RRULE"],
            rrule: currentEvent.raw["RRULE"]
          });
        }
      }
      currentEvent = null;
      continue;
    }

    if (insideEvent) {
      // Split "KEY:VALUE" safely
      const colonIndex = line.indexOf(":");
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).split(";")[0]; 
        const value = line.substring(colonIndex + 1);
        currentEvent.raw[key] = value;
      }
    }
  }

  return events;
};