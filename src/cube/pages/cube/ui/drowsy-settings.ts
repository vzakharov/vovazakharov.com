import { z } from 'zod';

import type { CanDispose } from '@/kernel/shared/typings';

import { SHARES } from './drowsy-phases';

/** The most the slowdown repeats a frame: past it a GPU risks a reset. */
const SLOWEST = 16;

const settingsSchema = z.object({
  /** Whether the drowsy eye draws: off, the frame is drawn whole each time. */
  drowsy: z.boolean(),
  /** One pixel in share×share is drawn fresh each frame. */
  share: z.literal(SHARES),
  /** 0 holds the history to the fresh view, 1 lets it lag and smear. */
  drowsiness: z.number().min(0).max(1),
  /**
   * Each block entering the order at its own step. The cube rasterizes, so
   * one pass draws every block at one offset, and scatter cannot be had.
   */
  scatter: z.literal(false, {
    error:
      'Scatter is not available: the cube rasterizes, so a pass draws every block at one offset',
  }),
  /** How far the frame's corners darken while the eye is drowsy. */
  vignette: z.number().min(0).max(1),
  /** How many times over the GPU draws each frame, to stand in for a slower one. */
  slowdown: z.number().min(1).max(SLOWEST),
});

export type DrowsySettings = z.infer<typeof settingsSchema>;

const DEFAULTS: DrowsySettings = {
  drowsy: false,
  share: 4,
  drowsiness: 1,
  scatter: false,
  vignette: 0.35,
  slowdown: 1,
};

/**
 * The console's knobs: each setter takes one setting, throws on a bad value,
 * and returns every setting as it now stands, which the console prints.
 */
export type DrowsyConsole = {
  setDrowsy: (on: unknown) => DrowsySettings;
  setShare: (share: unknown) => DrowsySettings;
  setDrowsiness: (drowsiness: unknown) => DrowsySettings;
  setScatter: (on: unknown) => DrowsySettings;
  setVignette: (vignette: unknown) => DrowsySettings;
  setSlowdown: (slowdown: unknown) => DrowsySettings;
  settings: () => DrowsySettings;
};

export type Drowsiness = {
  /** The settings for the next frame. */
  settings: () => DrowsySettings;
  console: DrowsyConsole;
};

/** Settings at their defaults, held for the life of what made them. */
export function drowsiness(): Drowsiness {
  let current = DEFAULTS;
  const setter =
    (key: keyof DrowsySettings) =>
    (value: unknown): DrowsySettings => {
      const result = settingsSchema.safeParse({ ...current, [key]: value });
      if (!result.success) throw new Error(z.prettifyError(result.error));
      current = result.data;
      return current;
    };
  return {
    settings: () => current,
    console: {
      setDrowsy: setter('drowsy'),
      setShare: setter('share'),
      setDrowsiness: setter('drowsiness'),
      setScatter: setter('scatter'),
      setVignette: setter('vignette'),
      setSlowdown: setter('slowdown'),
      settings: () => current,
    },
  };
}

/** The name the knobs go by in the browser's console. */
const CONSOLE_NAME = 'cube';

/** Puts `knobs` on the page as `cube` until disposed. */
export function installConsole(knobs: DrowsyConsole): CanDispose {
  Reflect.set(globalThis, CONSOLE_NAME, knobs);
  return {
    dispose: () => {
      if (Reflect.get(globalThis, CONSOLE_NAME) === knobs) {
        Reflect.deleteProperty(globalThis, CONSOLE_NAME);
      }
    },
  };
}
