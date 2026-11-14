const S = require('./sim.js');
let bad = 0, walls = 0;
const ratio = [];
for (const k of [3, 4, 5, 6])
  for (let seed = 1; seed <= 20; seed++) {
    const m = S.buildMaze(k, seed);
    let open = 0;
    for (let i = 0; i < m.N; i++) open += m.openE[i] + m.openS[i];
    if (open !== m.N - 1) throw new Error(`k${k} s${seed}: ${open} open, want ${m.N - 1}`);
    for (const w of m.closed) {
      walls++;
      if (w.bound > w.exact) bad++;
      ratio.push(w.exact / w.bound);
    }
  }
ratio.sort((a, b) => a - b);
console.log({ walls, boundViolations: bad, medianExactOverBound: ratio[ratio.length >> 1].toFixed(2) });

const m = S.buildMaze(5, 1);
const ex = m.closed.map((w) => w.exact).sort((a, b) => a - b);
const q = (p) => ex[Math.floor(p * (ex.length - 1))];
console.log('32x32 closed walls', ex.length, 'exact quantiles 10/25/50/75/90:', [0.1, 0.25, 0.5, 0.75, 0.9].map(q));
for (const K of [0, 8, 32, 100])
  console.log('K', K, 'eligible exact', m.closed.filter((w) => w.exact >= K).length, 'bound', m.closed.filter((w) => w.bound >= K).length);

const t0 = Date.now();
for (const [K, metric] of [[0, 'exact'], [8, 'exact'], [32, 'exact'], [8, 'bound']]) {
  const rows = S.sweep({ k: 5, densities: [0, 2, 5, 10, 20, 50], minGap: K, metric, floors: 6, pairsPerFloor: 30, seed: 11 });
  console.log(`\nK=${K} (${metric})  per100 placed  path  mapper  wander  followFail`);
  for (const r of rows)
    console.log(`  ${String(r.perHundred).padStart(3)}  ${r.placedPerHundred.toFixed(1).padStart(5)}  ${r.path.toFixed(2)}  ${r.mapper.toFixed(2)}  ${r.wander.toFixed(2)}  ${(r.followFail * 100).toFixed(0)}%`);
}
console.log('ms', Date.now() - t0);
