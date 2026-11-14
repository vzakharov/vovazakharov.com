// Where our world's holes sit relative to the floor's edge, floors 2..10.
require('./world-holes.js');
const W = require('./world.js');
(async () => {
  for (let n = 2; n <= 10; n++) {
    const side = 1 << (n - 1);
    const { hole, landing } = await W.gameFloor(n);
    const at = (i) => [i % side, Math.floor(i / side)];
    const edge = ([x, y]) => Math.min(x, y, side - 1 - x, side - 1 - y);
    const [hx, hy] = at(hole), [lx, ly] = at(landing);
    // Chance a uniform room is at least this close to the edge.
    const d = edge([hx, hy]), inner = Math.max(0, side - 2 * (d + 1));
    console.log(`floor ${n} ${side}x${side}: hole (${hx},${hy}) edge ${d}, P(uniform this close)=${(1 - (inner * inner) / (side * side)).toFixed(2)}; landing (${lx},${ly}) edge ${edge([lx, ly])}`);
  }
})();
