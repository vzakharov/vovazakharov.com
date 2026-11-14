// The cube's floor maze, as src/cube/entities/world/model/maze.ts draws it by
// recursive division, with its spanning tree, closed walls and adjacency.
// Part of DoorSim: loaded after nothing, before doors.js.
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Arms of a block's cross, as maze.ts names them.
  const NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3;

  function levelOf(v) {
    let l = 1;
    while ((v >> (l - 1)) & 1) l++;
    return l;
  }

  /**
   * Floor with `s = 2^k` rooms across. Blocks come from `source(L, bx, by)`
   * when given (the game's own roll), else from a PRNG in a fixed order.
   */
  function buildMaze(k, seed, source) {
    const s = 1 << k;
    const N = s * s;
    const blocks = new Map();
    const at = (L, bx, by) => L * 1e6 + by * 1e3 + bx;
    if (!source) {
      const rnd = mulberry32(seed);
      for (let L = 1; L <= k; L++) {
        const half = 1 << (L - 1);
        const across = s >> L;
        for (let by = 0; by < across; by++)
          for (let bx = 0; bx < across; bx++)
            blocks.set(at(L, bx, by), {
              omit: Math.floor(rnd() * 4),
              door: [0, 1, 2, 3].map(() => Math.floor(rnd() * half)),
            });
      }
    }
    const block = (L, x, y) => {
      const key = at(L, x >> L, y >> L);
      if (!blocks.has(key)) blocks.set(key, source(L, x >> L, y >> L));
      return blocks.get(key);
    };
    const openE = new Uint8Array(N);
    const openS = new Uint8Array(N);
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) {
        if (x + 1 < s) {
          const L = levelOf(x), half = 1 << (L - 1), b = block(L, x, y);
          const inB = y & (2 * half - 1);
          const arm = inB < half ? NORTH : SOUTH;
          const off = inB < half ? inB : inB - half;
          openE[y * s + x] = b.omit !== arm && b.door[arm] === off ? 1 : 0;
        }
        if (y + 1 < s) {
          const L = levelOf(y), half = 1 << (L - 1), b = block(L, x, y);
          const inB = x & (2 * half - 1);
          const arm = inB < half ? WEST : EAST;
          const off = inB < half ? inB : inB - half;
          openS[y * s + x] = b.omit !== arm && b.door[arm] === off ? 1 : 0;
        }
      }
    const maze = { k, s, N, openE, openS, block };
    maze.tree = treeOf(maze);
    maze.closed = closedWalls(maze);
    return maze;
  }

  function treeNeighbours(m, i) {
    const { s, openE, openS } = m;
    const x = i % s, y = (i / s) | 0, out = [];
    if (x + 1 < s && openE[i]) out.push(i + 1);
    if (x > 0 && openE[i - 1]) out.push(i - 1);
    if (y + 1 < s && openS[i]) out.push(i + s);
    if (y > 0 && openS[i - s]) out.push(i - s);
    return out;
  }

  function treeOf(m) {
    const parent = new Int32Array(m.N).fill(-2);
    const depth = new Int32Array(m.N);
    const queue = [0];
    parent[0] = -1;
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h];
      for (const v of treeNeighbours(m, u))
        if (parent[v] === -2) {
          parent[v] = u;
          depth[v] = depth[u] + 1;
          queue.push(v);
        }
    }
    if (queue.length !== m.N) throw new Error('floor is not connected');
    return { parent, depth };
  }

  function treeDistance(m, a, b) {
    const { parent, depth } = m.tree;
    let d = 0;
    while (depth[a] > depth[b]) (a = parent[a]), d++;
    while (depth[b] > depth[a]) (b = parent[b]), d++;
    while (a !== b) (a = parent[a]), (b = parent[b]), (d += 2);
    return d;
  }

  function closedWalls(m) {
    const { s, openE, openS } = m, out = [];
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) {
        const i = y * s + x;
        if (x + 1 < s && !openE[i]) out.push({ dir: 'E', x, y, a: i, b: i + 1 });
        if (y + 1 < s && !openS[i]) out.push({ dir: 'S', x, y, a: i, b: i + s });
      }
    for (const w of out) {
      w.level = levelOf(w.dir === 'E' ? w.x : w.y);
      w.exact = treeDistance(m, w.a, w.b);
    }
    return out;
  }

  function adjacency(m, doors) {
    const adj = Array.from({ length: m.N }, (_, i) => treeNeighbours(m, i));
    for (const d of doors) adj[d.a].push(d.b), adj[d.b].push(d.a);
    return adj;
  }

  function bfs(adj, from) {
    const dist = new Int32Array(adj.length).fill(-1);
    const q = [from];
    dist[from] = 0;
    for (let h = 0; h < q.length; h++)
      for (const v of adj[q[h]]) if (dist[v] < 0) (dist[v] = dist[q[h]] + 1), q.push(v);
    return dist;
  }

  root.DoorSimParts = Object.assign(root.DoorSimParts || {}, { mulberry32, NORTH, EAST, SOUTH, WEST, levelOf, buildMaze, treeNeighbours, treeDistance, adjacency, bfs });
})(typeof globalThis !== 'undefined' ? globalThis : this);
