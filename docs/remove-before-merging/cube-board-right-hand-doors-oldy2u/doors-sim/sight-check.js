// Each explorer blind and sighted (never stepping into a room seen plainly dead), bare and with doors.
const S = require('./sim.js');
for (const k of [4, 5, 6]) {
  const acc = {};
  const add = (key, v) => ((acc[key] ||= [0, 0]), (acc[key][0] += v), acc[key][1]++);
  let ms = 0;
  for (let f = 0; f < (k < 6 ? 6 : 2); f++) {
    const m = S.buildMaze(k, 7 + f);
    for (const per of [0, 5]) {
      const { doors } = S.placeDoors(m, { perHundred: per, minGap: k < 6 ? 8 : 48, spacing: 'arm', roll: S.seededRoll(101 + f) });
      const adj = S.adjacency(m, doors), open = S.opener(m, doors), eyes = S.eyesOf(m, doors);
      const tag = per ? 'doors' : 'bare';
      for (const [a, h] of S.randomPairs(m, k < 6 ? 12 : 6, 3 + f)) {
        const t = Date.now();
        add(`${tag} mapper blind`, S.mapper(adj, a, h));
        add(`${tag} mapper sighted`, S.mapper(adj, a, h, eyes.player(h)));
        const rnd = S.mulberry32(a * 31 + h);
        add(`${tag} wander blind`, S.wanderer(adj, a, h, rnd, 400 * m.N));
        add(`${tag} wander sighted`, S.wanderer(adj, a, h, rnd, 400 * m.N, eyes.player(h)));
        const fb = S.follower(m, open, a, h), fs = S.follower(m, open, a, h, eyes.player(h));
        if (fb.ok && fs.ok) add(`${tag} hand blind`, fb.steps), add(`${tag} hand sighted`, fs.steps);
        add(`${tag} hand fails blind`, fb.ok ? 0 : 1), add(`${tag} hand fails sighted`, fs.ok ? 0 : 1);
        ms += Date.now() - t;
      }
    }
  }
  console.log(`k${k} (${ms} ms)`);
  for (const [key, [sum, n]] of Object.entries(acc)) console.log(`  ${key.padEnd(26)} ${(sum / n).toFixed(key.includes('fails') ? 2 : 0)}`);
}
