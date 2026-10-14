# Roomly — Room Booking Scheduler

A React + TypeScript implementation of the Roomly room-booking assignment. It includes separate UI components, a mock API, URL-persisted room/date selection, field-level validation, optimistic cancellation, and automated tests.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Test and build
```bash
npm test
npm run build
```

## Project structure
```text
src/
  api/bookingApi.ts            Mock room and booking API (300–800 ms delay)
  components/BookingForm.tsx   Form, attendee controls, errors and submit state
  components/BookingList.tsx   Daily timeline and cancel controls
  utils/time.ts                Time conversion, options and overlap helper
  utils/validation.ts          Field-level booking validation
  App.tsx                      Page state, URL sync, create/cancel orchestration
  styles.css                   Responsive light/dark styling
  test/setup.ts                Testing Library setup
  App.test.tsx                 UI integration tests
  utils/validation.test.ts     Overlap and field validation tests
```

## Notes
- Seed bookings are created for the current local date.
- Room and date are stored in the URL query string (`?room=atlas&date=YYYY-MM-DD`).
- Time options use 15-minute increments between 09:00 and 18:00.
- Bookings cannot overlap; adjacent bookings are allowed.
- Creating and cancelling a booking each have a 10% simulated failure rate.
- Data is in memory and resets on page reload; replace `bookingApi.ts` with a real API client for production.
