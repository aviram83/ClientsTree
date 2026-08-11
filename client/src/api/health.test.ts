import { afterEach, describe, expect, it, vi } from 'vitest';
import { pingHealth, waitForServer } from './health';

const mockFetch = (impl: (url: string, opts: RequestInit) => Promise<Response> | Response) => {
  const fn = vi.fn(impl as never);
  vi.stubGlobal('fetch', fn);
  return fn;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('pingHealth', () => {
  it('returns true on HTTP 200', async () => {
    mockFetch(() => new Response(null, { status: 200 }));
    await expect(pingHealth()).resolves.toBe(true);
  });

  it('returns false on a non-200 response (503)', async () => {
    mockFetch(() => new Response(null, { status: 503 }));
    await expect(pingHealth()).resolves.toBe(false);
  });

  it('returns false on a network error', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    await expect(pingHealth()).resolves.toBe(false);
  });

  it('returns false when the request times out (abort)', async () => {
    vi.useFakeTimers();
    // fetch never resolves on its own; it only rejects when its signal aborts.
    mockFetch(
      (_url, opts) =>
        new Promise((_, reject) => {
          opts.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );

    const promise = pingHealth();
    await vi.advanceTimersByTimeAsync(8_000); // internal PING_TIMEOUT_MS
    await expect(promise).resolves.toBe(false);
  });

  it('aborts when an external signal fires', async () => {
    mockFetch(
      (_url, opts) =>
        new Promise((_, reject) => {
          opts.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const controller = new AbortController();
    const promise = pingHealth(controller.signal);
    controller.abort();
    await expect(promise).resolves.toBe(false);
  });
});

describe('waitForServer', () => {
  it('resolves true as soon as a poll succeeds', async () => {
    let calls = 0;
    mockFetch(() => {
      calls += 1;
      return new Response(null, { status: calls >= 2 ? 200 : 503 });
    });

    const ok = await waitForServer({ pollIntervalMs: 1, overallCapMs: 5_000 });
    expect(ok).toBe(true);
    expect(calls).toBe(2);
  });

  it('resolves false when the overall cap is reached', async () => {
    mockFetch(() => new Response(null, { status: 503 }));
    const ok = await waitForServer({ pollIntervalMs: 1, overallCapMs: 10 });
    expect(ok).toBe(false);
  });

  it('reports elapsed time via the onElapsed callback after a failed poll', async () => {
    let calls = 0;
    mockFetch(() => {
      calls += 1;
      return new Response(null, { status: calls >= 2 ? 200 : 503 });
    });
    const onElapsed = vi.fn();

    await waitForServer({ pollIntervalMs: 1, overallCapMs: 5_000, onElapsed });
    expect(onElapsed).toHaveBeenCalled();
    expect(typeof onElapsed.mock.calls[0][0]).toBe('number');
  });

  it('stops immediately when aborted', async () => {
    mockFetch(() => new Response(null, { status: 503 }));
    const controller = new AbortController();
    controller.abort();
    const ok = await waitForServer({ signal: controller.signal, pollIntervalMs: 1 });
    expect(ok).toBe(false);
  });
});
