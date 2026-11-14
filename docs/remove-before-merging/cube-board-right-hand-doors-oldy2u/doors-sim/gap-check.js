// What gaps (walls simply missing) do, at a fixed door density: the share a sighted player skips,
// and each sighted explorer's steps against the bare floor.
const S = require('./sim.js');
const k = +(process.argv[2] || 5), doorsPer = +(process.argv[3] || 3), floors = k < 6 ? 6 : 2, pairs = k < 6 ? 12 : 6;
console.log(`floor ${k + 1}, ${doorsPer} doors per 100, threshold 48 (8 below floor 7)`);
console.log('gaps/100  placed  skipped  path  mapper  wanderer  hand  hand fails');
for (const g of [0, 0.25, 0.5, 1, 1.5, 2, 3]) {
  const acc = { placed: 0, skipped: 0, rooms: 0, path: [0, 0], mapper: [0, 0], wander: [0, 0], hand: [0, 0], fails: 0, n: 0 };
  for (let f = 0; f < floors; f++) {
    const m = S.buildMaze(k, 7 + f);
    const pl = S.placeDoors(m, { perHundred: doorsPer, gapsPerHundred: g, minGap: k < 6 ? 8 : 48, spacing: 'arm', roll: S.seededRoll(101 + f) });
    const open = S.withGaps(m, pl.gaps);
    acc.placed += pl.gaps.length;
    const bare = S.adjacency(m, []), adj = S.adjacency(open, pl.doors), eyesBare = S.eyesOf(m, []), eyes = S.eyesOf(open, pl.doors);
    const opBare = S.opener(m, []), op = S.opener(open, pl.doors);
    for (const [a, h] of S.randomPairs(m, pairs, 3 + f)) {
      acc.skipped += S.deadEnds(open, pl.doors, a, h, eyes).skipped;
      acc.rooms += m.N;
      acc.path[0] += S.bfs(bare, a)[h]; acc.path[1] += S.bfs(adj, a)[h];
      acc.mapper[0] += S.mapper(bare, a, h, eyesBare.player(h)); acc.mapper[1] += S.mapper(adj, a, h, eyes.player(h));
      const rnd = S.mulberry32(a * 31 + h);
      acc.wander[0] += S.wanderer(bare, a, h, rnd, 400 * m.N, eyesBare.player(h)); acc.wander[1] += S.wanderer(adj, a, h, rnd, 400 * m.N, eyes.player(h));
      const fb = S.follower(m, opBare, a, h, eyesBare.player(h)), fd = S.follower(open, op, a, h, eyes.player(h));
      if (fd.ok) (acc.hand[0] += fb.steps), (acc.hand[1] += fd.steps); else acc.fails++;
      acc.n++;
    }
  }
  const r = (x) => (x[1] / x[0]).toFixed(2).padStart(5);
  console.log(`${String(g).padStart(8)}  ${String(Math.round(acc.placed / floors)).padStart(6)}  ${((100 * acc.skipped) / acc.rooms).toFixed(1).padStart(6)}%  ${r(acc.path)}  ${r(acc.mapper)}   ${r(acc.wander)}   ${acc.hand[0] ? r(acc.hand) : '    —'}  ${((100 * acc.fails) / acc.n).toFixed(0).padStart(5)}%`);
}
