// The explorers that look for the hole, and the sweep over many floors. Part of
// DoorSim: loaded after maze.js and doors.js.
(function (root) {
  'use strict';
  const { mulberry32, buildMaze, adjacency, bfs, placeDoors, seededRoll } = root.DoorSimParts;

  /** `steps` moves from `start`, each to a random neighbouring room, door and gap alike: the rooms stood in, in order. */
  function randomWalk(adj, start, steps, rnd) {
    const out = [start];
    for (let cur = start, t = 0; t < steps; t++) out.push((cur = adj[cur][Math.floor(rnd() * adj[cur].length)]));
    return out;
  }

  /**
   * `steps` moves of a player who remembers every room: always on to the
   * nearest room not yet entered, the way back through known rooms included.
   */
  function exploreWalk(adj, start, steps) {
    const N = adj.length, entered = new Uint8Array(N), prev = new Int32Array(N), stamp = new Int32Array(N);
    const out = [start];
    entered[start] = 1;
    let cur = start, round = 0;
    while (out.length <= steps) {
      round++;
      const q = [cur];
      stamp[cur] = round;
      let found = -1;
      for (let h = 0; h < q.length && found < 0; h++)
        for (const v of adj[q[h]]) {
          if (stamp[v] === round) continue;
          stamp[v] = round; prev[v] = q[h];
          if (!entered[v]) { found = v; break; }
          q.push(v);
        }
      if (found < 0) break;
      const leg = [];
      for (let r = found; r !== cur; r = prev[r]) leg.push(r);
      for (let j = leg.length - 1; j >= 0 && out.length <= steps; j--) out.push(leg[j]);
      entered[found] = 1;
      cur = found;
    }
    return out;
  }

  /**
   * What a walk through `rooms` meets of `openings`: one counts as met when the
   * walk stands in either room it joins. `met` is distinct openings, `passes`
   * every arrival beside one, repeats included, `rooms` the distinct rooms.
   */
  function metAlong(rooms, openings) {
    const beside = new Map();
    openings.forEach((d, j) => { for (const r of [d.a, d.b]) { if (!beside.has(r)) beside.set(r, []); beside.get(r).push(j); } });
    const met = new Uint8Array(openings.length), walked = new Set();
    let distinct = 0, passes = 0;
    for (const r of rooms) {
      walked.add(r);
      const list = beside.get(r);
      if (!list) continue;
      passes++;
      for (const j of list) if (!met[j]) (met[j] = 1), distinct++;
    }
    return { met: distinct, passes, rooms: walked.size };
  }

  /**
   * A player with a perfect map: always walks to the nearest unvisited room.
   * Given `eye`, a player's sight, it never steps into a room it has seen to
   * be plainly dead; so for the wanderer and the right hand.
   */
  function mapper(adj, start, hole, eye = null) {
    const N = adj.length, visited = new Uint8Array(N), d = new Int32Array(N);
    const seen = new Int32Array(N).fill(-1);
    let cur = start, steps = 0, stamp = 0;
    visited[cur] = 1;
    eye?.enter(cur);
    while (cur !== hole) {
      stamp++;
      const q = [cur];
      seen[cur] = stamp;
      d[cur] = 0;
      let next = -1;
      for (let h = 0; h < q.length && next < 0; h++) {
        const u = q[h];
        for (const v of adj[u]) {
          if (seen[v] === stamp || eye?.dead[v]) continue;
          seen[v] = stamp;
          d[v] = d[u] + 1;
          if (!visited[v]) { next = v; break; }
          q.push(v);
        }
      }
      steps += d[next];
      cur = next;
      visited[cur] = 1;
      eye?.enter(cur);
    }
    return steps;
  }

  /** A lost player: every step to a random neighbouring room. */
  function wanderer(adj, start, hole, rnd, cap, eye = null) {
    let cur = start, steps = 0;
    eye?.enter(cur);
    while (cur !== hole && steps < cap) {
      const n = eye ? adj[cur].filter((v) => !eye.dead[v]) : adj[cur];
      cur = n[Math.floor(rnd() * n.length)];
      eye?.enter(cur);
      steps++;
    }
    return steps;
  }

  /** Right hand on the wall; fails when it comes back to where it started. */
  function follower(m, open, start, hole, eye = null) {
    const { s } = m;
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    let cur = start, face = 1, steps = 0;
    const seen = new Uint8Array(m.N * 4);
    while (cur !== hole) {
      const st = cur * 4 + face;
      if (seen[st]) return { ok: false, steps };
      seen[st] = 1;
      eye?.enter(cur);
      for (const turn of [1, 0, 3, 2]) {
        const f = (face + turn) % 4;
        const x = (cur % s) + DX[f], y = ((cur / s) | 0) + DY[f];
        if (x < 0 || y < 0 || x >= s || y >= s) continue;
        const to = y * s + x;
        if (open(cur, to) && !eye?.dead[to]) { face = f; cur = to; steps++; break; }
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

  /**
   * The openings a player walking from `from` to `to` would gain by, were they standing at one:
   * seen from the side the walk reaches first, every shortest way on to `to` steps through it.
   * A side tie looks from both sides.
   */
  function shortcuts(adj, from, to, openings) {
    const df = bfs(adj, from), dt = bfs(adj, to);
    const through = (x, y) => dt[x] === dt[y] + 1 && adj[x].every((v) => v === y || dt[v] !== dt[x] - 1);
    return openings.filter((w) => (df[w.a] <= df[w.b] && through(w.a, w.b)) || (df[w.b] <= df[w.a] && through(w.b, w.a)));
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

  root.DoorSimParts = Object.assign(root.DoorSimParts || {}, { randomWalk, exploreWalk, metAlong, shortcuts, mapper, wanderer, follower, opener, trial, randomPairs, sweep });
})(typeof globalThis !== 'undefined' ? globalThis : this);
