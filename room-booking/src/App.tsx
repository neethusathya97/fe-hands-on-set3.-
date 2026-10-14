import { useCallback, useEffect, useState } from 'react';
import { bookingApi, rooms } from './api/bookingApi';
import { BookingForm } from './components/BookingForm';
import { BookingList } from './components/BookingList';
import type { Booking, BookingDraft } from './types';
import './styles.css';

const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
function getInitialSelection() {
  const params = new URLSearchParams(window.location.search);
  const room = rooms.some(item => item.id === params.get('room')) ? params.get('room')! : 'atlas';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date')! : localDate(new Date());
  return { room, date };
}
export default function App() {
  const initial = getInitialSelection();
  const [room, setRoom] = useState(initial.room);
  const [date, setDate] = useState(initial.date);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [cancelError, setCancelError] = useState('');
  useEffect(() => { const params = new URLSearchParams(window.location.search); params.set('room', room); params.set('date', date); window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`); }, [room, date]);
  const refresh = useCallback(async () => {
    setLoading(true); setPageError('');
    try { setBookings(await bookingApi.getBookings(room, date)); }
    catch (error) { setPageError(error instanceof Error ? error.message : 'Unable to load bookings.'); }
    finally { setLoading(false); }
  }, [room, date]);
  useEffect(() => { void refresh(); }, [refresh]);
  const create = async (draft: BookingDraft) => { await bookingApi.createBooking(draft); await refresh(); };
  const cancel = async (booking: Booking) => {
    if (!window.confirm(`Cancel “${booking.title}”? This action cannot be undone.`)) return;
    setCancelError(''); setBookings(current => current.filter(item => item.id !== booking.id));
    try { await bookingApi.cancelBooking(booking.id); }
    catch (error) { setBookings(current => [...current, booking].sort((a, b) => a.start.localeCompare(b.start))); setCancelError(error instanceof Error ? error.message : 'Unable to cancel booking.'); }
  };
  return <div id="app"><header className="topbar"><div className="brand"><div className="logo">R</div> roomly</div><div className="topnote">Workspace · Meeting rooms</div></header>
    <main><div className="eyebrow">Workspace planner</div><h1>Room bookings</h1><p className="sub">See the day at a glance, reserve a slot, or free up a room when plans change.</p>
      <div className="toolbar"><div className="field"><label htmlFor="room">ROOM</label><select id="room" value={room} onChange={event => setRoom(event.target.value)}>{rooms.map(item => <option key={item.id} value={item.id}>{item.name} · {item.capacity} people</option>)}</select></div><div className="field"><label htmlFor="date">DATE</label><input id="date" type="date" value={date} onChange={event => setDate(event.target.value)} /></div><div className="availability">Availability · 09:00–18:00</div></div>
      {pageError && <div className="notice errornotice" role="alert">{pageError} <button className="text-button" onClick={() => void refresh()}>Retry</button></div>}
      {cancelError && <div className="notice errornotice" role="alert">{cancelError}</div>}
      <div className="layout"><div className={loading ? 'loading' : ''}><BookingList bookings={bookings} onCancel={cancel} /></div><BookingForm key={`${room}-${date}`} room={room} date={date} bookings={bookings} onCreate={create} /></div>
    </main>
  </div>;
}
