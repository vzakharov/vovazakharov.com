/**
 * A stand-in for `Math.random` that replays: the same `seed` gives the same
 * numbers in `[0, 1)`, so a test drawing at random fails the same way every run.
 */
export function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state / 2_147_483_648;
  };
}
