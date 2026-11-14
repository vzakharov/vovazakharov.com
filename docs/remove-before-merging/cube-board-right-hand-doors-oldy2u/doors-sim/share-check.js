// How many doors, were the player standing at one, would shorten the walk to the hole: by density and
// by the walk-round band the doors were drawn from. `brute` checks shortcuts() against removing each
// door and walking again.
const S = require('./sim.js');
const k = +(process.argv[2] || 5), floors = 6, pairs = 300;

if (process.argv[3] === 'brute') {
  let bad = 0, n = 0;
  for (let f = 0; f < 4; f++) {
    const m = S.buildMaze(4, 7 + f);
    const { doors } = S.placeDoors(m, { perHundred: 5, minGap: 8, spacing: 'arm', roll: S.seededRoll(101 + f) });
    const adj = S.adjacency(m, doors);
    for (const [a, h] of S.randomPairs(m, 40, 3 + f)) {
      const fast = new Set(S.shortcuts(adj, a, h, doors));
      for (const d of doors) {
        const rest = S.adjacency(m, doors.filter((x) => x !== d)), df = S.bfs(rest, a), dt = S.bfs(rest, h);
        const gain = (x, y) => 1 + dt[y] < dt[x];
        const slow = (df[d.a] <= df[d.b] && gain(d.a, d.b)) || (df[d.b] <= df[d.a] && gain(d.b, d.a));
        if (slow !== fast.has(d)) bad++;
        n++;
      }
    }
  }
  console.log(`brute: ${bad} mismatches of ${n}`);
  process.exit(0);
}

console.log(`floor ${k + 1}: share of doors that would shorten the walk, seen from the walk's side`);
for (const [lo, hi] of [[24, 48], [48, Infinity], [24, Infinity], [96, Infinity]]) {
  const row = [];
  for (const per of [0.1, 0.25, 0.5, 1, 2, 3]) {
    let hit = 0, total = 0, placed = 0;
    for (let f = 0; f < floors; f++) {
      const m = S.buildMaze(k, 7 + f);
      const { doors } = S.placeDoors(m, { perHundred: per, minGap: lo, maxGap: hi, spacing: 'arm', roll: S.seededRoll(101 + f) });
      placed += doors.length;
      if (!doors.length) continue;
      const adj = S.adjacency(m, doors);
      for (const [a, h] of S.randomPairs(m, pairs, 3 + f)) (hit += S.shortcuts(adj, a, h, doors).length), (total += doors.length);
    }
    row.push(`${per}/100: ${total ? Math.round((100 * hit) / total) : '—'}% (${(placed / floors).toFixed(1)})`);
  }
  console.log(`${lo}–${hi === Infinity ? '∞' : hi}`.padEnd(8), row.join('  '));
}
