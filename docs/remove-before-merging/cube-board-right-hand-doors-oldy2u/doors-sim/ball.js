// Rooms a search 48 steps deep visits on the bare tree, and how long it takes.
const S = require('./sim.js');
const m = S.buildMaze(7, 11);
const adj = S.adjacency(m, []);
let total = 0, max = 0;
const t = process.hrtime.bigint();
for (let r = 0; r < 2000; r++) {
  const from = (r * 7919) % m.N, depth = new Map([[from, 0]]), q = [from];
  for (let h = 0; h < q.length; h++) {
    const u = q[h], d = depth.get(u);
    if (d + 1 >= 48) continue;
    for (const v of adj[u]) if (!depth.has(v)) depth.set(v, d + 1), q.push(v);
  }
  total += q.length; max = Math.max(max, q.length);
}
console.log(`mean ${Math.round(total / 2000)} rooms, max ${max}, ${(Number(process.hrtime.bigint() - t) / 2000 / 1e6).toFixed(3)} ms a search without hashing`);
