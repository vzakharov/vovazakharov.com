// Openable doors and gaps in the maze's closed interior walls. Part of DoorSim:
// loaded after maze.js.
(function (root) {
  'use strict';
  const { NORTH, EAST, SOUTH, WEST, treeNeighbours, adjacency } = root.DoorSimParts;

  /**
   * Openings in closed interior walls, `perHundred` per 100 rooms among walls
   * whose walk round is at least `minGap`, decided locally by `roll` as the
   * game would. An opening is a door, with odds `doorShare`, or else a gap
   * (the wall simply missing), by a roll of its own wall's. A door is a
   * property of the wall, so both faces show it and no wall holds two;
   * perimeter walls are never candidates.
   */
  function placeDoors(m, { perHundred, minGap, maxGap = Infinity, doorShare = 1, spacing = 'none', roll, window = false }) {
    const found = window ? eligibleByWindow(m, minGap) : { eligible: m.closed.filter((w) => w.exact >= minGap && w.exact < maxGap), searched: null };
    const { eligible } = found;
    const want = Math.round((perHundred * m.N) / 100);
    const doors = [], gaps = [];
    for (const w of rolledDoors(eligible, want, spacing, roll)) (roll(`${w.dir}/${w.x}/${w.y}/kind`) / 2 ** 32 < doorShare ? doors : gaps).push(w);
    return { doors, gaps, eligible: eligible.length, want, searched: found.searched };
  }

  /**
   * The walls whose walk round is at least `minGap`, found as the game would:
   * never from the floor's whole tree. The way round crosses the wall's arm
   * only at its passage, or turns a blind arm's centre end, so it is at least
   * 2·d + 1 for d walls between the wall and that point; a bounded search runs
   * only where that bound falls short. `searched` counts those searches.
   */
  function eligibleByWindow(m, minGap) {
    const adj = Array.from({ length: m.N }, (_, i) => treeNeighbours(m, i));
    const eligible = [];
    let searched = 0;
    for (const w of m.closed) {
      const along = w.dir === 'E' ? w.y : w.x, L = w.level, half = 1 << (L - 1);
      const inB = along & (2 * half - 1), first = inB < half, off = first ? inB : inB - half;
      const arm = w.dir === 'E' ? (first ? NORTH : SOUTH) : first ? WEST : EAST;
      const b = m.block(L, w.x, w.y);
      const anchor = b.omit === arm ? (first ? half - 1 : 0) : b.door[arm];
      if (2 * Math.abs(off - anchor) + 1 >= minGap) { eligible.push(w); continue; }
      searched++;
      if (!withinGap(adj, w.a, w.b, minGap)) eligible.push(w);
    }
    return { eligible, searched };
  }

  /** The floor with `gaps` knocked out of its walls: a copy whose open sides include them. */
  function withGaps(m, gaps) {
    if (!gaps.length) return m;
    const openE = m.openE.slice(), openS = m.openS.slice();
    for (const g of gaps) (g.dir === 'E' ? openE : openS)[g.a] = 1;
    const gone = new Set(gaps);
    return { ...m, openE, openS, closed: m.closed.filter((w) => !gone.has(w)) };
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
   * Openings decided locally from a world roll, `roll(path)` a uint32 for a
   * path under the floor's own prefix: each перегородка (or each wall, with
   * no spacing) asks whether it has an opening and, per перегородка, at which
   * of its allowed walls. The per-unit odds are the one global input: on the
   * real floor they would be a constant per depth.
   */
  function rolledDoors(eligible, want, spacing, roll) {
    const unit = (path) => roll(path) / 2 ** 32;
    if (spacing === 'none') {
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
    const out = [];
    for (const [key, walls] of arms) {
      if (unit(`${key}/has`) >= p) continue;
      if (spacing === 'armAny') {
        // The roll picks among all of the arm's walls and the one it lands on is checked alone,
        // as a floor too deep to list an arm's eligible walls has to.
        const half = 1 << (walls[0].level - 1), at = Math.floor(unit(`${key}/at`) * half);
        const hit = walls.find((w) => ((w.dir === 'E' ? w.y : w.x) & (half - 1)) === at);
        if (hit) out.push(hit);
        continue;
      }
      walls.sort((u, v) => u.x - v.x || u.y - v.y);
      out.push(walls[Math.floor(unit(`${key}/at`) * walls.length)]);
    }
    return out;
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

  root.DoorSimParts = Object.assign(root.DoorSimParts || {}, { placeDoors, withGaps, seededRoll, withinGap, redundant });
})(typeof globalThis !== 'undefined' ? globalThis : this);
