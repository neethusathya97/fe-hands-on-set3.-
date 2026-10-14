import type { Booking, BookingDraft, FieldErrors } from '../types';
import { overlaps, toMinutes } from './time';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateBooking(draft: BookingDraft, existing: Booking[]): FieldErrors {
  const errors: FieldErrors = {};
  const start = toMinutes(draft.start);
  const end = toMinutes(draft.end);
  if (!draft.title.trim()) errors.title = 'Enter a meeting title.';
  if (start < 540 || start >= 1080) errors.start = 'Choose a start time from 09:00 to 17:45.';
  if (end > 1080 || end <= 540) errors.end = 'Choose an end time after 09:00 and no later than 18:00.';
  if (start >= end) {
    errors.start = 'Start time must be before end time.';
    errors.end = 'End time must be after start time.';
  } else if (end - start > 240) errors.end = 'A booking can be at most 4 hours.';
  if (draft.attendees.some(email => email.trim() && !EMAIL.test(email.trim()))) errors.attendees = 'Enter a valid email for each attendee.';
  const emails = draft.attendees.map(email => email.trim().toLowerCase()).filter(Boolean);
  if (new Set(emails).size !== emails.length) errors.attendees = 'Attendee email addresses must be unique.';
  if (!errors.start && !errors.end) {
    const conflicts = existing.filter(booking => overlaps(draft.start, draft.end, booking));
    if (conflicts.length) {
      errors.start = `Overlaps an existing booking (${conflicts.map(b => `${b.start}–${b.end}`).join(', ')}).`;
      errors.end = 'Choose a time that does not overlap another booking.';
    }
  }
  return errors;
}
