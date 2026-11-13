const QUALITIES = ['low', 'full'] as const;

type Quality = (typeof QUALITIES)[number];

/** The global the console switch is installed under. */
const CONSOLE_SWITCH = 'cubeQuality';

const known: readonly unknown[] = QUALITIES;

const isQuality = (value: unknown): value is Quality => known.includes(value);

/**
 * Canvas pixels per CSS pixel at `quality` on a screen of `device` ratio:
 * the screen's own at `full`, at most one at `low`.
 */
export const pixelRatio = (quality: Quality, device: number): number =>
  quality === 'full' ? device : Math.min(device, 1);

/**
 * The drawing quality, `low` until the console's `cubeQuality('full')` raises
 * it; `cubeQuality()` bare reports it. It lasts the page's life, and `ratio`
 * reads it afresh each call, so a switch shows on the next frame.
 */
export function consoleQuality(): {
  ratio: () => number;
  dispose: () => void;
} {
  let quality: Quality = 'low';
  const set = (next?: unknown): Quality => {
    if (next === undefined) return quality;
    if (!isQuality(next)) {
      throw new TypeError(
        `${CONSOLE_SWITCH} takes one of: ${QUALITIES.join(', ')}`,
      );
    }
    quality = next;
    return quality;
  };
  Object.assign(globalThis, { [CONSOLE_SWITCH]: set });
  return {
    ratio: () => pixelRatio(quality, globalThis.devicePixelRatio),
    dispose: () => {
      Reflect.deleteProperty(globalThis, CONSOLE_SWITCH);
    },
  };
}
