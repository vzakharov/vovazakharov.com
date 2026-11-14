// How often a single opening lies on the shortest path between two random rooms, by density and by
// the walk-round band it was drawn from: the chance that a door a player sees is on the way to the hole.
const S = require('./sim.js');
const k = +(process.argv[2] || 5), floors = 6, pairs = 300;
console.log(`floor ${k + 1}: share of openings on a random pair's shortest path`);
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
      for (const [a, h] of S.randomPairs(m, pairs, 3 + f)) {
        const da = S.bfs(adj, a), dh = S.bfs(adj, h), L = da[h];
        for (const w of doors) if (da[w.a] + 1 + dh[w.b] === L || da[w.b] + 1 + dh[w.a] === L) hit++;
        total += doors.length;
      }
    }
    row.push(`${per}/100: ${total ? Math.round((100 * hit) / total) : '—'}% (${(placed / floors).toFixed(1)})`);
  }
  console.log(`${lo}–${hi === Infinity ? '∞' : hi}`.padEnd(8), row.join('  '));
}
