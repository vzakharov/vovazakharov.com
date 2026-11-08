/** A point in a search: named parameters. */
export type Point<Key extends string> = Record<Key, number>;

/** Each parameter's closed range. */
export type Ranges<Key extends string> = Record<Key, readonly [number, number]>;

/** Where a search ended, and what it spent getting there. */
export type Found<Key extends string> = {
  best: Point<Key>;
  score: number;
  evaluations: number;
};

/**
 * A coordinate search minimising `score`: each round tries every parameter a
 * step either way, within its range, walking on while that improves, and then
 * halves every step. Deterministic, and costs about `rounds · 2 · keys`
 * evaluations plus each walk.
 */
export function coordinateSearch<Key extends string>({
  keys,
  start,
  steps,
  ranges,
  score,
  rounds,
}: {
  keys: readonly Key[];
  start: Point<Key>;
  steps: Point<Key>;
  ranges: Ranges<Key>;
  score: (point: Point<Key>) => number;
  rounds: number;
}): Found<Key> {
  let best = { ...start };
  let bestScore = score(best);
  let evaluations = 1;
  const step = { ...steps };
  for (let round = 0; round < rounds; round += 1) {
    for (const key of keys) {
      const [lo, hi] = ranges[key];
      for (const direction of [1, -1]) {
        for (;;) {
          const value = Math.min(
            hi,
            Math.max(lo, best[key] + direction * step[key]),
          );
          if (value === best[key]) break;
          const candidate = { ...best, [key]: value };
          const candidateScore = score(candidate);
          evaluations += 1;
          if (!(candidateScore < bestScore)) break;
          best = candidate;
          bestScore = candidateScore;
        }
      }
    }
    for (const key of keys) step[key] /= 2;
  }
  return { best, score: bestScore, evaluations };
}
