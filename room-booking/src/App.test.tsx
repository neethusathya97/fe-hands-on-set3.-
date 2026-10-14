import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { bookingApi } from './api/bookingApi';
import type { Booking } from './types';
const seed: Booking[] = [{ id: 'seed', room: 'atlas', date: '2026-10-14', title: 'Existing meeting', start: '10:00', end: '11:00', attendees: ['a@example.com'] }];
afterEach(() => { cleanup(); vi.restoreAllMocks(); bookingApi.resetForTests(); window.history.replaceState({}, '', '/'); });
describe('Roomly page', () => {
  it('loads the selected room schedule and keeps room/date in URL', async () => {
    bookingApi.resetForTests(seed); window.history.replaceState({}, '', '/?room=atlas&date=2026-10-14');
    render(<App />); expect(await screen.findByText('Existing meeting')).toBeInTheDocument();
    expect(window.location.search).toContain('room=atlas'); expect(window.location.search).toContain('date=2026-10-14');
  });
  it('shows overlap validation and preserves typed title', async () => {
    bookingApi.resetForTests(seed); window.history.replaceState({}, '', '/?room=atlas&date=2026-10-14');
    const user = userEvent.setup(); render(<App />);
    await screen.findByText('Existing meeting');
    await user.type(screen.getByLabelText('MEETING TITLE'), 'Overlapping test');
    await user.selectOptions(screen.getByLabelText('START TIME'), '10:30');
    await user.selectOptions(screen.getByLabelText('END TIME'), '11:30');
    await user.click(screen.getByRole('button', { name: 'Create booking' }));
    expect(await screen.findByText(/Overlaps an existing booking/)).toBeInTheDocument();
    expect(screen.getByLabelText('MEETING TITLE')).toHaveValue('Overlapping test');
  });
});
