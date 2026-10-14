export type Room = { id: string; name: string; capacity: number };
export type Booking = { id: string; room: string; date: string; title: string; start: string; end: string; attendees: string[] };
export type BookingDraft = Omit<Booking, 'id'>;
export type FieldErrors = Partial<Record<'title' | 'start' | 'end' | 'attendees', string>>;
