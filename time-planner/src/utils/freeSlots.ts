import type { Booking, FreeSlot } from '../types';

export const DAY_START = 9 * 60;
export const DAY_END = 18 * 60;

/** Returns every maximal common-free interval at least duration minutes long.
 * Inputs are minute offsets from midnight. Overlapping and unsorted bookings are supported.
 */
export function calculateFreeSlots(
  bookings: readonly Booking[],
  attendeeIds: readonly string[],
  duration: number,
  dayStart = DAY_START,
  dayEnd = DAY_END,
): FreeSlot[] {
  if (duration <= 0 || dayEnd <= dayStart || attendeeIds.length === 0) return [];
  const busy = bookings
    .filter((booking) => booking.attendees.some((id) => attendeeIds.includes(id)))
    .map(({ start, end }) => ({ start: Math.max(dayStart, start), end: Math.min(dayEnd, end) }))
    .filter((block) => block.end > block.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: { start: number; end: number }[] = [];
  for (const block of busy) {
    const last = merged[merged.length - 1];
    if (!last || block.start > last.end) merged.push({ ...block });
    else last.end = Math.max(last.end, block.end);
  }

  const free: FreeSlot[] = [];
  let cursor = dayStart;
  for (const block of merged) {
    if (block.start - cursor >= duration) free.push({ start: cursor, end: block.start });
    cursor = Math.max(cursor, block.end);
  }
  if (dayEnd - cursor >= duration) free.push({ start: cursor, end: dayEnd });
  return free;
}
