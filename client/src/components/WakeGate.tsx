import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pingHealth, waitForServer } from '../api/health';
import { Logo } from './Logo';
import { WakeState } from './wakeGate.constants';

// WakeGate handles Render free-tier cold starts. The server spins down after
// 15 min idle and takes up to ~1 min to wake. On mount we probe /health; if the
// server is warm the app renders immediately (no flash — the splash only appears
// after a short grace delay). If cold, we show a branded "waking up" splash and
// poll until the server responds, then render the app.
//
//   mount ──▶ Checking ──(fast 200)──────────────▶ Ready ──▶ children
//              │  │
//              │  └─(>800ms grace, still Checking)─▶ Waking (splash)
//              │                                       │
//              └─(first ping fails)──────────────────▶┘
//                                                      │
//                          waitForServer: 200 ─────────▶ Ready
//                          waitForServer: cap hit ─────▶ Failed (retry)

// Elapsed threshold (ms) at which the reassurance copy escalates.
const ESCALATE_AT_MS = 30_000;
// Grace delay before showing the splash, so a warm server never flashes it.
const SPLASH_GRACE_MS = 800;

export const WakeGate = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WakeState>(WakeState.Checking);
  const [elapsedMs, setElapsedMs] = useState(0);
  // Bumping this key restarts the probe effect (used by the retry button).
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let graceTimer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      setState(WakeState.Checking);
      setElapsedMs(0);

      // Reveal the splash only if the first probe hasn't resolved within the grace window.
      graceTimer = setTimeout(() => {
        setState((s) => (s === WakeState.Checking ? WakeState.Waking : s));
      }, SPLASH_GRACE_MS);

      // Fast path: server already warm.
      if (await pingHealth(signal)) {
        clearTimeout(graceTimer);
        if (!signal.aborted) setState(WakeState.Ready);
        return;
      }
      if (signal.aborted) return;

      // Cold: show the splash and poll until it wakes or we hit the cap.
      clearTimeout(graceTimer);
      setState(WakeState.Waking);
      const ok = await waitForServer({ signal, onElapsed: setElapsedMs });
      if (!signal.aborted) setState(ok ? WakeState.Ready : WakeState.Failed);
    };

    run();

    return () => {
      clearTimeout(graceTimer);
      controller.abort();
    };
  }, [attempt]);

  if (state === WakeState.Ready) return <>{children}</>;

  // Checking before the grace delay renders nothing (avoids a flash on warm servers).
  if (state === WakeState.Checking) return null;

  return <WakeSplash state={state} elapsedMs={elapsedMs} onRetry={() => setAttempt((a) => a + 1)} />;
};

const WakeSplash = ({
  state,
  elapsedMs,
  onRetry,
}: {
  state: WakeState.Waking | WakeState.Failed;
  elapsedMs: number;
  onRetry: () => void;
}) => {
  const { t } = useTranslation();
  const subtext =
    elapsedMs >= ESCALATE_AT_MS ? t('wakeGate.subtextEscalated') : t('wakeGate.subtextInitial');

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-card px-6 text-center"
    >
      <Logo />

      {state === WakeState.Waking ? (
        <>
          <div
            className="h-10 w-10 rounded-full border-4 border-brand-primary/30 border-t-brand-primary animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <div role="status" aria-live="polite">
            <h1 className="text-xl font-bold text-foreground">{t('wakeGate.heading')}</h1>
            <p className="mt-2 text-foreground/70">{subtext}</p>
          </div>
        </>
      ) : (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('wakeGate.failedHeading')}</h1>
            <p className="mt-2 text-foreground/70">{t('wakeGate.failedSubtext')}</p>
          </div>
          <button
            onClick={onRetry}
            className="rounded-lg bg-brand-primary px-6 py-2 font-bold text-white"
          >
            {t('wakeGate.retryButton')}
          </button>
        </div>
      )}
    </div>
  );
};
