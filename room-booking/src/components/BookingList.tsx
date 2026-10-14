import type { Booking } from '../types';
import { toMinutes } from '../utils/time';

type Props = { bookings: Booking[]; onCancel: (booking: Booking) => void };
export function BookingList({ bookings, onCancel }: Props) {
  return <section className="panel schedule-panel">
    <div className="panelhead"><div><h2>Daily schedule</h2><div className="muted panel-subtitle">Bookings ordered by start time</div></div><div className="muted">09:00 — 18:00</div></div>
    <div className="dayrange"><div className="scale"><span>ROOM TIMELINE</span><span>{bookings.length} booking{bookings.length === 1 ? '' : 's'}</span></div>
      <div className="timeline">{Array.from({ length: 10 }, (_, index) => { const hour = 9 + index; return <div className="hourline" style={{ top: `${index * 100 / 9}%` }} key={hour}><span className="hourlabel">{String(hour).padStart(2, '0')}:00</span></div>; })}
        {!bookings.length && <div className="empty">No bookings yet. This room is free all day.</div>}
        {bookings.map(booking => <article className="booking" key={booking.id} style={{ top: `${(toMinutes(booking.start) - 540) / 540 * 100}%`, height: `${(toMinutes(booking.end) - toMinutes(booking.start)) / 540 * 100}%` }}>
          <strong title={booking.title}>{booking.title}</strong><small>{booking.start} – {booking.end} · {booking.attendees.length} attendee{booking.attendees.length === 1 ? '' : 's'}</small><button className="cancel" onClick={() => onCancel(booking)}>Cancel booking</button>
        </article>)}
      </div>
    </div><div className="footerhint">Bookings are shown in time order. Adjacent meetings are allowed; overlapping meetings are not.</div>
  </section>;
}
