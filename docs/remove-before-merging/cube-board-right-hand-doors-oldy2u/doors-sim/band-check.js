// Near openings against far ones: the same number of openings, placed only in one band of walk round
// at a time, and what each band does to sighted explorers against the bare floor. Openings are plain
// edges here: no explorer in the simulator avoids doors, so only their distance differs.
const S = require('./sim.js');
const k = +(process.argv[2] || 5), per = +(process.argv[3] || 1);
const floors = k < 6 ? 8 : k < 7 ? 4 : 2, pairs = k < 6 ? 16 : k < 7 ? 8 : 6, wander = k < 7;
const BANDS = [[24, 48], [48, Infinity], [24, Infinity]];
console.log(`floor ${k + 1} (${1 << k}×${1 << k}), ${per} openings per 100 rooms asked`);
console.log('band       placed  path  mapper  wanderer  hand  hand fails  partitions in band');
for (const [lo, hi] of BANDS) {
  const acc = { placed: 0, arms: 0, path: [0, 0], mapper: [0, 0], wander: [0, 0], hand: [0, 0], fails: 0, n: 0 };
  for (let f = 0; f < floors; f++) {
    const m = S.buildMaze(k, 7 + f);
    const { doors, eligible } = S.placeDoors(m, { perHundred: per, minGap: lo, maxGap: hi, spacing: 'arm', roll: S.seededRoll(101 + f) });
    acc.placed += doors.length; acc.arms += eligible;
    const bare = S.adjacency(m, []), adj = S.adjacency(m, doors), eyesBare = S.eyesOf(m, []), eyes = S.eyesOf(m, doors);
    const opBare = S.opener(m, []), op = S.opener(m, doors);
    for (const [a, h] of S.randomPairs(m, pairs, 3 + f)) {
      acc.path[0] += S.bfs(bare, a)[h]; acc.path[1] += S.bfs(adj, a)[h];
      acc.mapper[0] += S.mapper(bare, a, h, eyesBare.player(h)); acc.mapper[1] += S.mapper(adj, a, h, eyes.player(h));
      if (wander) {
        const rnd = S.mulberry32(a * 31 + h);
        acc.wander[0] += S.wanderer(bare, a, h, rnd, 400 * m.N, eyesBare.player(h)); acc.wander[1] += S.wanderer(adj, a, h, rnd, 400 * m.N, eyes.player(h));
      }
      const fb = S.follower(m, opBare, a, h, eyesBare.player(h)), fd = S.follower(m, op, a, h, eyes.player(h));
      if (fd.ok) (acc.hand[0] += fb.steps), (acc.hand[1] += fd.steps); else acc.fails++;
      acc.n++;
    }
  }
  const r = (x) => (x[0] ? (x[1] / x[0]).toFixed(2) : '—').padStart(5);
  const name = `${lo}–${hi === Infinity ? '∞' : hi}`.padEnd(9);
  console.log(`${name}  ${String(Math.round(acc.placed / floors)).padStart(6)}  ${r(acc.path)}  ${r(acc.mapper)}   ${r(acc.wander)}   ${r(acc.hand)}  ${((100 * acc.fails) / acc.n).toFixed(0).padStart(8)}%  walls ${Math.round(acc.arms / floors)}`);
}
