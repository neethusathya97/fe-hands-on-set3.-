export interface Attendee { id: string; name: string }
export interface Booking { id: string; date: string; start: number; end: number; attendees: string[]; roomId?: string }
export interface FreeSlot { start: number; end: number }
export interface Room { id: string; name: string; capacity: number }
