// Plainly-dead rooms on sandbox floors: share skipped, with and without doors, and timing.
const S = require('./sim.js');
for (const k of [4, 5, 6, 7]) {
  const m = S.buildMaze(k, 7);
  const [[a, h]] = S.randomPairs(m, 1, 3);
  for (const per of [0, 3]) {
    const { doors } = S.placeDoors(m, { perHundred: per, minGap: 48, spacing: 'arm', roll: S.seededRoll(101) });
    const t = Date.now();
    const r = S.deadEnds(m, doors, a, h);
    const ms = Date.now() - t;
    const leaves = S.adjacency(m, []).filter((n) => n.length === 1).length;
    console.log(`k${k} doors ${doors.length}: skipped ${r.skipped}/${m.N} (${((100 * r.skipped) / m.N).toFixed(1)}%), dead ${r.dead.reduce((x, y) => x + y, 0)}, leaves ${leaves}, hole entered ${r.entered[h]}, ${ms} ms`);
  }
}
