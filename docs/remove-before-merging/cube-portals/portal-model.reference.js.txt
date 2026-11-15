// Portals placed by index, so either end can be found from the other in O(1).
// Loaded after world.js; in Node it requires it.
(function (root) {
  'use strict';
  const W = root.DoorWorld || (typeof require === 'function' ? require('./world.js') : null);

  const EDGES = ['north', 'east', 'south', 'west'];
  /**
   * Where portals may stand, by the shallowest partition level allowed. `big`: arms 16 walls
   * long and up, which always hold a doorway, and the portal takes it. `any`: every arm of 2
   * walls and up, and the portal gets a wall of its own there, never the passage or the doorway.
   */
  const MODES = { any: 2, big: 5 };
  let mode = 'any';
  const FIRST = 6, LAST = 66;
  /** One portal per this many rooms: ~15.5 rooms a door, one door in 60 a portal. */
  const ROOMS_PER_PORTAL = 960n;

  const word = W.pathHash(W.WORLD.seed);
  const wide = (path) => (BigInt(word(`${path}/0`)) << 32n) | BigInt(word(`${path}/1`));
  /** An integer uniform on [0, count), from a 64-bit draw. */
  const below = (path, count) => (wide(path) * count) >> 64n;

  const levelsOf = (n) => { const out = []; for (let L = n - 1; L >= MODES[mode]; L--) out.push(L); return out; };
  const acrossAt = (n, L) => 1n << BigInt(n - 1 - L);
  const roomsOf = (n) => 1n << BigInt(2 * (n - 1));

  /** The partitions on floor n where a portal may stand, in the current mode. */
  function sitesOf(n) {
    let total = 0n;
    for (const L of levelsOf(n)) total += 4n * acrossAt(n, L) ** 2n;
    return total;
  }
  /** Site i of floor n, the top level first, its blocks row by row, arms in maze.ts's order. */
  function siteAt(n, i) {
    for (const L of levelsOf(n)) {
      const across = acrossAt(n, L), count = 4n * across * across;
      if (i < count) {
        const b = i / 4n;
        return { L, bx: b % across, by: b / across, arm: EDGES[Number(i % 4n)] };
      }
      i -= count;
    }
    throw new RangeError(`floor ${n} has no site ${i}`);
  }
  function indexOfSite(n, { L, bx, by, arm }) {
    let i = 0n;
    for (const l of levelsOf(n)) {
      const across = acrossAt(n, l);
      if (l === L) return i + (by * across + bx) * 4n + BigInt(EDGES.indexOf(arm));
      i += 4n * across * across;
    }
    return null;
  }

  function portalsOf(n) {
    if (n < FIRST || n > LAST) return 0n;
    const k = (roomsOf(n) + ROOMS_PER_PORTAL / 2n) / ROOMS_PER_PORTAL;
    return k < 1n ? 1n : k;
  }

  /**
   * How a hub rolls the floor below. `mirror`: k floors down with weight 4^−k, the law a spoke's
   * climb already follows because each floor holds four times the hubs of the one above it.
   * `uniform`: every floor below alike.
   */
  const LAWS = ['mirror', 'uniform'];
  let law = 'mirror';
  /** The mean floors a hub on floor n drops, under law `l`. */
  function meanDrop(n, l = law) {
    const span = LAST - n;
    if (span <= 0) return 0;
    if (l === 'uniform') return (span + 1) / 2;
    let w = 0, s = 0;
    for (let k = 1; k <= span; k++) { const p = 4 ** -k; w += p; s += k * p; }
    return s / w;
  }

  /**
   * Where a floor's hub share comes from. `fair`: the share at which a portal picked at random
   * moves a player down as far as up on average, h·drop = (1 − h)·climb. `fewest`: as many hubs as
   * the floor can hold while keeping a spoke for every hub above, so the fewest spokes. `line`:
   * `top` on floor 7, `bottom` on floor 65, linear between, in ten-thousandths, set by hand.
   * Above ¾ some floor would hold fewer spokes than the hubs above it, so a hub could roll a floor
   * with no way back to it.
   */
  const RULES = ['fair', 'fewest', 'line'];
  let rule = 'fair';
  const SHARE_MIN = 0.05, SHARE_MAX = 0.75, SHARE_DEN = 10000n, SPAN = 58n, SCALE = 1e12;
  const share = { top: 7500n, bottom: 2500n };
  /** Hubs and the hubs above, per floor, for the current rule; `cut` lists floors the invariant trimmed. */
  let hubTable = null;

  /**
   * Hubs lead down, spokes up: the first floor has nothing above to point at, the last nothing
   * below. Between them round(h(n)·K) under `r`, cut where needed so the floor keeps a spoke for
   * every hub above. `climb[n]` is how far a spoke of floor n lifts on average, `drift[n]` how far
   * a portal picked at random on floor n moves a player down on average (negative: up).
   */
  function tableFor(r = rule, l = law) {
    const hubs = [], above = [], cut = [], climb = [], drift = [], h = [];
    let total = 0n, sumH = 0, sumHm = 0;
    for (let n = FIRST; n <= LAST; n++) {
      const k = portalsOf(n), d = BigInt(n - FIRST - 1);
      above[n] = total;
      climb[n] = sumH ? n - sumHm / sumH : 0;
      let v = k;
      if (n === LAST) v = 0n;
      else if (n > FIRST) {
        if (r === 'fewest') v = k;
        else if (r === 'fair') {
          const fair = climb[n] / (climb[n] + meanDrop(n, l)), s = BigInt(Math.round(fair * SCALE)), S = BigInt(SCALE);
          v = (2n * k * s + S) / (2n * S);
        } else {
          const num = share.top * (SPAN - d) + share.bottom * d, den = SPAN * SHARE_DEN;
          v = (2n * k * num + den) / (2n * den);
        }
        if (v > k - total) { v = k - total > 0n ? k - total : 0n; if (r !== 'fewest') cut.push(n); }
      }
      hubs[n] = v;
      h[n] = Number(v) / Number(k);
      drift[n] = h[n] * meanDrop(n, l) - (1 - h[n]) * climb[n];
      total += v;
      sumH += Number(v);
      sumHm += Number(v) * n;
    }
    return { hubs, above, cut, climb, drift, h };
  }
  const tableOf = () => hubTable || (hubTable = tableFor());
  const hubsOf = (n) => (n < FIRST || n > LAST ? 0n : tableOf().hubs[n]);
  const spokesOf = (n) => portalsOf(n) - hubsOf(n);
  /** Every hub on the floors above n, numbered from floor 6 down. */
  const hubsAbove = (n) => (n <= FIRST ? 0n : n > LAST ? tableOf().above[LAST] + tableOf().hubs[LAST] : tableOf().above[n]);
  /** Floors where round(h·K) would leave fewer spokes than hubs above, and was cut. */
  const cutFloors = () => tableOf().cut;

  const toShare = (h) => {
    const v = Math.min(SHARE_MAX, Math.max(SHARE_MIN, Number(h)));
    if (!Number.isFinite(v)) throw new RangeError(`hub share ${h} is not a number`);
    return BigInt(Math.round(v * Number(SHARE_DEN)));
  };
  /** Sets the shares on floors 7 and 65, each clamped to [SHARE_MIN, SHARE_MAX]; returns those in force. */
  function setHubShare(top, bottom = top) {
    share.top = toShare(top);
    share.bottom = toShare(bottom);
    hubTable = null;
    return hubShare();
  }
  const hubShare = () => ({ top: Number(share.top) / Number(SHARE_DEN), bottom: Number(share.bottom) / Number(SHARE_DEN), rule, law });
  /** Switches where the hub share comes from; returns the rule in force. */
  function setShareRule(r) {
    if (!RULES.includes(r)) throw new RangeError(`no share rule ${r}`);
    rule = r;
    hubTable = null;
    return rule;
  }
  /** Switches how a hub rolls its floor; returns the law in force. The fair share follows it. */
  function setDescent(l) {
    if (!LAWS.includes(l)) throw new RangeError(`no descent law ${l}`);
    law = l;
    hubTable = null;
    return law;
  }

  /** Switches where portals stand; returns the mode in force. */
  function setSiteMode(m) {
    if (!(m in MODES)) throw new RangeError(`no site mode ${m}`);
    mode = m;
    return mode;
  }
  const siteMode = () => mode;

  /**
   * A keyed bijection on [0, size): a four-round Feistel network over the
   * smallest even bit width that holds it, walked until it lands inside.
   */
  function permutation(n) {
    const size = sitesOf(n);
    let bits = 1;
    while (1n << BigInt(2 * bits) < size) bits++;
    const b = BigInt(bits), mask = (1n << b) - 1n;
    const F = (r, half) => wide(`portal/${n}/perm/${r}/${half}`) & mask;
    const enc = (x) => { let l = x >> b, r = x & mask; for (let k = 0; k < 4; k++) [l, r] = [r, l ^ F(k, r)]; return (l << b) | r; };
    const dec = (x) => { let l = x >> b, r = x & mask; for (let k = 3; k >= 0; k--) [l, r] = [r ^ F(k, l), l]; return (l << b) | r; };
    const walk = (f) => (x) => { let y = f(x); while (y >= size) y = f(y); return y; };
    return { size, forward: walk(enc), inverse: walk(dec) };
  }
  const perms = new Map();
  const permOf = (n) => { const key = `${mode}/${n}`; return perms.get(key) || perms.set(key, permutation(n)).get(key); };

  /** The portal standing on site i of floor n, or null: its number is the site's place in the permutation. */
  function portalAtSite(n, i) {
    if (n < FIRST) return null;
    const k = permOf(n).forward(i);
    return k < portalsOf(n) ? portalByNumber(n, k) : null;
  }
  function portalByNumber(n, k) {
    const hubs = hubsOf(n);
    return k < hubs ? { n, k, role: 'hub', h: k } : { n, k, role: 'spoke', j: k - hubs };
  }
  const siteOfPortal = (n, k) => siteAt(n, permOf(n).inverse(k));

  // A partition's walls, as maze.ts's spotOf and wallOf number them: offset 0 at the end nearer
  // the origin; the north and south arms are east walls, the west and east arms south walls.
  const halfOf = (L) => 1n << BigInt(L - 1);
  const runsOut = (arm) => arm === 'south' || arm === 'east';
  /** The wall `offset` along a site's partition, as [E|S, x, y] of the room west or north of it. */
  function wallOfSite({ L, bx, by, arm }, offset) {
    const half = halfOf(L), x = bx << BigInt(L), y = by << BigInt(L), along = (runsOut(arm) ? half : 0n) + offset;
    return arm === 'north' || arm === 'south' ? { dir: 'E', x: x + half - 1n, y: y + along } : { dir: 'S', x: x + along, y: y + half - 1n };
  }
  /** wallOfSite's inverse, for a wall known to lie on the site's partition. */
  function offsetOfWall({ L, bx, by, arm }, { dir, x, y }) {
    const half = halfOf(L), along = dir === 'E' ? BigInt(y) - (by << BigInt(L)) : BigInt(x) - (bx << BigInt(L));
    return along - (runsOut(arm) ? half : 0n);
  }
  /** The partition's native passage, as the game's block roll places it; null on the arm its block omits. */
  function passageOf(n, { L, bx, by, arm }) {
    const roll = W.blockSource(W.WORLD.seed, n)(L, bx, by), a = EDGES.indexOf(arm);
    return roll.omit === a ? null : BigInt(roll.door[a]);
  }
  /**
   * The wall a portal takes in `any` mode: uniform among its partition's walls but the passage
   * and the doorway (`doorway` its offset, or null), under portal/{n}/wall/{L}/{bx}/{by}/{arm}.
   * A level-2 arm with a passage is never far enough round for a doorway, so a wall is always left.
   */
  function portalWallOf(n, site, doorway) {
    const barred = [passageOf(n, site), doorway].filter((v) => v !== null).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const allowed = halfOf(site.L) - BigInt(barred.length);
    if (allowed <= 0n) throw new Error(`floor ${n}: partition ${site.L}/${site.bx}/${site.by}/${site.arm} has no wall left`);
    let offset = below(`portal/${n}/wall/${site.L}/${site.bx}/${site.by}/${site.arm}`, allowed);
    for (const skip of barred) if (skip <= offset) offset += 1n;
    return offset;
  }

  /** Hub number g counted over all floors from 6 down, and back. */
  function hubByGlobal(g) {
    for (let m = FIRST; m < LAST; m++) {
      const h = hubsOf(m);
      if (g < h) return { n: m, h: g };
      g -= h;
    }
    throw new RangeError(`no hub ${g}`);
  }
  const globalOfHub = (m, h) => hubsAbove(m) + h;

  /**
   * Spoke j of floor n leads to hub j mod A, A the hubs above it, numbered
   * from floor 6 down: arithmetic on the spoke's number, so a hub finds its
   * own spokes on any floor without listing anyone's.
   */
  function spokeTarget(n, j) {
    const { n: m, h } = hubByGlobal(j % hubsAbove(n));
    return { n: m, k: h, role: 'hub', h };
  }
  /** Floor n's spokes leading to hub h of floor m: numbered first, first + step, …, `count` of them. */
  function spokesOfHubOn(n, m, h) {
    const S = spokesOf(n), first = globalOfHub(m, h), step = hubsAbove(n);
    return { first, step, count: S > first ? (S - first + step - 1n) / step : 0n };
  }
  /**
   * Where hub h of floor m leads in hour `epoch`: a floor below rolled
   * alike, then one of that floor's spokes back to this hub, rolled alike.
   */
  function floorBelow(m, path) {
    if (law === 'uniform') return m + 1 + Number(below(path, BigInt(LAST - m)));
    // Weights 4^(LAST−n) for n = m+1 … LAST, so one floor further down weighs a quarter as much.
    let total = 0n;
    for (let n = m + 1; n <= LAST; n++) total += 1n << BigInt(2 * (LAST - n));
    let r = below(path, total);
    for (let n = m + 1; n <= LAST; n++) {
      const w = 1n << BigInt(2 * (LAST - n));
      if (r < w) return n;
      r -= w;
    }
    return LAST;
  }
  function hubTarget(m, h, epoch) {
    const base = `hub/${m}/${h}/${epoch}`;
    const n = floorBelow(m, `${base}/floor`);
    const { first, step, count } = spokesOfHubOn(n, m, h);
    if (count === 0n) throw new Error(`floor ${n} has no spoke back to hub ${m}/${h}`);
    const j = first + below(`${base}/spoke`, count) * step;
    return { n, k: hubsOf(n) + j, role: 'spoke', j, of: count };
  }

  const P = {
    EDGES, MODES, FIRST, LAST, SHARE_MIN, SHARE_MAX, setHubShare, hubShare, cutFloors, setSiteMode, siteMode,
    RULES, LAWS, setShareRule, setDescent, tableFor, tableOf, meanDrop,
    sitesOf, siteAt, indexOfSite, portalsOf, hubsOf, spokesOf, hubsAbove, permOf, portalAtSite, portalByNumber, siteOfPortal,
    wallOfSite, offsetOfWall, passageOf, portalWallOf, hubByGlobal, globalOfHub, spokeTarget, spokesOfHubOn, hubTarget, roomsOf,
  };
  root.PortalModel = P;
  if (typeof module !== 'undefined') module.exports = P;
})(typeof globalThis !== 'undefined' ? globalThis : this);
