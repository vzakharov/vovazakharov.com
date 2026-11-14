// Door simulator over the cube's floor maze: recursive division exactly as
// src/cube/entities/world/model/maze.ts draws it, plus openable doors in
// closed interior walls, plus three explorers that look for the hole.
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

  /**
   * A lower bound on the tree distance across a closed wall, read off the one
   * block whose cross holds the wall: the path stays inside that block, so it
   * goes through the cross's doors in a known order, and inside each quadrant
   * it is at least the Manhattan distance. O(1), so it scales to any floor.
   */
  function localBound(m, w) {
    const { x, y } = w;
    if (w.dir === 'E') {
      const L = levelOf(x), half = 1 << (L - 1), b = m.block(L, x, y);
      const X0 = (x >> L) << L, Y0 = (y >> L) << L;
      const cw = X0 + half - 1, ce = X0 + half, rn = Y0 + half - 1, rs = Y0 + half;
      const same = y - Y0 < half ? NORTH : SOUTH;
      if (b.omit !== same) {
        const yd = (same === NORTH ? Y0 : Y0 + half) + b.door[same];
        return 2 * Math.abs(y - yd) + 1;
      }
      const other = same === NORTH ? SOUTH : NORTH;
      const near = same === NORTH ? rn : rs, far = same === NORTH ? rs : rn;
      const xw = X0 + b.door[WEST];
      const yo = (other === NORTH ? Y0 : Y0 + half) + b.door[other];
      const xe = X0 + half + b.door[EAST];
      return (
        Math.abs(cw - xw) + Math.abs(y - near) + 1 +
        Math.abs(xw - cw) + Math.abs(far - yo) + 1 +
        Math.abs(ce - xe) + Math.abs(yo - far) + 1 +
        Math.abs(xe - ce) + Math.abs(near - y)
      );
    }
    const L = levelOf(y), half = 1 << (L - 1), b = m.block(L, x, y);
    const X0 = (x >> L) << L, Y0 = (y >> L) << L;
    const cw = X0 + half - 1, ce = X0 + half, rn = Y0 + half - 1, rs = Y0 + half;
    const same = x - X0 < half ? WEST : EAST;
    if (b.omit !== same) {
      const xd = (same === WEST ? X0 : X0 + half) + b.door[same];
      return 2 * Math.abs(x - xd) + 1;
    }
    const other = same === WEST ? EAST : WEST;
    const near = same === WEST ? cw : ce, far = same === WEST ? ce : cw;
    const yn = Y0 + b.door[NORTH];
    const xo = (other === WEST ? X0 : X0 + half) + b.door[other];
    const ys = Y0 + half + b.door[SOUTH];
    return (
      Math.abs(x - near) + Math.abs(rn - yn) + 1 +
      Math.abs(far - xo) + Math.abs(yn - rn) + 1 +
      Math.abs(xo - far) + Math.abs(rs - ys) + 1 +
      Math.abs(near - x) + Math.abs(ys - rs)
    );
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
      w.bound = localBound(m, w);
    }
    return out;
  }

  /**
   * Doors in closed interior walls. A door is a property of the wall, so both
   * faces show it and no wall holds two; perimeter walls are never candidates.
   * `perHundred` doors per 100 rooms, among walls whose `metric` distance is
   * at least `minGap`.
   */
  function placeDoors(m, { perHundred, minGap, metric, seed, spacing = 'none', roll = null }) {
    const rnd = mulberry32(seed);
    const eligible = m.closed.filter((w) => w[metric] >= minGap);
    const want = Math.round((perHundred * m.N) / 100);
    if (roll) return { doors: rolledDoors(eligible, want, spacing, roll), eligible: eligible.length, want };
    const pool = eligible.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const doors = [];
    if (spacing === 'none') doors.push(...pool.slice(0, want));
    if (spacing === 'arm') {
      // At most one door per arm of a block's cross: the arm is the run of
      // walls between the same two quadrants, so a second door there only
      // repeats the first. Decided per arm, so it stays local on any floor.
      const taken = new Set();
      for (const w of pool) {
        if (doors.length >= want) break;
        if (taken.has(armOf(w))) continue;
        taken.add(armOf(w));
        doors.push(w);
      }
    }
    if (spacing === 'greedy') {
      // Reference only, global: a door must still save `minGap` once the
      // doors already placed are open.
      const adj = adjacency(m, []);
      for (const w of pool) {
        if (doors.length >= want) break;
        if (withinGap(adj, w.a, w.b, minGap, null)) continue;
        doors.push(w);
        adj[w.a].push(w.b), adj[w.b].push(w.a);
      }
    }
    return { doors, eligible: eligible.length, want };
  }

  /**
   * Doors decided locally from a world roll, `roll(path)` a uint32 for a path
   * under the floor's own prefix: each
   * перегородка (or each wall, with no spacing) asks whether it has a door and,
   * per перегородка, at which of its allowed walls. The per-unit odds are the
   * one global input: on the real floor they would be a constant per depth.
   */
  function rolledDoors(eligible, want, spacing, roll) {
    const unit = (path) => roll(path) / 2 ** 32;
    if (spacing !== 'arm') {
      const p = Math.min(1, want / Math.max(1, eligible.length));
      return eligible.filter((w) => unit(`${w.dir}/${w.x}/${w.y}/has`) < p);
    }
    const arms = new Map();
    for (const w of eligible) {
      const key = armOf(w);
      if (!arms.has(key)) arms.set(key, []);
      arms.get(key).push(w);
    }
    const p = Math.min(1, want / Math.max(1, arms.size));
    const doors = [];
    for (const [key, walls] of arms) {
      if (unit(`${key}/has`) >= p) continue;
      walls.sort((u, v) => u.x - v.x || u.y - v.y);
      doors.push(walls[Math.floor(unit(`${key}/at`) * walls.length)]);
    }
    return doors;
  }

  function armOf(w) {
    const along = w.dir === 'E' ? w.y : w.x;
    const L = w.level, half = 1 << (L - 1);
    const first = (along & (2 * half - 1)) < half;
    return `${w.dir}${L}|${w.x >> L}|${w.y >> L}|${first ? 0 : 1}`;
  }

  /** Whether `b` is reachable from `a` in fewer than `gap` steps, never over the edge `skip`. */
  function withinGap(adj, a, b, gap, skip) {
    if (gap <= 1) return false;
    const depth = new Map([[a, 0]]);
    const q = [a];
    for (let h = 0; h < q.length; h++) {
      const u = q[h], du = depth.get(u);
      if (du + 1 >= gap) continue;
      for (const v of adj[u]) {
        if (skip && ((u === skip.a && v === skip.b) || (u === skip.b && v === skip.a))) continue;
        if (depth.has(v)) continue;
        if (v === b) return true;
        depth.set(v, du + 1);
        q.push(v);
      }
    }
    return false;
  }

  /** Doors that, with every other door open, save fewer than `gap` steps. */
  function redundant(m, doors, gap) {
    const adj = adjacency(m, doors);
    return doors.filter((d) => withinGap(adj, d.a, d.b, gap, d)).length;
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

  /** A player with a perfect map: always walks to the nearest unvisited room. */
  function mapper(adj, start, hole) {
    const N = adj.length, visited = new Uint8Array(N), d = new Int32Array(N);
    const seen = new Int32Array(N).fill(-1);
    let cur = start, steps = 0, stamp = 0;
    visited[cur] = 1;
    while (cur !== hole) {
      stamp++;
      const q = [cur];
      seen[cur] = stamp;
      d[cur] = 0;
      let next = -1;
      for (let h = 0; h < q.length && next < 0; h++) {
        const u = q[h];
        for (const v of adj[u]) {
          if (seen[v] === stamp) continue;
          seen[v] = stamp;
          d[v] = d[u] + 1;
          if (!visited[v]) { next = v; break; }
          q.push(v);
        }
      }
      steps += d[next];
      cur = next;
      visited[cur] = 1;
    }
    return steps;
  }

  /** A lost player: every step to a random neighbouring room. */
  function wanderer(adj, start, hole, rnd, cap) {
    let cur = start, steps = 0;
    while (cur !== hole && steps < cap) {
      const n = adj[cur];
      cur = n[Math.floor(rnd() * n.length)];
      steps++;
    }
    return steps;
  }

  /** Right hand on the wall; fails when it comes back to where it started. */
  function follower(m, open, start, hole) {
    const { s } = m;
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    let cur = start, face = 1, steps = 0;
    const seen = new Uint8Array(m.N * 4);
    while (cur !== hole) {
      const st = cur * 4 + face;
      if (seen[st]) return { ok: false, steps };
      seen[st] = 1;
      for (const turn of [1, 0, 3, 2]) {
        const f = (face + turn) % 4;
        const x = (cur % s) + DX[f], y = ((cur / s) | 0) + DY[f];
        if (x < 0 || y < 0 || x >= s || y >= s) continue;
        const to = y * s + x;
        if (open(cur, to)) { face = f; cur = to; steps++; break; }
      }
    }
    return { ok: true, steps };
  }

  function opener(m, doors) {
    const set = new Set();
    for (const d of doors) set.add(d.a * m.N + d.b), set.add(d.b * m.N + d.a);
    return (a, b) => {
      const lo = Math.min(a, b), hi = Math.max(a, b);
      if (hi - lo === 1) { if (m.openE[lo]) return true; }
      else if (m.openS[lo]) return true;
      return set.has(a * m.N + b);
    };
  }

  /** Every explorer over `pairs` (landing, hole), on the bare floor and with doors. */
  function trial(m, doors, pairs, seed) {
    const bare = adjacency(m, []), withDoors = adjacency(m, doors);
    const openBare = opener(m, []), openDoors = opener(m, doors);
    const rnd = mulberry32(seed);
    const cap = 400 * m.N;
    const r = { path: [0, 0], mapper: [0, 0], wander: [0, 0], followFail: [0, 0], followSteps: [0, 0], followOk: [0, 0], n: pairs.length };
    pairs.forEach(([a, h]) => {
      [bare, withDoors].forEach((adj, j) => {
        r.path[j] += bfs(adj, a)[h];
        r.mapper[j] += mapper(adj, a, h);
        r.wander[j] += wanderer(adj, a, h, rnd, cap);
        const f = follower(m, j ? openDoors : openBare, a, h);
        if (f.ok) (r.followSteps[j] += f.steps), r.followOk[j]++;
        else r.followFail[j]++;
      });
    });
    return r;
  }

  function randomPairs(m, count, seed) {
    const rnd = mulberry32(seed), out = [];
    while (out.length < count) {
      const a = Math.floor(rnd() * m.N), h = Math.floor(rnd() * m.N);
      if (a !== h) out.push([a, h]);
    }
    return out;
  }

  /** Ratios with-doors / bare, averaged over several floors. */
  function sweep({ k, densities, minGap, metric, spacing, floors, pairsPerFloor, seed }) {
    return densities.map((perHundred) => {
      const acc = { path: [0, 0], mapper: [0, 0], wander: [0, 0], followFail: [0, 0], followSteps: [0, 0], followOk: [0, 0], n: 0, placed: 0 };
      for (let f = 0; f < floors; f++) {
        const m = buildMaze(k, seed + f * 7919);
        const { doors } = placeDoors(m, { perHundred, minGap, metric, spacing, seed: seed + f * 104729 + 1 });
        acc.placed += doors.length;
        const r = trial(m, doors, randomPairs(m, pairsPerFloor, seed + f * 31 + 3), seed + f);
        for (const key of ['path', 'mapper', 'wander', 'followFail', 'followSteps', 'followOk'])
          (acc[key][0] += r[key][0]), (acc[key][1] += r[key][1]);
        acc.n += r.n;
      }
      return {
        perHundred,
        placedPerHundred: (acc.placed / floors / (1 << (2 * k))) * 100,
        path: acc.path[1] / acc.path[0],
        mapper: acc.mapper[1] / acc.mapper[0],
        wander: acc.wander[1] / acc.wander[0],
        followFail: acc.followFail[1] / acc.n,
        raw: acc,
      };
    });
  }

  root.DoorSim = { buildMaze, placeDoors, redundant, adjacency, bfs, mapper, wanderer, follower, opener, trial, randomPairs, sweep, treeDistance, levelOf, mulberry32 };
  if (typeof module !== 'undefined') module.exports = root.DoorSim;
})(typeof globalThis !== 'undefined' ? globalThis : this);
