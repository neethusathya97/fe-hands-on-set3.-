export const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
export const formatTime = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export const timeOptions = Array.from({ length: 37 }, (_, index) => formatTime(9 * 60 + index * 15));
export const overlaps = (start: string, end: string, booking: Pick<BookingLike, 'start' | 'end'>): boolean =>
  toMinutes(start) < toMinutes(booking.end) && toMinutes(end) > toMinutes(booking.start);
type BookingLike = { start: string; end: string };
