import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WakeGate } from './WakeGate';
import { pingHealth, waitForServer } from '../api/health';

vi.mock('../api/health', () => ({
  pingHealth: vi.fn(),
  waitForServer: vi.fn(),
}));

const pingMock = vi.mocked(pingHealth);
const waitMock = vi.mocked(waitForServer);

const CHILD = 'app-content';
const renderGate = () => render(<WakeGate><div>{CHILD}</div></WakeGate>);

beforeEach(() => {
  pingMock.mockReset();
  waitMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('WakeGate', () => {
  it('renders children and never shows the splash when the server is already warm', async () => {
    pingMock.mockResolvedValue(true);

    renderGate();

    expect(await screen.findByText(CHILD)).toBeInTheDocument();
    expect(screen.queryByText('מתחברים לשרת…')).not.toBeInTheDocument();
    expect(waitMock).not.toHaveBeenCalled();
  });

  it('shows the waking splash when the server is cold', async () => {
    pingMock.mockResolvedValue(false);
    // Keep the wait pending so the gate stays in the "waking" state.
    waitMock.mockReturnValue(new Promise<boolean>(() => {}));

    renderGate();

    expect(await screen.findByText('מתחברים לשרת…')).toBeInTheDocument();
    expect(screen.queryByText(CHILD)).not.toBeInTheDocument();
  });

  it('shows the splash after the grace delay when the first probe is slow', async () => {
    vi.useFakeTimers();
    // First probe never resolves on its own → grace timer must reveal the splash.
    pingMock.mockReturnValue(new Promise<boolean>(() => {}));

    renderGate();

    // Nothing yet (still within the grace window).
    expect(screen.queryByText('מתחברים לשרת…')).not.toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(800);
    expect(screen.getByText('מתחברים לשרת…')).toBeInTheDocument();
  });

  it('enters the failed state at the cap, then retry recovers and renders children', async () => {
    // Attempt 1: cold, and the wait times out at the cap → failed.
    pingMock.mockResolvedValueOnce(false);
    waitMock.mockResolvedValueOnce(false);
    // Attempt 2 (after retry): server is up → ready.
    pingMock.mockResolvedValue(true);

    renderGate();

    const retry = await screen.findByRole('button', { name: 'נסו שוב' });
    expect(screen.getByText('עדיין לא הצלחנו להתחבר.')).toBeInTheDocument();

    await userEvent.click(retry);

    // Retry restarts the probe; the server is now up, so children render...
    expect(await screen.findByText(CHILD)).toBeInTheDocument();
    // ...and the failed message is gone.
    expect(screen.queryByText('עדיין לא הצלחנו להתחבר.')).not.toBeInTheDocument();
  });
});
