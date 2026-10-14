import { describe, expect, it } from 'vitest';
import { calculateFreeSlots } from '../utils/freeSlots';
import type { Booking } from '../types';
const A = ['A'];
const booking = (start: number, end: number, attendees = A): Booking => ({ id: `${start}-${end}`, date: '2026-10-14', start, end, attendees });
const asTimes = (slots: { start: number; end: number }[]) => slots.map(({ start, end }) => [start, end]);
describe('calculateFreeSlots', () => {
  it('returns the full day for an empty day', () => expect(asTimes(calculateFreeSlots([], A, 30))).toEqual([[540, 1080]]));
  it('returns no slots for a fully booked day', () => expect(calculateFreeSlots([booking(540, 1080)], A, 30)).toEqual([]));
  it('merges a booking inside another booking', () => expect(asTimes(calculateFreeSlots([booking(600, 660), booking(615, 630)], A, 30))).toEqual([[540, 600], [660, 1080]]));
  it('supports unsorted bookings', () => expect(asTimes(calculateFreeSlots([booking(780, 840), booking(600, 660)], A, 30))).toEqual([[540, 600], [660, 780], [840, 1080]]));
  it('includes a gap exactly equal to D', () => expect(asTimes(calculateFreeSlots([booking(570, 600), booking(630, 660)], A, 30))).toEqual([[540, 570], [600, 630], [660, 1080]]));
  it('matches the acceptance example with overlapping attendee bookings', () => {
    const input = [booking(600, 660, ['A']), booking(570, 630, ['A']), booking(780, 840, ['B']), booking(795, 825, ['B'])];
    expect(asTimes(calculateFreeSlots(input, ['A', 'B'], 30))).toEqual([[540, 570], [660, 780], [840, 1080]]);
  });
});
