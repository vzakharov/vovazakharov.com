// Which walls of an arm can fall short of a threshold K? The way between the
// two rooms beside a wall stays inside their block and crosses an open arm only
// at its passage, so it is at least 2·|off − passage| + 1 long: a wall farther
// than (K − 1) / 2 from the passage is eligible without a search. This checks
// that, and measures the same window for a blind arm around the block's centre.
// node window-check.js [k]
const S = require('./sim.js');
const k = +(process.argv[2] || 7), m = S.buildMaze(k, 7);
for (const K of [9, 11, 25, 49]) {
  let open = 0, blind = 0, short = 0, broken = 0, arms = new Map();
  for (const w of m.closed) {
    const along = w.dir === 'E' ? w.y : w.x, L = w.level, half = 1 << (L - 1);
    const inB = along & (2 * half - 1), first = inB < half, off = first ? inB : inB - half;
    const arm = w.dir === 'E' ? (first ? 0 : 2) : first ? 3 : 1;
    const b = m.block(L, w.x, w.y);
    const key = `${w.dir}${L}|${w.x >> L}|${w.y >> L}|${first ? 0 : 1}`;
    if (w.exact < K) {
      short++;
      if (b.omit === arm) blind = Math.max(blind, first ? half - 1 - off : off);
      else {
        const dist = Math.abs(off - b.door[arm]);
        open = Math.max(open, dist);
        if (2 * dist + 1 > w.exact) broken++;
      }
      arms.set(key, (arms.get(key) || 0) + 1);
    }
  }
  console.log(`K ${K}: ${short} short walls in ${arms.size} arms, at most ${[...arms.values()].reduce((a, b) => Math.max(a, b), 0)} in one; farthest from an open arm's passage ${open} (bound ${(K - 1) / 2}), from a blind arm's centre end ${blind}; bound broken ${broken} times`);
}
