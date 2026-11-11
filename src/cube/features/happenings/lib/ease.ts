export const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

/** How far `t` is from `from` to `to`, held to `[0, 1]`. */
export const ramp = (t: number, from: number, to: number): number =>
  clamp01((t - from) / (to - from));

/** `t` of `[0, 1]` eased in and out. */
export const smooth = (t: number): number => {
  const held = clamp01(t);
  return held * held * (3 - 2 * held);
};

export const lerp = (a: number, b: number, share: number): number =>
  a + (b - a) * share;

/** The item of `items` that `chance` of `[0, 1)` falls on. */
export function pick<T>(items: readonly [T, ...T[]], chance: number): T {
  return items[Math.floor(chance * items.length)] ?? items[0];
}
