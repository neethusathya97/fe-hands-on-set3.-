import type { Booking, BookingDraft, Room } from '../types';
import { toMinutes } from '../utils/time';

export const rooms: Room[] = [
  { id: 'atlas', name: 'Atlas', capacity: 8 },
  { id: 'birch', name: 'Birch', capacity: 4 },
  { id: 'cedar', name: 'Cedar', capacity: 12 },
];
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = localDate(new Date());
let bookings: Booking[] = [
  { id: 'b1', room: 'atlas', date: today, title: 'Product design sync', start: '09:30', end: '10:30', attendees: ['maya@roomly.test'] },
  { id: 'b2', room: 'atlas', date: today, title: 'Weekly team stand-up', start: '11:00', end: '11:30', attendees: ['alex@roomly.test', 'lee@roomly.test'] },
  { id: 'b3', room: 'atlas', date: today, title: 'Roadmap review', start: '13:00', end: '14:30', attendees: ['sam@roomly.test'] },
  { id: 'b4', room: 'birch', date: today, title: 'Interview panel', start: '10:00', end: '11:00', attendees: ['talent@roomly.test'] },
  { id: 'b5', room: 'cedar', date: today, title: 'Quarterly planning', start: '14:00', end: '16:00', attendees: ['ops@roomly.test'] },
];
const delay = () => new Promise<void>(resolve => setTimeout(resolve, 300 + Math.random() * 500));
const conflicts = (a: BookingDraft, b: Booking) => a.room === b.room && a.date === b.date && toMinutes(a.start) < toMinutes(b.end) && toMinutes(a.end) > toMinutes(b.start);
export const bookingApi = {
  async getRooms(): Promise<Room[]> { await delay(); return rooms.map(room => ({ ...room })); },
  async getBookings(room: string, date: string): Promise<Booking[]> {
    await delay();
    return bookings.filter(item => item.room === room && item.date === date).sort((a, b) => toMinutes(a.start) - toMinutes(b.start)).map(item => ({ ...item, attendees: [...item.attendees] }));
  },
  async createBooking(draft: BookingDraft): Promise<Booking> {
    await delay();
    if (bookings.some(item => conflicts(draft, item))) throw new Error('This room was booked by someone else. Please choose another time.');
    if (Math.random() < 0.1) throw new Error('The server could not save this booking. Please review availability and try again.');
    const booking: Booking = { ...draft, id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    bookings = [...bookings, booking];
    return booking;
  },
  async cancelBooking(id: string): Promise<void> {
    await delay();
    if (Math.random() < 0.1) throw new Error('The server could not cancel this booking. The booking has been restored. Please try again.');
    bookings = bookings.filter(item => item.id !== id);
  },
  // Useful for isolated tests and demos; production apps would not expose this helper.
  resetForTests(seed: Booking[] = []): void { bookings = seed.map(item => ({ ...item, attendees: [...item.attendees] })); },
};
