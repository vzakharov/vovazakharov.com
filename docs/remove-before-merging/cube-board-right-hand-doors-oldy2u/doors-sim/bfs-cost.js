// What one walk-round check costs as the game would run it: a bounded BFS of
// depth K from one side of a wall, every wall it meets decided on the spot from
// the world's hashes (no floor built in advance), cold and with blocks cached.
// node bfs-cost.js [floor] [K] [walls]
const W = require('./world.js');
const n = +(process.argv[2] || 30), K = +(process.argv[3] || 48), count = +(process.argv[4] || 200);
const side = 2 ** (n - 1);
const levelOf = (v) => { let l = 1; while (Math.floor(v / 2 ** (l - 1)) % 2 === 1) l++; return l; };

function floor(cached) {
  const src = W.blockSource(W.WORLD.seed, n), cache = new Map();
  let hashed = 0;
  const block = (L, x, y) => {
    const key = `${L}/${Math.floor(x / 2 ** L)}/${Math.floor(y / 2 ** L)}`;
    if (cached && cache.has(key)) return cache.get(key);
    hashed++;
    const b = src(L, Math.floor(x / 2 ** L), Math.floor(y / 2 ** L));
    if (cached) cache.set(key, b);
    return b;
  };
  // maze.ts's isOpenEast / isOpenSouth, on doubles (exact up to floor 53).
  const open = (L, x, y, along, first, second) => {
    const half = 2 ** (L - 1), inB = along % (2 * half), inFirst = inB < half;
    const b = block(L, x, y), arm = inFirst ? first : second;
    return b.omit !== arm && b.door[arm] === (inFirst ? inB : inB - half);
  };
  const east = (x, y) => x + 1 < side && open(levelOf(x), x, y, y, 0, 2);
  const south = (x, y) => y + 1 < side && open(levelOf(y), x, y, x, 3, 1);
  const nb = (x, y) => {
    const out = [];
    if (east(x, y)) out.push([x + 1, y]);
    if (x > 0 && east(x - 1, y)) out.push([x - 1, y]);
    if (south(x, y)) out.push([x, y + 1]);
    if (y > 0 && south(x, y - 1)) out.push([x, y - 1]);
    return out;
  };
  return { nb, east, hashed: () => hashed };
}

// Whether (x+1, y) is within K steps of (x, y) the long way: the check a door candidate needs.
function within(f, x, y) {
  const seen = new Set([`${x},${y}`]);
  let front = [[x, y]], rooms = 1;
  for (let d = 1; d < K && front.length; d++) {
    const next = [];
    for (const [a, b] of front)
      for (const [c, e] of f.nb(a, b)) {
        if (a === x && b === y && c === x + 1 && e === y) continue;
        const k = `${c},${e}`;
        if (seen.has(k)) continue;
        if (c === x + 1 && e === y) return { near: true, rooms };
        seen.add(k); next.push([c, e]); rooms++;
      }
    front = next;
  }
  return { near: false, rooms };
}

for (const cached of [false, true]) {
  const f = floor(cached);
  let rooms = 0, t = 0, done = 0, far = 0;
  for (let i = 0; done < count; i++) {
    const x = Math.floor(((i * 2654435761) % 1e9) / 1e9 * (side - 1)), y = Math.floor(((i * 40503) % 1e6) / 1e6 * side);
    if (f.east(x, y)) continue; // only closed walls are candidates
    const t0 = process.hrtime.bigint();
    const r = within(f, x, y);
    t += Number(process.hrtime.bigint() - t0) / 1e6;
    rooms += r.rooms; done++; if (!r.near) far++;
  }
  console.log(`floor ${n}, K ${K}, ${cached ? 'blocks cached across checks' : 'cold, every block hashed afresh'}: ${(t / count).toFixed(2)} ms a wall, ${Math.round(rooms / count)} rooms visited, ${Math.round(f.hashed() / count)} blocks hashed a wall, ${Math.round((100 * far) / count)}% eligible`);
}
