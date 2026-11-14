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

  /**
   * Doors in closed interior walls. A door is a property of the wall, so both
   * faces show it and no wall holds two; perimeter walls are never candidates.
   * `perHundred` doors per 100 rooms, among walls whose walk round is at least
   * `minGap`, decided locally by `roll` as the game would.
   */
  function placeDoors(m, { perHundred, minGap, spacing = 'none', roll }) {
    const eligible = m.closed.filter((w) => w.exact >= minGap);
    const want = Math.round((perHundred * m.N) / 100);
    return { doors: rolledDoors(eligible, want, spacing, roll), eligible: eligible.length, want };
  }

  /** A stand-in for the world roll on sandbox floors: FNV-1a over `${seed}/${path}`, then a murmur finaliser. */
  function seededRoll(seed) {
    return (path) => {
      let h = 0x811c9dc5;
      const text = `${seed}/${path}`;
      for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
      h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
      return h >>> 0;
    };
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
  function sweep({ k, densities, minGap, spacing, floors, pairsPerFloor, seed }) {
    return densities.map((perHundred) => {
      const acc = { path: [0, 0], mapper: [0, 0], wander: [0, 0], followFail: [0, 0], followSteps: [0, 0], followOk: [0, 0], n: 0, placed: 0 };
      for (let f = 0; f < floors; f++) {
        const m = buildMaze(k, seed + f * 7919);
        const { doors } = placeDoors(m, { perHundred, minGap, spacing, roll: seededRoll(seed + f * 104729 + 1) });
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

  /**
   * Half a wall's thickness in a room's side, as the game's room-shape.ts has
   * it. A closed side is a wall that thick on the side's line, an open side is
   * no wall at all, and a post of the same section stands at every grid
   * vertex any wall touches (the post overstates a wall's end by at most this).
   */
  const WALL_HALF = 0.012;
  // Sides of a room: east, south, west, north.
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
  const cross = (ax, ay, bx, by) => ax * by - ay * bx;

  /**
   * Who never enters which room because it is plainly a dead end. The player
   * sweeps out from `landing` in breadth-first order, remembering every wall
   * face seen from each room entered: from its middle and from the threshold
   * of each of its open sides. A room is plainly dead when every side but the
   * one towards the player is a wall seen to be blank or an opening into a
   * plainly dead room; a room once entered, and the hole's, never is. A glimpse
   * of a wall proves a side closed while the floor has no doors, since a side
   * is open whole or not at all; with doors the whole face must be seen.
   */
  function deadEnds(m, doors, landing, hole) {
    const { s, N, openE, openS } = m, T = WALL_HALF;
    const doorAt = new Set(doors.map((d) => `${d.dir}${d.a}`));
    const whole = doors.length > 0;
    const sideOpen = (i, d) => {
      const x = i % s, y = (i / s) | 0, nx = x + DX[d], ny = y + DY[d];
      if (nx < 0 || ny < 0 || nx >= s || ny >= s) return false;
      return d === 0 ? !!openE[i] : d === 1 ? !!openS[i] : d === 2 ? !!openE[i - 1] : !!openS[i - s];
    };
    const sideDoor = (i, d) => (d === 0 ? doorAt.has(`E${i}`) : d === 1 ? doorAt.has(`S${i}`) : d === 2 ? doorAt.has(`E${i - 1}`) : doorAt.has(`S${i - s}`));
    const perimeter = (i, d) => { const x = i % s + DX[d], y = ((i / s) | 0) + DY[d]; return x < 0 || y < 0 || x >= s || y >= s; };
    // A vertex carries a post when any of the four sides meeting there is a wall.
    const wallV = (X, yc) => yc >= 0 && yc < s && (X === 0 || X === s || !openE[yc * s + X - 1]);
    const wallH = (xc, Y) => xc >= 0 && xc < s && (Y === 0 || Y === s || !openS[(Y - 1) * s + xc]);
    const post = (X, Y) => wallV(X, Y - 1) || wallV(X, Y) || wallH(X - 1, Y) || wallH(X, Y);

    // Cone ∩ the directions from (ex, ey) through segment P–Q; null when empty.
    function through(cone, ex, ey, px, py, qx, qy) {
      let ax = px - ex, ay = py - ey, bx = qx - ex, by = qy - ey;
      if (cross(ax, ay, bx, by) < 0) [ax, ay, bx, by] = [bx, by, ax, ay];
      if (!cone) return cross(ax, ay, bx, by) > 1e-12 ? [ax, ay, bx, by] : null;
      const [rx, ry, lx, ly] = cone;
      const [Rx, Ry] = cross(rx, ry, ax, ay) > 0 ? [ax, ay] : [rx, ry];
      const [Lx, Ly] = cross(bx, by, lx, ly) > 0 ? [bx, by] : [lx, ly];
      return cross(Rx, Ry, Lx, Ly) > 1e-12 ? [Rx, Ry, Lx, Ly] : null;
    }
    // The part of room i's side d inside the cone, as an interval of [0, 1] along its face.
    function faceSeen(i, d, cone, ex, ey) {
      const x = i % s, y = (i / s) | 0, span = 1 - 2 * T;
      const [px, py, dx, dy] = d === 0 ? [x + 1 - T, y + T, 0, span] : d === 1 ? [x + T, y + 1 - T, span, 0] : d === 2 ? [x + T, y + T, 0, span] : [x + T, y + T, span, 0];
      let lo = 0, hi = 1;
      const clip = (c0, c1) => { // c0 + t·c1 ≥ 0
        if (Math.abs(c1) < 1e-15) { if (c0 < 0) hi = -1; return; }
        const t = -c0 / c1;
        if (c1 > 0) lo = Math.max(lo, t); else hi = Math.min(hi, t);
      };
      const [rx, ry, lx, ly] = cone;
      clip(cross(rx, ry, px - ex, py - ey), cross(rx, ry, dx, dy));
      clip(cross(px - ex, py - ey, lx, ly), cross(dx, dy, lx, ly));
      return hi - lo > 1e-9 ? [lo, hi] : null;
    }
    // Every wall face seen from (ex, ey) in room `from`, through open sides only.
    function look(from, ex, ey, onFace) {
      const walk = (i, cone, back) => {
        const x = i % s, y = (i / s) | 0;
        for (let d = 0; d < 4; d++) {
          if (d === back) continue;
          if (!sideOpen(i, d)) {
            if (cone) { const seen = faceSeen(i, d, cone, ex, ey); if (seen) onFace(i, d, seen); }
            continue;
          }
          // The aperture between the posts, on both faces of the wall line.
          let c = cone;
          for (const off of [-T, T]) {
            if (d === 0 || d === 2) {
              const X = d === 0 ? x + 1 : x, a = y + (post(X, y) ? T : 0), b = y + 1 - (post(X, y + 1) ? T : 0);
              c = c === null && cone !== null ? null : through(c, ex, ey, X + off, a, X + off, b);
            } else {
              const Y = d === 1 ? y + 1 : y, a = x + (post(x, Y) ? T : 0), b = x + 1 - (post(x + 1, Y) ? T : 0);
              c = c === null && cone !== null ? null : through(c, ex, ey, a, Y + off, b, Y + off);
            }
            if (c === null) break;
          }
          if (c) walk(i + DX[d] + DY[d] * s, c, (d + 2) % 4);
        }
      };
      walk(from, null, -1);
    }

    const seenOn = new Map(); // room·4 + side → merged intervals
    const known = new Uint8Array(N * 4);
    const unresolved = new Uint8Array(N).fill(4);
    const entered = new Uint8Array(N), dead = new Uint8Array(N);
    const cover = (i, d) => {
      if (known[i * 4 + d]) return;
      known[i * 4 + d] = 1;
      unresolved[i]--;
      settle(i);
    };
    function settle(i) {
      if (entered[i] || dead[i] || i === hole || unresolved[i] !== 1) return;
      let out = -1;
      for (let d = 0; d < 4; d++) if (!known[i * 4 + d]) out = d;
      if (!sideOpen(i, out)) return;
      dead[i] = 1;
      const j = i + DX[out] + DY[out] * s;
      cover(j, (out + 2) % 4);
    }
    const onFace = (i, d, [lo, hi]) => {
      if (known[i * 4 + d] || sideDoor(i, d)) return;
      if (!whole || perimeter(i, d)) return cover(i, d);
      const key = i * 4 + d, list = (seenOn.get(key) || []).concat([[lo, hi]]).sort((u, v) => u[0] - v[0]);
      seenOn.set(key, list);
      let reach = 0;
      for (const [a, b] of list) { if (a > reach + 1e-6) break; reach = Math.max(reach, b); }
      if (reach >= 1 - 1e-6) cover(i, d);
    };
    const enter = (i) => {
      entered[i] = 1;
      const x = i % s, y = (i / s) | 0, inset = 0.06;
      look(i, x + 0.5, y + 0.5, onFace);
      for (let d = 0; d < 4; d++)
        if (sideOpen(i, d)) look(i, x + 0.5 + DX[d] * (0.5 - inset), y + 0.5 + DY[d] * (0.5 - inset), onFace);
    };
    const adj = adjacency(m, doors), queued = new Uint8Array(N), q = [landing];
    queued[landing] = 1;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      if (dead[u]) continue;
      enter(u);
      for (const v of adj[u]) if (!queued[v]) { queued[v] = 1; q.push(v); }
    }
    return { entered, dead, skipped: N - entered.reduce((a, b) => a + b, 0) };
  }

  root.DoorSim = { buildMaze, placeDoors, seededRoll, deadEnds, WALL_HALF, redundant, adjacency, bfs, mapper, wanderer, follower, opener, trial, randomPairs, sweep, treeDistance, levelOf, mulberry32 };
  if (typeof module !== 'undefined') module.exports = root.DoorSim;
})(typeof globalThis !== 'undefined' ? globalThis : this);
