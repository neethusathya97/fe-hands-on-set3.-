# Find a Time — React + TypeScript

A responsive meeting planner built with React, TypeScript and Vite. Includes a simulated API, pure free-slot calculation, room-capacity selection, conflict handling, keyboard interaction, and Vitest unit tests.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

## Implementation notes
- `src/utils/freeSlots.ts`: pure typed free-slot calculation. Sorts and merges overlapping bookings before finding maximal free intervals.
- `src/api/mockApi.ts`: mock booking API, attendees, rooms, artificial latency, and simulated booking conflicts.
- `src/App.tsx`: date/attendee/duration controls, stale-response protection with request IDs, visibility-aware 10-second refresh, and keyboard navigation.
- `src/components/Timeline.tsx`: accessible busy/free timeline with screen-reader labels.
- `src/__tests__/freeSlots.test.ts`: empty day, fully booked day, nested bookings, unsorted bookings, exact-D gap, and the provided acceptance scenario.

The mock API is in-memory; bookings reset when the dev server reloads. The sample acceptance bookings are seeded for the current date. The UI is a demo, not a production calendar integration.
