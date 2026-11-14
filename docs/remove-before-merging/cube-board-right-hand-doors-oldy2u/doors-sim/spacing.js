const S = require('./sim.js');
for (const [k, per, K] of [[6, 30, 48], [5, 30, 32], [5, 5, 8], [5, 3, 8], [6, 3, 8]]) {
  for (const spacing of ['none', 'arm', 'greedy']) {
    let placed = 0, red = 0;
    for (let f = 0; f < 4; f++) {
      const m = S.buildMaze(k, 7 + f);
      const { doors } = S.placeDoors(m, { perHundred: per, minGap: K, metric: 'bound', seed: 101 + f, spacing });
      placed += doors.length;
      red += S.redundant(m, doors, K);
    }
    console.log(`k=${k} per100=${per} K=${K} ${spacing.padEnd(6)} placed ${placed / 4}  redundant ${red / 4}`);
  }
}
const rows = S.sweep({ k: 5, densities: [3, 10], minGap: 8, metric: 'bound', spacing: 'arm', floors: 6, pairsPerFloor: 30, seed: 11 });
for (const r of rows) console.log('arm sweep', r.perHundred, r.path.toFixed(2), r.mapper.toFixed(2), r.wander.toFixed(2));
