import type { Sized, Timed } from '@/kernel/shared/typings';

import type { Seen } from './vec';

/**
 * An instant as everything timed in the cube reads it: which hour since the
 * epoch, and the seconds into it. What happens where is a function of the
 * place and this, so two viewers of one place see one thing at one moment.
 * The hour keeps the seconds small enough for a shader's float32 to count
 * frames by.
 */
export type Clock = Timed & { hour: number };

/** A scene seen from somewhere at an instant. */
export type SeenAt = Clock & Seen;

/** A scene seen from somewhere at an instant, onto a screen of a size. */
export type SeenOnScreen = SeenAt & Sized;

const HOUR_MS = 3_600_000;

/** `ms` since the epoch, as `Date.now()` gives it, on the shared clock. */
export const clockAt = (ms: number): Clock => ({
  hour: Math.floor(ms / HOUR_MS),
  seconds: (ms % HOUR_MS) / 1000,
});
