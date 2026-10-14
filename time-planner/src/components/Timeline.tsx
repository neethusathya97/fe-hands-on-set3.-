import type { Attendee, Booking, FreeSlot } from '../types';
import { DAY_END, DAY_START } from '../utils/freeSlots';

const minutesLabel = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
interface Props { attendees: Attendee[]; bookings: Booking[]; slots: FreeSlot[]; selected: number; onSelect: (index: number) => void; onBook: (slot: FreeSlot) => void }
export function Timeline({ attendees, bookings, slots, selected, onSelect, onBook }: Props) {
  const width = DAY_END - DAY_START;
  const place = (start: number, end: number) => ({ left: `${((Math.max(start, DAY_START) - DAY_START) / width) * 100}%`, width: `${((Math.min(end, DAY_END) - Math.max(start, DAY_START)) / width) * 100}%` });
  const selectedSlot = slots[selected];
  return <section className="timeline" aria-label="Availability timeline">
    <div className="time-axis"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span></div>
    {attendees.map((person) => <div className="timeline-row" key={person.id}>
      <div className="row-label">{person.name}</div><div className="track" aria-label={`${person.name} busy times`}>
        {bookings.filter((b) => b.attendees.includes(person.id)).map((b) => <div key={b.id} className="busy-block" style={place(b.start, b.end)} title={`${minutesLabel(b.start)}–${minutesLabel(b.end)}`} />)}
      </div>
    </div>)}
    <div className="timeline-row common-row"><div className="row-label">Common free slots</div><div className="track free-track" role="listbox" aria-label="Common free slots">
      {slots.map((slot, index) => <button key={`${slot.start}-${slot.end}`} type="button" role="option" aria-selected={selected === index} aria-label={`Free ${minutesLabel(slot.start)} to ${minutesLabel(slot.end)}`} className={`free-block ${selected === index ? 'selected' : ''}`} style={place(slot.start, slot.end)} onClick={() => { onSelect(index); onBook(slot); }} onFocus={() => onSelect(index)}>{minutesLabel(slot.start)}–{minutesLabel(slot.end)}</button>)}
      {slots.length === 0 && <span className="no-slots">No slots fit this duration</span>}
    </div></div>}
    <div className="keyboard-hint">Use ← / → to select a free slot and Enter to book it.</div>
    {selectedSlot && <p className="sr-only" aria-live="polite">Selected free slot {minutesLabel(selectedSlot.start)} to {minutesLabel(selectedSlot.end)}</p>}
  </section>;
}
