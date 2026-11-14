// Through a far door, for a hole anywhere on the floor: how often stepping through brings the hole
// closer, how often farther, and by how much; and how lopsided single doors are.
const S = require('./sim.js');
const k = +(process.argv[2] || 6);
const shares = [], gain = [0, 0], loss = [0, 0];
for (let f = 0; f < 3; f++) {
  const m = S.buildMaze(k, 7 + f);
  const { doors } = S.placeDoors(m, { perHundred: 0.5, minGap: 48, spacing: 'arm', roll: S.seededRoll(101 + f) });
  const adj = S.adjacency(m, []); // each door judged alone, against the bare tree
  for (const d of doors) {
    const da = S.bfs(adj, d.a), db = S.bfs(adj, d.b);
    let better = 0, worse = 0;
    for (let h = 0; h < m.N; h++) {
      const delta = db[h] + 1 - da[h]; // through the door and on, against walking the tree from a
      if (delta < 0) better++, (gain[0] -= delta), gain[1]++;
      else if (delta > 0) worse++, (loss[0] += delta), loss[1]++;
    }
    shares.push(better / m.N, worse / m.N);
    // and the same door taken from b's side
    let b2 = 0;
    for (let h = 0; h < m.N; h++) if (da[h] + 1 < db[h]) b2++;
    shares.push(b2 / m.N, (m.N - b2) / m.N);
  }
}
const helps = shares.filter((_, i) => i % 2 === 0).sort((a, b) => a - b);
const q = (p) => helps[Math.floor(p * (helps.length - 1))].toFixed(2);
console.log(`floor ${k + 1}: ${helps.length / 2} doors × 2 sides`);
console.log(`share of the floor a door brings closer, per side: min ${q(0)}, quartiles ${q(0.25)} / ${q(0.5)} / ${q(0.75)}, max ${q(1)}`);
console.log(`mean gain when it helps ${(gain[0] / gain[1]).toFixed(0)} steps, mean loss when it hurts ${(loss[0] / loss[1]).toFixed(0)} steps`);
