import type { Sized } from '@/kernel/shared/typings';

/** The per-pixel masks a lake is told from land by, all `width × height`. */
export type LakeMasks = {
  land: Uint8Array;
  ink: Uint8Array;
  /** Pixels within the ink clearance of ink. */
  nearInk: Uint8Array;
  /** Coloured or shaded pixels clear of ink. */
  painted: Uint8Array;
};

/**
 * The drawn lakes (1): pieces of land (4-connected) walled off by ink that
 * hold pixels clear of it, under `minPaintedShare` of those painted. A
 * letter's counter or the paper between two strokes is never wider than
 * twice the clearance, so it holds no clear pixel and stays land; a counter
 * written over crayon that does is painted.
 */
export function lakes(
  { land, ink, nearInk, painted }: LakeMasks,
  { width, height }: Sized,
  minPaintedShare: number,
): Uint8Array {
  const water = new Uint8Array(width * height);
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const open = (i: number) => land[i] === 1 && ink[i] !== 1 && seen[i] !== 1;
  for (let start = 0; start < width * height; start++) {
    if (!open(start)) continue;
    seen[start] = 1;
    queue[0] = start;
    let tail = 1;
    let clear = 0;
    let paint = 0;
    for (let head = 0; head < tail; head++) {
      const i = queue[head] ?? 0;
      clear += (nearInk[i] ?? 0) ^ 1;
      paint += painted[i] ?? 0;
      const x = i % width;
      for (const n of [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        i >= width ? i - width : -1,
        i < (height - 1) * width ? i + width : -1,
      ]) {
        if (n < 0 || !open(n)) continue;
        seen[n] = 1;
        queue[tail++] = n;
      }
    }
    if (clear > 0 && paint < minPaintedShare * clear) {
      for (const i of queue.subarray(0, tail)) water[i] = 1;
    }
  }
  return water;
}
