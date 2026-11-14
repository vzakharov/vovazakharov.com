// How many allowed walls the O(1) bound gives up, against the exact walk round.
const S = require('./sim.js');
for (const k of [5, 7])
  for (const K of [8, 48]) {
    let b = 0, e = 0, rooms = 0;
    for (let f = 0; f < 4; f++) {
      const m = S.buildMaze(k, 11 + f * 7919);
      b += m.closed.filter((w) => w.bound >= K).length;
      e += m.closed.filter((w) => w.exact >= K).length;
    }
    console.log(`${1 << k}×${1 << k}, threshold ${K}: allowed by bound ${b / 4}, by exact ${e / 4}`);
  }
