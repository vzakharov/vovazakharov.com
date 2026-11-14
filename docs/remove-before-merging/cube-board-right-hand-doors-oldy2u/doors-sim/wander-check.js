// Openings met in an hour of walking (0.28 room sides a second, step.ts's
// WALK_SPEED), by threshold and density: a random wanderer and an explorer who
// remembers every room, against the target of a door a minute and a gap every
// three. Density 100 shows the ceiling the threshold and spacing leave.
// node wander-check.js [k] [doorShare]
const S = require('./sim.js');
const k = +(process.argv[2] || 7), doorShare = +(process.argv[3] || 0.75);
const STEPS = Math.round(3600 * 0.28), floors = 3, runs = 20;
for (const spacing of ['arm', 'none'])
  for (const minGap of [2, 4, 8, 16, 24])
    for (const per of [5, 10, 20, 100]) {
      const acc = { placed: 0, rnd: [0, 0, 0], exp: [0, 0, 0] };
      for (let f = 0; f < floors; f++) {
        const m = S.buildMaze(k, 7 + f * 7919);
        const p = S.placeDoors(m, { perHundred: per, minGap, doorShare, spacing, roll: S.seededRoll(101 + f) });
        acc.placed += (100 * (p.doors.length + p.gaps.length)) / m.N;
        const adj = S.adjacency(S.withGaps(m, p.gaps), p.doors), rnd = S.mulberry32(13 + f);
        for (let r = 0; r < runs; r++) {
          const start = Math.floor(rnd() * m.N);
          for (const [key, rooms] of [['rnd', S.randomWalk(adj, start, STEPS, rnd)], ['exp', S.exploreWalk(adj, start, STEPS)]]) {
            const d = S.metAlong(rooms, p.doors), g = S.metAlong(rooms, p.gaps);
            acc[key][0] += d.met; acc[key][1] += g.met; acc[key][2] += d.rooms;
          }
        }
      }
      const n = floors * runs, f0 = (x) => Math.round(x / n);
      console.log(`${spacing} gap≥${minGap} ask ${per}/100 → ${(acc.placed / floors).toFixed(1)}/100 placed | wanderer: ${f0(acc.rnd[0])} doors, ${f0(acc.rnd[1])} gaps, ${f0(acc.rnd[2])} rooms | explorer: ${f0(acc.exp[0])} doors, ${f0(acc.exp[1])} gaps, ${f0(acc.exp[2])} rooms`);
    }
