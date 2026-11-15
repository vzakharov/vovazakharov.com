/** Answers remembered at once: a frame's walk or a room's sight re-reads its own. */
const MEMO_SIZE = 4096;

/** A cache that forgets everything once full, `compute` filling a miss. */
export type Memo<V> = (key: string, compute: () => V) => V;

/**
 * A new `Memo`. Clearing whole rather than evicting one by one keeps a miss
 * O(1), and a frame's next reads refill what it still needs.
 */
export function memo<V extends NonNullable<unknown> | null>(): Memo<V> {
  const kept = new Map<string, V>();
  return (key, compute) => {
    const hit = kept.get(key);
    if (hit !== undefined) return hit;
    const value = compute();
    if (kept.size >= MEMO_SIZE) kept.clear();
    kept.set(key, value);
    return value;
  };
}
