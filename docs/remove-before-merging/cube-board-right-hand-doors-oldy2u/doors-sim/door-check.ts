import { createRequire } from 'node:module';

import world from '@/cube/entities/world/config/world.json';
import { holeQuarter } from '@/cube/entities/world/model/hole';
import { isOpenEast, isOpenSouth, maze } from '@/cube/entities/world/model/maze';

const require = createRequire(import.meta.url);
const dir = '/tmp/claude-0/-home-user-vovazakharov-com/503672e1-831b-5ede-adbf-df4dc837e88d/scratchpad/doors/';
const S = require(`${dir}sim.js`);
const W = require(`${dir}world.js`);
require(`${dir}world-holes.js`);

const rolled = maze(world.seed);
for (const n of [5, 6, 7, 8]) {
  const k = n - 1;
  const m = S.buildMaze(k, 0, W.blockSource(world.seed, n));
  let bad = 0;
  for (let y = 0; y < m.s; y++)
    for (let x = 0; x < m.s; x++) {
      const i = y * m.s + x;
      if (x + 1 < m.s && !!m.openE[i] !== isOpenEast(rolled, n, BigInt(x), BigInt(y))) bad++;
      if (y + 1 < m.s && !!m.openS[i] !== isOpenSouth(rolled, n, BigInt(x), BigInt(y))) bad++;
    }
  const { landing, hole } = await W.gameFloor(n);
  const hx = hole % m.s, hy = Math.floor(hole / m.s);
  const q = await holeQuarter(world, n, BigInt(hx), BigInt(hy));
  console.log(`floor ${n}: wall mismatches ${bad}, landing (${landing % m.s}, ${Math.floor(landing / m.s)}), hole (${hx}, ${hy}) game says quarter ${JSON.stringify(q)}`);
}
