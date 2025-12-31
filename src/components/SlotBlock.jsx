import { toHHMM } from "../utils/time";

export default function SlotBlock({ event }) {
  return (
    <div className={`slot ${event.type}`}>
      <div className="slot-title">{event.title}</div>
      <div className="slot-time">
        {toHHMM(event.start)} – {toHHMM(event.end)}
      </div>
    </div>
  );
}
