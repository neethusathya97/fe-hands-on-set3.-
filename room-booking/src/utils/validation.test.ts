import { describe, expect, it } from 'vitest';
import { overlaps } from './time';
import { validateBooking } from './validation';
import type { Booking, BookingDraft } from '../types';
const existing: Booking = { id: '1', room: 'atlas', date: '2026-10-14', title: 'Existing meeting', start: '10:00', end: '11:00', attendees: [] };
const draft = (start: string, end: string): BookingDraft => ({ room: 'atlas', date: '2026-10-14', title: 'Test meeting', start, end, attendees: [] });
describe('room booking validation', () => {
  it('blocks partial overlap', () => { expect(validateBooking(draft('10:30', '11:30'), [existing])).toMatchObject({ start: expect.stringContaining('Overlaps'), end: expect.any(String) }); });
  it('blocks a booking that fully contains an existing booking', () => { const contained = { ...existing, start: '10:00', end: '10:30' }; expect(overlaps('09:00', '12:00', contained)).toBe(true); expect(validateBooking(draft('09:00', '12:00'), [contained]).start).toContain('Overlaps'); });
  it('allows back-to-back bookings', () => { expect(overlaps('11:00', '12:00', existing)).toBe(false); expect(validateBooking(draft('11:00', '12:00'), [existing])).toEqual({}); });
  it('rejects duplicate emails', () => { expect(validateBooking({ ...draft('11:00', '12:00'), attendees: ['a@example.com', 'A@example.com'] }, [])).toHaveProperty('attendees', 'Attendee email addresses must be unique.'); });
  it('rejects bookings longer than four hours', () => { expect(validateBooking(draft('09:00', '13:15'), []).end).toContain('at most 4 hours'); });
});
