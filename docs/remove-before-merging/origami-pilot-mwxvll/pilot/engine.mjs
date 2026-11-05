// Layered folding engine: paper is a set of convex pieces, each with its
// polygon in paper coordinates, a 2D affine placement in the flat folded
// state, a stacking key, and an optional 3D shaping matrix applied on top.
// A fold splits pieces by a line, moves the selected flap (closed over paper
// connectivity) across it, and restacks it above or below.

const EPS = 1e-9;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const norm = (a) => mul(a, 1 / Math.hypot(a[0], a[1]));

// 2D affine: [a, b, c, d, tx, ty] maps (u,v) -> (a u + b v + tx, c u + d v + ty)
const apply = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[4], m[2] * p[0] + m[3] * p[1] + m[5]];
const compose = (m2, m1) => [
  m2[0] * m1[0] + m2[1] * m1[2],
  m2[0] * m1[1] + m2[1] * m1[3],
  m2[2] * m1[0] + m2[3] * m1[2],
  m2[2] * m1[1] + m2[3] * m1[3],
  m2[0] * m1[4] + m2[1] * m1[5] + m2[4],
  m2[2] * m1[4] + m2[3] * m1[5] + m2[5],
];
const invert = (m) => {
  const det = m[0] * m[3] - m[1] * m[2];
  const a = m[3] / det, b = -m[1] / det, c = -m[2] / det, d = m[0] / det;
  return [a, b, c, d, -(a * m[4] + b * m[5]), -(c * m[4] + d * m[5])];
};
const det = (m) => m[0] * m[3] - m[1] * m[2];
const reflection = (p, d) => {
  const [x, y] = norm(d);
  const r = [x * x - y * y, 2 * x * y, 2 * x * y, y * y - x * x];
  const t = sub(p, [r[0] * p[0] + r[1] * p[1], r[2] * p[0] + r[3] * p[1]]);
  return [...r, ...t];
};

// 4x4 column-major (three.js order) helpers for shaping.
const m4identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const m4mul = (a, b) => {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
};
const m4rotAxis = (p, d, theta) => {
  // rotation by theta about the axis through (p.x, p.y, 0) along (d.x, d.y, 0)
  const [x, y] = norm(d);
  const c = Math.cos(theta), s = Math.sin(theta), t = 1 - c;
  const R = [
    t * x * x + c, t * x * y, -s * y, 0,
    t * x * y, t * y * y + c, s * x, 0,
    s * y, -s * x, c, 0,
    0, 0, 0, 1,
  ];
  const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, p[0], p[1], 0, 1];
  const Ti = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -p[0], -p[1], 0, 1];
  return m4mul(T, m4mul(R, Ti));
};
export const m4apply = (m, [x, y, z]) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];

const side = (pt, line) => cross(line.d, sub(pt, line.p));

const splitConvex = (poly, line, eps = 1e-9) => {
  const left = [], right = [];
  const s = poly.map((pt) => side(pt, line));
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const sa = s[i], sb = s[(i + 1) % poly.length];
    if (sa >= -eps) left.push(a);
    if (sa <= eps) right.push(a);
    if ((sa > eps && sb < -eps) || (sa < -eps && sb > eps)) {
      const t = sa / (sa - sb);
      const q = add(a, mul(sub(b, a), t));
      left.push(q);
      right.push(q);
    }
  }
  const area = (p) => Math.abs(p.reduce((acc, v, i) => acc + cross(v, p[(i + 1) % p.length]), 0) / 2);
  const dedupe = (p) => p.filter((v, i) => Math.hypot(...sub(v, p[(i + 1) % p.length])) > 1e-9);
  const L = dedupe(left), R = dedupe(right);
  return {
    left: L.length >= 3 && area(L) > 1e-9 ? L : null,
    right: R.length >= 3 && area(R) > 1e-9 ? R : null,
  };
};

const polyContains = (poly, pt, eps = 1e-7) => {
  // convex, either winding
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const c = cross(sub(poly[(i + 1) % poly.length], poly[i]), sub(pt, poly[i]));
    if (Math.abs(c) < eps) continue;
    if (sign === 0) sign = Math.sign(c);
    else if (Math.sign(c) !== sign) return false;
  }
  return true;
};

// Do two convex polygons overlap with positive area? (separating axis)
const overlaps = (A, B, eps = 1e-6) => {
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const e = sub(P[(i + 1) % P.length], P[i]);
      const n = [-e[1], e[0]];
      const pa = A.map((v) => dot(v, n)), pb = B.map((v) => dot(v, n));
      const len = Math.hypot(...n);
      if (Math.max(...pa) <= Math.min(...pb) + eps * len || Math.max(...pb) <= Math.min(...pa) + eps * len)
        return false;
    }
  }
  return true;
};

// Segments a-b and c-d collinear and overlapping with positive length?
const sharedSegment = (a, b, c, d, eps = 1e-7) => {
  const ab = sub(b, a);
  const len = Math.hypot(...ab);
  if (Math.abs(cross(ab, sub(c, a))) / len > eps || Math.abs(cross(ab, sub(d, a))) / len > eps) return false;
  const u = norm(ab);
  const t0 = 0, t1 = len;
  const tc = dot(sub(c, a), u), td = dot(sub(d, a), u);
  const lo = Math.max(t0, Math.min(tc, td)), hi = Math.min(t1, Math.max(tc, td));
  return hi - lo > eps ? [add(a, mul(u, lo)), add(a, mul(u, hi))] : false;
};

let nextId = 0;
const piece = (paper, A, z, S = m4identity(), tags = []) => ({ id: nextId++, paper, A, z, S, tags: new Set(tags) });

export const square = () => {
  nextId = 0;
  return { pieces: [piece([[0, 0], [1, 0], [1, 1], [0, 1]], [1, 0, 0, 1, 0, 0], 0)], log: [] };
};

const worldPoly = (pc) => pc.paper.map((p) => apply(pc.A, p));

const adjacent = (p, q) => {
  for (let i = 0; i < p.paper.length; i++)
    for (let j = 0; j < q.paper.length; j++) {
      const s = sharedSegment(p.paper[i], p.paper[(i + 1) % p.paper.length], q.paper[j], q.paper[(j + 1) % q.paper.length]);
      if (s) return s;
    }
  return null;
};

// Stack layers: local layer index = longest chain of overlapping pieces below.
export const layers = (state) => {
  const ps = [...state.pieces].sort((a, b) => a.z - b.z);
  const W = new Map(ps.map((p) => [p.id, worldPoly(p)]));
  const L = new Map();
  for (let i = 0; i < ps.length; i++) {
    let l = 0;
    for (let j = 0; j < i; j++) if (overlaps(W.get(ps[i].id), W.get(ps[j].id))) l = Math.max(l, L.get(ps[j].id) + 1);
    L.set(ps[i].id, l);
  }
  return L;
};

const lineOf = (spec) => {
  if (spec.p && spec.q) return { p: spec.p, d: sub(spec.q, spec.p) };
  if (spec.p && spec.d) return { p: spec.p, d: spec.d };
  throw new Error("bad line");
};

/**
 * fold(state, step):
 *  line: {p, q} in flat world coords
 *  moving: a world point on the side that moves
 *  select: "all" | { at: [x,y], top: k } | { at, bottom: k } | { tag } | { at, layers: [from, to] } (0 = bottom)
 *  dir: "valley" (flap swings up, lands on top) | "mountain" (swings down, lands below)
 *  angle: degrees; 180 is a flat fold; anything else is a shaping fold (3D only, final)
 *  tag: name for the moving set
 *  stopAt: optional tag set whose pieces never get pulled into the closure (for pre-cut/hinged experiments; unused by real paper)
 */
// World position (flat state) of a paper point, read off the piece that
// holds it; `pick` chooses among pieces sharing a crease point.
export const where = (state, pt) => {
  const pc = state.pieces.find((p) => polyContains(p.paper, pt));
  if (!pc) throw new Error(`paper point ${pt} not found`);
  return apply(pc.A, pt);
};

export const fold = (state, stepIn) => {
  const step = typeof stepIn === "function" ? stepIn(state) : stepIn;
  const line = lineOf(step.line);
  const movingSign = Math.sign(side(step.moving, line));
  if (!movingSign) throw new Error("moving point on the line");
  const angle = step.angle ?? 180;
  const flat = Math.abs(angle - 180) < 1e-9;
  const dir = step.dir ?? "valley";
  const sel = step.select ?? "all";

  // seeds
  let seeds;
  const L = layers(state);
  if (sel === "all") seeds = state.pieces.filter((p) => worldPoly(p).some((v) => side(v, line) * movingSign > EPS));
  else if (sel === "flap") seeds = state.pieces.filter((p) => polyContains(worldPoly(p), step.moving));
  else if (sel.tag) seeds = state.pieces.filter((p) => p.tags.has(sel.tag));
  else if (sel.ids) seeds = state.pieces.filter((p) => sel.ids.includes(p.id));
  else {
    const here = state.pieces.filter((p) => polyContains(worldPoly(p), sel.at)).sort((a, b) => a.z - b.z);
    if (!here.length) throw new Error(`nothing at ${sel.at}`);
    if (sel.all) seeds = here;
    else if (sel.top) seeds = here.slice(-sel.top);
    else if (sel.bottom) seeds = here.slice(0, sel.bottom);
    else if (sel.layers) seeds = here.slice(sel.layers[0], sel.layers[1] + 1);
    else throw new Error("bad select");
  }

  // closure over paper connectivity, splitting along the way
  const moving = new Set();
  const processed = new Set();
  const queue = seeds.map((p) => p.id);
  const byId = () => new Map(state.pieces.map((p) => [p.id, p]));
  let map = byId();
  const onLineWorld = (pc, seg) => seg.every((pt) => Math.abs(side(apply(pc.A, pt), line)) < 1e-7);
  while (queue.length) {
    const id = queue.shift();
    if (processed.has(id)) continue;
    processed.add(id);
    const pc = map.get(id);
    if (!pc) continue;
    // line in paper coords
    const Ai = invert(pc.A);
    const lp = { p: apply(Ai, line.p), d: sub(apply(Ai, add(line.p, line.d)), apply(Ai, line.p)) };
    const { left, right } = splitConvex(pc.paper, lp);
    // which paper-side is the moving side?
    const testPt = apply(Ai, add(line.p, mul([-line.d[1], line.d[0]], movingSign)));
    const movingIsLeft = side(testPt, lp) > 0;
    const mv = movingIsLeft ? left : right;
    const st = movingIsLeft ? right : left;
    if (!mv) continue; // entirely stationary
    let mpc = pc;
    if (st) {
      // split
      const a = piece(mv, pc.A, pc.z, pc.S, pc.tags);
      const b = piece(st, pc.A, pc.z, pc.S, pc.tags);
      state.pieces = state.pieces.filter((p) => p.id !== pc.id).concat([a, b]);
      map = byId();
      processed.add(a.id);
      processed.add(b.id);
      mpc = a;
    }
    moving.add(mpc.id);
    for (const q of state.pieces) {
      if (q.id === mpc.id || processed.has(q.id) && moving.has(q.id)) continue;
      const seg = adjacent(mpc, q);
      if (!seg) continue;
      if (onLineWorld(mpc, seg)) continue;
      if (step.stopAt && [...q.tags].some((t) => step.stopAt.includes(t))) continue;
      processed.delete(q.id);
      if (!moving.has(q.id)) queue.push(q.id);
    }
  }
  if (!moving.size) throw new Error("fold moved nothing");

  const mov = state.pieces.filter((p) => moving.has(p.id));
  if (step.tag) mov.forEach((p) => p.tags.add(step.tag));
  if (flat) {
    // Rotating a flap 180 degrees about a line in the table plane maps z to
    // -z, so its internal order reverses; valley lands it above everything,
    // mountain below.
    const R = reflection(line.p, line.d);
    const zs = state.pieces.filter((p) => !moving.has(p.id)).map((p) => p.z);
    const zmax = Math.max(0, ...zs), zmin = Math.min(0, ...zs);
    for (const p of mov) p.A = compose(R, p.A);
    if (dir === "valley" || dir === "mountain") {
      const order = [...mov].sort((a, b) => b.z - a.z); // former top first
      const base = dir === "valley" ? zmax + 1 : zmin - mov.length - 1;
      order.forEach((p, i) => (p.z = base + i));
    } else {
      // Reverse folds on a model folded in half: pieces tagged `upper`
      // (default "R") form the upper half of the stack. Each half's moving
      // part folds onto its own stationary part, inside (between the halves)
      // or outside (around them).
      const isUp = (p) => (step.lower ? !p.tags.has(step.lower) : p.tags.has(step.upper ?? "R"));
      const stat = state.pieces.filter((p) => !moving.has(p.id));
      const lowStat = stat.filter((p) => !isUp(p)).map((p) => p.z);
      const upStat = stat.filter(isUp).map((p) => p.z);
      const place = (group, anchor, above) => {
        const order = [...group].sort((a, b) => b.z - a.z); // former top first
        const n = order.length;
        order.forEach((p, i) => (p.z = above ? anchor + (i + 1) / (n + 1) : anchor - (n - i) / (n + 1)));
      };
      const lowMov = mov.filter((p) => !isUp(p)), upMov = mov.filter(isUp);
      if (dir === "inside") {
        place(lowMov, Math.max(...lowStat), true);
        place(upMov, Math.min(...upStat), false);
      } else if (dir === "outside") {
        place(lowMov, Math.min(...lowStat), false);
        place(upMov, Math.max(...upStat), true);
      } else throw new Error(`bad dir ${dir}`);
    }
    // renormalise
    const all = [...state.pieces].sort((a, b) => a.z - b.z);
    all.forEach((p, i) => (p.z = i));
  } else {
    const sgn = dir === "valley" ? 1 : -1;
    // rotation sign: left side rises with positive theta about d
    const theta = ((angle * Math.PI) / 180) * sgn * movingSign;
    const R = m4rotAxis(line.p, line.d, theta);
    for (const p of mov) p.S = m4mul(R, p.S);
  }
  state.log.push({ ...step, movedIds: [...moving] });
  state.lastLine = line;
  return state;
};

// Crease pattern: every shared edge between two pieces, assigned from the
// flat folded state.
export const creasePattern = (state) => {
  const out = [];
  const ps = state.pieces;
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++) {
      const s = adjacent(ps[i], ps[j]);
      if (!s) continue;
      const a = ps[i], b = ps[j];
      const sameFace = Math.sign(det(a.A)) === Math.sign(det(b.A));
      let assignment = "F";
      if (!sameFace) {
        // valley from a's front side if b lies on a's front side
        const aFrontUp = det(a.A) > 0;
        const bAbove = b.z > a.z;
        assignment = aFrontUp === bAbove ? "V" : "M";
      }
      out.push({ seg: s, assignment });
    }
  return out;
};

export const snapshot = (state, eps = 0.0015) => {
  const L = layers(state);
  return {
    pieces: state.pieces.map((p) => {
      const flatZ = L.get(p.id) * eps;
      const world = p.paper.map((pt) => m4apply(p.S, [...apply(p.A, pt), flatZ]));
      return { id: p.id, paper: p.paper, world, front: det(p.A) > 0, layer: L.get(p.id), z: p.z, tags: [...p.tags] };
    }),
    creases: creasePattern(state),
  };
};

export const run = (steps, upTo = steps.length) => {
  const st = square();
  for (const s of steps.slice(0, upTo)) fold(st, s);
  return st;
};
