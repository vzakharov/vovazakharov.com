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

/** Canvas pixels per CSS pixel at `level` on a screen of `device` ratio. */
export const pixelRatio = (level: Level, device: number): number =>
  DETAIL[level] * device;

export const nextLevel = (level: Level): Level => NEXT[level];

/** A hint line of the quality's: the level a press set. */
export type QualityWay = `quality-${Level}`;

const echoOf = (level: Level): QualityWay => `quality-${level}`;

export type Hinting = {
  /** `way`, or for `ECHO` after a press the level it set in its place. */
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
  };

/**
 * The drawing quality, `high` until `QUALITY_KEY` cycles it, for the page's
 * life. It holds only for frames that draw the outside; the rest draw at
 * `high`.
 */
export function keyedQuality(): Quality {
  let level: Level = 'high';
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
    hinted: (way) =>
      pressedAt !== null && performance.now() - pressedAt < ECHO
        ? echoOf(level)
        : way,
    dispose: () => {
      globalThis.removeEventListener('keydown', press);
    },
  };
}
