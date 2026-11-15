/** The item of `items` that `chance` of `[0, 1)` falls on. */
export function pick<T>(items: readonly [T, ...T[]], chance: number): T {
  return items[Math.floor(chance * items.length)] ?? items[0];
}
