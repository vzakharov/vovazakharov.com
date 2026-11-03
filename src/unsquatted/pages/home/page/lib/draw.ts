/**
 * `count` picks at random, best first. A redraw passes the names on screen as
 * `shown`, and draws from the rest while they number at least `count`, so
 * every roll of the dice shows names the visitor has not just seen.
 */
export function draw<P extends { domain: string; score: number }>(
  picks: readonly P[],
  count: number,
  random: () => number,
  shown: readonly P[] = [],
): P[] {
  const onScreen = new Set(shown.map(({ domain }) => domain));
  const fresh = picks.filter(({ domain }) => !onScreen.has(domain));
  const pool = fresh.length >= count ? fresh : [...picks];
  const drawn: P[] = [];

  while (drawn.length < count && pool.length > 0) {
    drawn.push(...pool.splice(Math.floor(random() * pool.length), 1));
  }

  return drawn.toSorted((a, b) => b.score - a.score);
}
