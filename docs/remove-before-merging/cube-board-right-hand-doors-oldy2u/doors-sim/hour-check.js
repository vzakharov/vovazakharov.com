// The explorer's hour at full density, by floor and threshold: does it hold
// as the floor grows, and how coarse is the threshold? Walk rounds are odd
// (adjacent rooms of a grid are a step apart, so every way round is odd too),
// so only odd thresholds change anything. `arm` picks among an arm's eligible
// walls, `armAny` among all its walls and keeps the pick only if eligible.
// node hour-check.js [kFrom] [kTo]
const S = require('./sim.js');
const kFrom = +(process.argv[2] || 6), kTo = +(process.argv[3] || 9);
const STEPS = Math.round(3600 * 0.28), runs = 30;
for (let k = kFrom; k <= kTo; k++) {
  const t0 = Date.now(), m = S.buildMaze(k, 7);
  const even = m.closed.filter((w) => w.exact % 2 === 0).length;
  console.log(`floor ${k + 1}: ${m.N} rooms, built in ${((Date.now() - t0) / 1000).toFixed(1)} s, even walk rounds: ${even}`);
  for (const spacing of ['arm', 'armAny'])
    for (const minGap of [7, 9, 11, 13, 15]) {
      const p = S.placeDoors(m, { perHundred: 100, minGap, doorShare: 0.75, spacing, roll: S.seededRoll(101) });
      const adj = S.adjacency(S.withGaps(m, p.gaps), p.doors), rnd = S.mulberry32(4243);
      let d = 0, g = 0;
      for (let r = 0; r < runs; r++) {
        const rooms = S.exploreWalk(adj, Math.floor(rnd() * m.N), STEPS);
        d += S.metAlong(rooms, p.doors).met; g += S.metAlong(rooms, p.gaps).met;
      }
      const per = (100 * (p.doors.length + p.gaps.length)) / m.N;
      console.log(`  ${spacing.padEnd(6)} gap≥${String(minGap).padEnd(2)} ${per.toFixed(1)}/100 rooms → explorer ${Math.round(d / runs)} doors, ${Math.round(g / runs)} gaps an hour`);
    }
}
