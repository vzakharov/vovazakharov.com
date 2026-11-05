// Working title: basilisk — a crowned serpent from one square, simple and
// reverse folds only. Axis = the diagonal (0,0)-(1,1); tail at (0,0).
// After the fold in half the strip lies at h >= 0, the spine (belly) at h = 0.
const D = Math.PI / 180;
const r = Math.SQRT1_2;
const ray = (deg) => ({ p: [0, 0], q: [Math.cos(deg * D), Math.sin(deg * D)] });
// axis coords -> world
export const A = (t, h) => [(t + h) * r, (t - h) * r];
// a line through axis point (t, h) at angle deg from +t toward +h
const L = (t, h, deg) => ({ p: A(t, h), q: A(t + Math.cos(deg * D), h + Math.sin(deg * D)) });

export const colors = { front: 0xd9a441, back: 0x1f5e4c };
// show in axis coords: t right, h up (a proper rotation, viewed from the L side)
export const display = ([x, y, z]) => [(x + y) * r, (x - y) * r, -z];

const NECK = Number(process.env.NECK ?? 0.9);
const HEAD = Number(process.env.HEAD ?? 1.2);
const TAIL1 = Number(process.env.TAIL1 ?? 0.55);
const TAIL2 = Number(process.env.TAIL2 ?? 0.3);

export const steps = [
  // kite
  { line: ray(22.5), moving: [0.9, 0.05], dir: "valley" },
  { line: ray(67.5), moving: [0.05, 0.9], dir: "valley" },
  // narrow the kite again
  { line: ray(33.75), moving: [0.9, 0.3], dir: "valley" },
  { line: ray(56.25), moving: [0.3, 0.9], dir: "valley" },
  ...(process.env.THIRD === "0"
    ? []
    : [
        { line: ray(39.375), moving: [0.9, 0.5], dir: "valley" },
        { line: ray(50.625), moving: [0.5, 0.9], dir: "valley" },
      ]),
  // fold in half, flaps outside; the upper-left half goes under
  { line: ray(45), moving: [0.2, 0.8], dir: "mountain", tag: "L" },
  // neck up: inside reverse fold
  { line: L(NECK, 0, 43), moving: A(1.2, 0.05), select: "flap", dir: "inside", lower: "L" },
  // head tips forward
  (s) => spineFold(s, HEAD, 1.3, Number(process.env.HEADDEG ?? 52), process.env.HEADDIR ?? "outside"),
  // tail: two reverse folds make an S
  { line: L(TAIL1, 0, 145), moving: A(0.05, 0.002), select: "flap", dir: "inside", lower: "L" },
  (s) => spineFold(s, TAIL2, 0.02, 40, "inside"),
];

// A reverse fold through the spine at paper-axis distance t, the line at
// `deg` from the local spine direction toward the open side; the part
// containing paper-axis point `tMove` moves.
import { where } from "../engine.mjs";
const P = (t) => [t * r, t * r];
function spineFold(s, t, tMove, deg, dir) {
  const o = where(s, P(t));
  const ahead = where(s, P(t + 0.01));
  const u = [(ahead[0] - o[0]) / 0.01, (ahead[1] - o[1]) / 0.01];
  const n = Math.hypot(...u);
  const d = [u[0] / n, u[1] / n];
  // open side: where a point just off the spine on the strip lands
  const off = where(s, [t * r + 0.003, t * r - 0.003]);
  const side = Math.sign(d[0] * (off[1] - o[1]) - d[1] * (off[0] - o[0])) || 1;
  const a = deg * D * side;
  const q = [o[0] + Math.cos(a) * d[0] - Math.sin(a) * d[1], o[1] + Math.sin(a) * d[0] + Math.cos(a) * d[1]];
  const m = where(s, P(tMove));
  return { line: { p: o, q }, moving: m, select: { at: m, all: true }, dir, lower: "L" };
}
