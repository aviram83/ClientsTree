// Wake-gate status values and user-facing copy, centralized so a future i18n
// layer can swap the strings out without touching component logic. Statuses are
// a TS enum (not string literals scattered through the component); every visible
// string lives in WAKE_COPY.

export enum WakeState {
  Checking = 'checking',
  Waking = 'waking',
  Ready = 'ready',
  Failed = 'failed',
}

export const WAKE_COPY = {
  heading: 'מתחברים לשרת…',
  subtextInitial: 'ההתחברות הראשונה עשויה לקחת עד דקה.',
  subtextEscalated: 'כמעט שם, תודה על הסבלנות.',
  failedHeading: 'עדיין לא הצלחנו להתחבר.',
  failedSubtext: 'בדקו את החיבור לאינטרנט ונסו שוב.',
  retryButton: 'נסו שוב',
} as const;
