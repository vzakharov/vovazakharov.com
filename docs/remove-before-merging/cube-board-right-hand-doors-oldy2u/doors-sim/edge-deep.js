// Hole targets of our world, floors 1..12, by brute force over each floor's rooms.
const { createHash } = require('node:crypto');
require('./world-holes.js');
const seed = require('./world.js').WORLD.seed;
const holes = globalThis.WORLD_HOLES;
for (let n = 1; n <= 12; n++) {
  const side = 1 << n, want = holes[n - 1];
  let hit = null;
  for (let y = 0; y < side && !hit; y++)
    for (let x = 0; x < side; x++)
      if (createHash('sha256').update(`${seed}/hole/${n}/${x}/${y}`).digest('hex') === want) { hit = [x, y]; break; }
  const [x, y] = hit, edge = Math.min(x, y, side - 1 - x, side - 1 - y);
  const inner = Math.max(0, side - 2 * (edge + 1));
  console.log(`target of floor ${n}'s hole, on floor ${n + 1} (${side}×${side}): (${x}, ${y}), edge ${edge}, P(uniform this close) ${(1 - (inner * inner) / (side * side)).toFixed(3)}`);
}
