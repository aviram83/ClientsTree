// The health ping targets the server ORIGIN root (`/health`), NOT the axios
// `api` instance whose baseURL is `${VITE_API_URL}/api`. We use a bare `fetch`
// so the request skips the Bearer-token/401 interceptor and hits the exact
// health route mounted at the root in server/src/routes/index.ts.
//
// Cross-origin note: in production the client (Vercel) and server (Render) are
// different origins, so this fetch depends on the server sending CORS headers
// for the client origin. server/src/index.ts applies `cors({ origin: CLIENT_URL })`
// globally, so `/health` inherits it — CLIENT_URL on Render must exactly match
// the client's production domain or this fetch fails as a network/CORS error.

const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PING_TIMEOUT_MS = 8_000;
const POLL_INTERVAL_MS = 3_000;
const OVERALL_CAP_MS = 90_000;

/**
 * Probe the server's health endpoint once.
 * Resolves `true` only on HTTP 200; `false` on any non-200, network error, or timeout.
 * An optional external `signal` lets callers abort the probe (e.g. on unmount).
 */
export const pingHealth = async (signal?: AbortSignal): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  // Abort our controller if the caller's signal fires.
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  try {
    const res = await fetch(`${API_ORIGIN}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    return res.ok; // 200-299
  } catch {
    return false; // network error or timeout (abort)
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onExternalAbort);
  }
};

export interface WaitForServerOptions {
  /** Called with elapsed milliseconds after each failed poll, to drive progress copy. */
  onElapsed?: (elapsedMs: number) => void;
  /** Abort the whole wait loop (e.g. on unmount). */
  signal?: AbortSignal;
  /** Overrides for tests. */
  pollIntervalMs?: number;
  overallCapMs?: number;
}

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const onAbort = () => {
      clearTimeout(t);
      resolve();
    };
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/**
 * Poll `pingHealth` until the server responds or the overall cap is hit.
 * Resolves `true` as soon as a poll succeeds, `false` when the cap elapses
 * (or the wait is aborted). After each failed poll, `onElapsed` reports how
 * long we've been waiting so the UI can escalate its reassurance copy.
 */
export const waitForServer = async ({
  onElapsed,
  signal,
  pollIntervalMs = POLL_INTERVAL_MS,
  overallCapMs = OVERALL_CAP_MS,
}: WaitForServerOptions = {}): Promise<boolean> => {
  const start = Date.now();

  while (!signal?.aborted) {
    if (await pingHealth(signal)) return true;

    const elapsed = Date.now() - start;
    if (elapsed >= overallCapMs) return false;

    onElapsed?.(elapsed);
    await sleep(pollIntervalMs, signal);
  }

  return false;
};
