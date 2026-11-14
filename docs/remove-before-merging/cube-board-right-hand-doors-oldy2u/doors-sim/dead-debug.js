// A straight two-room dead end A–B off C: is B ever plainly dead?
const S = require('./sim.js');
const m = S.buildMaze(5, 7);
const adj = S.adjacency(m, []);
const [[a, h]] = S.randomPairs(m, 1, 3);
const r = S.deadEnds(m, [], a, h);
let shown = 0, stats = { dead: 0, entered: 0 };
for (let B = 0; B < m.N && shown < 400; B++) {
  if (adj[B].length !== 2) continue;
  const [p, q] = adj[B];
  const straight = p + q === 2 * B;
  if (process.argv[2] === 'straight' && !straight) continue;
  for (const [A, C] of [[p, q], [q, p]]) {
    if (adj[A].length !== 1) continue;
    shown++;
    stats[r.dead[B] ? 'dead' : 'entered']++;
    if (shown <= 5) console.log({ A, B, C, deadA: r.dead[A], deadB: r.dead[B], enteredB: r.entered[B], enteredC: r.entered[C] });
  }
}
console.log(stats);
