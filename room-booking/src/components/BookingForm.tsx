import { useState, type FormEvent } from 'react';
import type { Booking, BookingDraft, FieldErrors } from '../types';
import { timeOptions } from '../utils/time';
import { validateBooking } from '../utils/validation';

type Props = { room: string; date: string; bookings: Booking[]; onCreate: (draft: BookingDraft) => Promise<void> };
export function BookingForm({ room, date, bookings, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [attendees, setAttendees] = useState(['']);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const draft = (): BookingDraft => ({ room, date, title, start, end, attendees: attendees.map(email => email.trim()).filter(Boolean) });
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setServerError(''); setSuccess('');
    const nextErrors = validateBooking({ ...draft(), attendees: attendees.map(email => email.trim()) }, bookings);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try { await onCreate(draft()); setSuccess('Booking created successfully.'); setTitle(''); setStart('09:00'); setEnd('10:00'); setAttendees(['']); setErrors({}); }
    catch (error) { setServerError(error instanceof Error ? error.message : 'Unable to create booking.'); }
    finally { setBusy(false); }
  };
  const updateAttendee = (index: number, value: string) => setAttendees(current => current.map((email, i) => i === index ? value : email));
  const field = (key: keyof FieldErrors) => errors[key] ? <span className="error" role="alert">{errors[key]}</span> : null;
  return <section className="panel form-panel">
    <div className="panelhead"><div><h2>Book this room</h2><div className="muted panel-subtitle">Reserve time for your team</div></div><span className="plus-icon">＋</span></div>
    <div className="formbody">
      {serverError && <div className="notice errornotice" role="alert">{serverError}</div>}
      {success && <div className="notice success" role="status">{success}</div>}
      <form onSubmit={submit} noValidate>
        <div className="formgrid">
          <div className={`field full ${errors.title ? 'haserror' : ''}`}><label htmlFor="title">MEETING TITLE</label><input id="title" maxLength={100} placeholder="e.g. Sprint planning" value={title} onChange={e => setTitle(e.target.value)} />{field('title')}</div>
          <div className={`field ${errors.start ? 'haserror' : ''}`}><label htmlFor="start">START TIME</label><select id="start" value={start} onChange={e => setStart(e.target.value)}>{timeOptions.slice(0, -1).map(time => <option key={time}>{time}</option>)}</select>{field('start')}</div>
          <div className={`field ${errors.end ? 'haserror' : ''}`}><label htmlFor="end">END TIME</label><select id="end" value={end} onChange={e => setEnd(e.target.value)}>{timeOptions.slice(1).map(time => <option key={time}>{time}</option>)}</select>{field('end')}</div>
          <div className="field full"><label>ATTENDEES · EMAIL ADDRESSES</label><div className="attendees">{attendees.map((email, index) => <div className="attendee-row" key={index}><input aria-label={`Attendee email ${index + 1}`} type="email" placeholder="name@company.com" value={email} onChange={e => updateAttendee(index, e.target.value)} /><button type="button" className="remove" aria-label={`Remove attendee ${index + 1}`} onClick={() => setAttendees(list => list.length === 1 ? [''] : list.filter((_, i) => i !== index))}>×</button></div>)}</div><button type="button" className="add" onClick={() => setAttendees(list => [...list, ''])}>＋ Add attendee</button>{field('attendees')}</div>
        </div>
        <div className="actions"><button className="primary" disabled={busy} type="submit">{busy ? 'Saving booking…' : 'Create booking'}</button></div>
      </form>
    </div>
    <div className="footerhint">Mock API · 300–800 ms latency · booking creation may fail randomly to simulate server conflicts.</div>
  </section>;
}
