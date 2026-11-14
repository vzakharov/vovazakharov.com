// What players see on one floor, and which rooms they never enter. Part of
// DoorSim: loaded after maze.js.
(function (root) {
  'use strict';
  const { adjacency } = root.DoorSimParts;

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
   * What players see on one floor. `look` follows line of sight from a point
   * through open sides only; `views(i)` caches every wall face seen from room
   * i's middle and from the threshold of each of its open sides, which is
   * where a player entering it looks from. `player(hole)` is one player's
   * memory of those faces: a room is plainly dead when every side but the one
   * towards the player is a wall seen to be blank or an opening into a
   * plainly dead room; a room once entered, and the hole's, never is. A
   * glimpse of a wall proves a side closed while the floor has no doors,
   * since a side is open whole or not at all; with doors the whole face must
   * be seen.
   */
  function eyesOf(m, doors) {
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

    const cache = new Array(N);
    function views(i) {
      if (cache[i]) return cache[i];
      const out = [], x = i % s, y = (i / s) | 0, inset = 0.06;
      const note = (j, d, [lo, hi]) => { if (!sideDoor(j, d)) out.push(j * 4 + d, lo, hi); };
      look(i, x + 0.5, y + 0.5, note);
      for (let d = 0; d < 4; d++)
        if (sideOpen(i, d)) look(i, x + 0.5 + DX[d] * (0.5 - inset), y + 0.5 + DY[d] * (0.5 - inset), note);
      return (cache[i] = out);
    }

    function player(hole) {
      const seenOn = new Map(); // room·4 + side → merged intervals
      const known = new Uint8Array(N * 4);
      const unresolved = new Uint8Array(N).fill(4);
      const entered = new Uint8Array(N), dead = new Uint8Array(N);
      const cover = (key) => {
        if (known[key]) return;
        known[key] = 1;
        const i = key >> 2;
        unresolved[i]--;
        settle(i);
      };
      function settle(i) {
        if (entered[i] || dead[i] || i === hole || unresolved[i] !== 1) return;
        let out = -1;
        for (let d = 0; d < 4; d++) if (!known[i * 4 + d]) out = d;
        if (!sideOpen(i, out)) return;
        dead[i] = 1;
        cover((i + DX[out] + DY[out] * s) * 4 + ((out + 2) % 4));
      }
      const face = (key, lo, hi) => {
        if (known[key]) return;
        if (!whole || perimeter(key >> 2, key & 3)) return cover(key);
        const list = (seenOn.get(key) || []).concat([[lo, hi]]).sort((u, v) => u[0] - v[0]);
        seenOn.set(key, list);
        let reach = 0;
        for (const [a, b] of list) { if (a > reach + 1e-6) break; reach = Math.max(reach, b); }
        if (reach >= 1 - 1e-6) cover(key);
      };
      const enter = (i) => {
        if (entered[i]) return;
        entered[i] = 1;
        const v = views(i);
        for (let k = 0; k < v.length; k += 3) face(v[k], v[k + 1], v[k + 2]);
      };
      return { enter, entered, dead };
    }
    return { views, player };
  }

  /** The rooms a player sweeping out from `landing` breadth-first never enters. */
  function deadEnds(m, doors, landing, hole, eyes = eyesOf(m, doors)) {
    const p = eyes.player(hole), adj = adjacency(m, doors), queued = new Uint8Array(m.N), q = [landing];
    queued[landing] = 1;
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      if (p.dead[u]) continue;
      p.enter(u);
      for (const v of adj[u]) if (!queued[v]) { queued[v] = 1; q.push(v); }
    }
    return { entered: p.entered, dead: p.dead, skipped: m.N - p.entered.reduce((a, b) => a + b, 0) };
  }

  root.DoorSimParts = Object.assign(root.DoorSimParts || {}, { WALL_HALF, eyesOf, deadEnds });
})(typeof globalThis !== 'undefined' ? globalThis : this);
