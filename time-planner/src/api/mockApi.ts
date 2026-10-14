import type { Attendee, Booking, Room } from '../types';

export const attendees: Attendee[] = Array.from({ length: 30 }, (_, i) => ({ id: `u${i + 1}`, name: `Attendee ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? i - 25 : ''}` }));
export const rooms: Room[] = [
  { id: 'r1', name: 'Focus Room', capacity: 2 }, { id: 'r2', name: 'Team Room', capacity: 6 },
  { id: 'r3', name: 'Project Room', capacity: 12 }, { id: 'r4', name: 'Conference Hall', capacity: 40 },
];
const today = new Date().toISOString().slice(0, 10);
let bookings: Booking[] = [
  { id: 'b1', date: today, start: 10 * 60, end: 11 * 60, attendees: ['u1'] },
  { id: 'b2', date: today, start: 9 * 60 + 30, end: 10 * 60 + 30, attendees: ['u1'] },
  { id: 'b3', date: today, start: 13 * 60, end: 14 * 60, attendees: ['u2'] },
  { id: 'b4', date: today, start: 13 * 60 + 15, end: 13 * 60 + 45, attendees: ['u2'] },
];
let nextId = 5;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getBookings(date: string, attendeeIds: string[]): Promise<Booking[]> {
  await wait(180 + Math.random() * 180);
  return bookings.filter((b) => b.date === date && b.attendees.some((id) => attendeeIds.includes(id))).map((b) => ({ ...b, attendees: [...b.attendees] }));
}

export class BookingConflictError extends Error {
  constructor() { super('That time was just booked by someone else. Availability has been refreshed.'); this.name = 'BookingConflictError'; }
}
export async function createBooking(date: string, start: number, end: number, attendeeIds: string[]): Promise<Booking> {
  await wait(250);
  // Simulate a competing booking sometimes, plus reject any actual overlap.
  const conflict = Math.random() < 0.22 || bookings.some((b) => b.date === date && b.start < end && start < b.end && b.attendees.some((id) => attendeeIds.includes(id)));
  if (conflict) {
    if (Math.random() < 0.5) bookings.push({ id: `b${nextId++}`, date, start, end, attendees: [attendeeIds[0] ?? 'u1'] });
    throw new BookingConflictError();
  }
  const room = rooms.filter((r) => r.capacity >= attendeeIds.length).sort((a, b) => a.capacity - b.capacity)[0];
  if (!room) throw new Error('No room is large enough for this group.');
  const booking: Booking = { id: `b${nextId++}`, date, start, end, attendees: [...attendeeIds], roomId: room.id };
  bookings.push(booking);
  return booking;
}
