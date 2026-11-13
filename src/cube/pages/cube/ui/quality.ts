import type { CanDispose } from '@/kernel/shared/typings';

/** The drawing qualities, sharpest first: the order the key cycles them in. */
export const QUALITIES = ['high', 'medium', 'low'] as const;

export type Level = (typeof QUALITIES)[number];

/** The share of the screen's own resolution the canvas holds at each level. */
const DETAIL: Record<Level, number> = { high: 1, medium: 0.75, low: 0.5 };

const NEXT: Record<Level, Level> = {
  high: 'medium',
  medium: 'low',
  low: 'high',
};

/** The key that cycles the levels, by physical position. */
export const QUALITY_KEY = 'KeyQ';

/** How long a press shows the level it set, in milliseconds. */
const ECHO = 2000;

/** How long a reading of the frame rate averages over, in milliseconds. */
const WINDOW = 2000;

/**
 * Frames a second under which the drawing is slow: a 60 Hz screen jitters
 * just under 60.
 */
const SLOW_BELOW = 55;

/** A gap between frames past this is a pause, a hidden tab, not a frame. */
const HIDDEN_GAP = 1000;

/** Canvas pixels per CSS pixel at `level` on a screen of `device` ratio. */
export const pixelRatio = (level: Level, device: number): number =>
  DETAIL[level] * device;

export const nextLevel = (level: Level): Level => NEXT[level];

/**
 * The frame rate of the frames that draw the outside: `last`, when the
 * latest frame was drawn, null where it did not draw the outside; `gaps`
 * and `lasted`, the window being gathered; `slow`, the latest whole window's
 * verdict.
 */
export type Pace = {
  last: number | null;
  gaps: number;
  lasted: number;
  slow: boolean;
};

export const UNPACED: Pace = { last: null, gaps: 0, lasted: 0, slow: false };

/**
 * `pace` after a frame at `time` milliseconds that does or does not draw the
 * `outside`: only the gap between two such frames in a row counts, and every
 * `WINDOW` of them gives a new verdict.
 */
export function paced(pace: Pace, time: number, outside: boolean): Pace {
  if (!outside) return { ...pace, last: null };
  const { last, gaps, lasted, slow } = pace;
  const gap = last === null ? HIDDEN_GAP + 1 : time - last;
  if (gap > HIDDEN_GAP) return { ...pace, last: time };
  const counted = { gaps: gaps + 1, lasted: lasted + gap };
  if (counted.lasted < WINDOW) return { last: time, ...counted, slow };
  const rate = (counted.gaps * 1000) / counted.lasted;
  return { last: time, gaps: 0, lasted: 0, slow: rate < SLOW_BELOW };
}

/** A hint line of the quality's: the key's, or the level a press set. */
export type QualityWay = 'quality' | `quality-${Level}`;

const echoOf = (level: Level): QualityWay => `quality-${level}`;

export type Hinting = {
  /**
   * `way`, or the quality's line in its place: the level for `ECHO` after a
   * press, and the key where the outside draws slow and `way` is none, until
   * the key is first pressed.
   */
  hinted: <W extends string>(way: W | null) => W | QualityWay | null;
};

export type Quality = CanDispose &
  Hinting & {
    /**
     * Canvas pixels per CSS pixel for the next frame, as it does or does not
     * draw the outside; `detail` is then that frame's share of the screen's own
     * resolution.
     */
    ratioFor: (outside: boolean) => number;
    detail: () => number;
    /** Hears a frame drawn at `time` milliseconds. */
    drawn: (time: number, outside: boolean) => void;
  };

/**
 * The drawing quality, `high` until `QUALITY_KEY` cycles it, for the page's
 * life. It holds only for frames that draw the outside; the rest draw at
 * `high`.
 */
export function keyedQuality(): Quality {
  let level: Level = 'high';
  let pace = UNPACED;
  let outside = false;
  let pressedAt: number | null = null;
  let sized: Level = 'high';
  const press = ({ code, repeat, ctrlKey, metaKey }: KeyboardEvent) => {
    if (code !== QUALITY_KEY || repeat || ctrlKey || metaKey) return;
    level = nextLevel(level);
    pressedAt = performance.now();
  };
  globalThis.addEventListener('keydown', press);
  return {
    ratioFor: (drawsOutside) => {
      sized = drawsOutside ? level : 'high';
      return pixelRatio(sized, globalThis.devicePixelRatio);
    },
    detail: () => DETAIL[sized],
    drawn: (time, drawsOutside) => {
      outside = drawsOutside;
      pace = paced(pace, time, drawsOutside);
    },
    hinted: (way) => {
      if (pressedAt !== null) {
        return performance.now() - pressedAt < ECHO ? echoOf(level) : way;
      }
      return way ?? (outside && pace.slow ? 'quality' : null);
    },
    dispose: () => {
      globalThis.removeEventListener('keydown', press);
    },
  };
}
