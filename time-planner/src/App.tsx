import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { attendees as allAttendees, BookingConflictError, createBooking, getBookings, rooms } from './api/mockApi';
import { Timeline } from './components/Timeline';
import { calculateFreeSlots } from './utils/freeSlots';
import type { Booking, FreeSlot } from './types';
import './styles.css';

const today = new Date().toISOString().slice(0, 10);
export default function App() {
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(30);
  const [selectedIds, setSelectedIds] = useState<string[]>(['u1', 'u2']);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const slots = useMemo(() => calculateFreeSlots(bookings, selectedIds, duration), [bookings, selectedIds, duration]);
  const chosenAttendees = useMemo(() => allAttendees.filter((a) => selectedIds.includes(a.id)), [selectedIds]);

  const refresh = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await getBookings(date, selectedIds);
      if (id === requestId.current) { setBookings(data); setSelectedSlotIndex(0); }
    } catch { if (id === requestId.current) setMessage('Could not load availability. Please try again.'); }
    finally { if (id === requestId.current) setLoading(false); }
  }, [date, selectedIds]);

  useEffect(() => { void refresh(); return () => { requestId.current += 1; }; }, [refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 10_000);
    const onVisibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, [refresh]);
  useEffect(() => { setSelectedSlotIndex((index) => Math.min(index, Math.max(0, slots.length - 1))); }, [slots.length]);

  const book = useCallback(async (slot: FreeSlot) => {
    if (!selectedIds.length) { setMessage('Choose at least one attendee.'); return; }
    setMessage('Booking…');
    try {
      const booking = await createBooking(date, slot.start, slot.end, selectedIds);
      const room = rooms.find((r) => r.id === booking.roomId);
      setMessage(`Booked ${formatTime(slot.start)}–${formatTime(slot.end)} in ${room?.name ?? 'a room'}.`);
      await refresh();
    } catch (error) {
      if (error instanceof BookingConflictError) { setMessage(error.message); await refresh(); }
      else setMessage(error instanceof Error ? error.message : 'Booking failed.');
    }
  }, [date, selectedIds, refresh]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (!slots.length) return;
        event.preventDefault();
        setSelectedSlotIndex((index) => (index + (event.key === 'ArrowRight' ? 1 : -1) + slots.length) % slots.length);
      } else if (event.key === 'Enter' && slots[selectedSlotIndex]) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'BUTTON') return;
        event.preventDefault(); void book(slots[selectedSlotIndex]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slots, selectedSlotIndex, book]);

  function toggleAttendee(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setMessage('');
  }
  return <main className="app-shell">
    <header className="hero"><div><p className="eyebrow">MEETING PLANNER</p><h1>Find a time that works.</h1><p className="subhead">Compare calendars and book a room in a few clicks.</p></div><div className="hero-icon" aria-hidden="true">◷</div></header>
    <section className="controls card">
      <label>Date<input type="date" value={date} onChange={(e) => { setDate(e.target.value); setMessage(''); }} /></label>
      <label>Meeting length<select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>{[15, 30, 45, 60, 90, 120].map((n) => <option value={n} key={n}>{n} minutes</option>)}</select></label>
      <div className="attendee-picker"><span className="field-label">Attendees ({selectedIds.length})</span><details><summary>{selectedIds.length ? `${selectedIds.length} people selected` : 'Choose attendees'}</summary><div className="attendee-options">{allAttendees.map((a) => <label key={a.id}><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleAttendee(a.id)} />{a.name}</label>)}</div></details></div>
      <button className="refresh-button" type="button" onClick={() => void refresh()} disabled={loading}>{loading ? 'Refreshing…' : '↻ Refresh'}</button>
    </section>
    <section className="summary-row"><div><h2>Availability</h2><p>{date} · 09:00–18:00 · {selectedIds.length} attendees</p></div><div className="slot-count"><strong>{slots.length}</strong><span>available slots</span></div></section>
    <section className="card timeline-card"><div className="timeline-heading"><div><h3>Daily timeline</h3><p>Shaded blocks are busy; green blocks are shared free time.</p></div><span className="live-dot">Live · 10s refresh</span></div>
      {!selectedIds.length ? <div className="empty-state">Select one or more attendees to find common availability.</div> : <Timeline attendees={chosenAttendees} bookings={bookings} slots={slots} selected={selectedSlotIndex} onSelect={setSelectedSlotIndex} onBook={(slot) => void book(slot)} />}
      {message && <div className={`notice ${message.startsWith('Booked') ? 'success' : message.includes('conflict') || message.includes('booked by someone') ? 'warning' : ''}`} role="status">{message}</div>}
      <div className="bottom-actions"><span>Selected: {slots[selectedSlotIndex] ? `${formatTime(slots[selectedSlotIndex].start)}–${formatTime(slots[selectedSlotIndex].end)}` : 'None'}</span><button type="button" disabled={!slots[selectedSlotIndex] || !selectedIds.length} onClick={() => slots[selectedSlotIndex] && void book(slots[selectedSlotIndex])}>Book selected time <span aria-hidden="true">→</span></button></div>
    </section>
    <footer>Availability updates automatically while this tab is visible.</footer>
  </main>;
}
function formatTime(minutes: number) { return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`; }
