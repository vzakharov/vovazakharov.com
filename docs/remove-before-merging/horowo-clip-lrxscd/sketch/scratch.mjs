// Lettering gouged with a fingernail and filled with blood, and tally marks struck through in fives.
import { rng } from './lib.mjs';

const GLYPHS = {
  К: [[[0, 0], [0, 1]], [[0.8, 0], [0, 0.55]], [[0.25, 0.4], [0.85, 1]]],
  А: [[[0, 1], [0.45, 0], [0.9, 1]], [[0.2, 0.62], [0.72, 0.62]]],
  С: [[[0.85, 0.12], [0.5, 0], [0.1, 0.25], [0.05, 0.7], [0.45, 1], [0.85, 0.88]]],
  У: [[[0.05, 0], [0.48, 0.6]], [[0.9, 0], [0.3, 1], [0.05, 0.95]]],
  Х: [[[0, 0], [0.85, 1]], [[0.85, 0], [0, 1]]],
  О: [[[0.45, 0], [0.05, 0.3], [0.08, 0.75], [0.45, 1], [0.82, 0.72], [0.8, 0.28], [0.5, 0.02]]],
  Р: [[[0.05, 1], [0.05, 0]], [[0.05, 0.02], [0.7, 0.1], [0.75, 0.4], [0.05, 0.55]]],
  Ш: [[[0.05, 0], [0.05, 1], [0.95, 1], [0.95, 0]], [[0.5, 0], [0.5, 1]]],
  ',': [[[0.2, 0.9], [0.05, 1.3]]],
};

/** A shaky polyline through `pts`: each segment cut into short pieces, each joint nudged. */
const shaky = (pts, r, amp) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 9));
    for (let k = i ? 1 : 0; k <= n; k++) out.push([ax + ((bx - ax) * k) / n + (r() - 0.5) * amp, ay + ((by - ay) * k) / n + (r() - 0.5) * amp]);
  }
  return out.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
};
const line = (pts, color, w, op = 1) => `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;

export const scratched = (text, x, y, h, seed, rot = 0) => {
  const r = rng(seed);
  let out = '';
  let cx = 0;
  for (const ch of text) {
    const strokes = GLYPHS[ch];
    if (!strokes) {
      cx += h * 0.5;
      continue;
    }
    const w = h * (ch === ',' ? 0.3 : 0.62 + r() * 0.1);
    const dy = (r() - 0.5) * h * 0.12;
    for (const s of strokes) {
      const abs = s.map(([px, py]) => [cx + px * w, dy + py * h]);
      // The smear of the fingertip, the wet line, then the pale gouge in the paint under both.
      out += line(shaky(abs, r, h * 0.06), '#4d0a10', h * 0.13, 0.55) + line(shaky(abs, r, h * 0.05), '#b0141c', h * 0.07, 0.95) + line(shaky(abs, r, h * 0.03), '#e7d8c6', 1.6, 0.8);
      const [lx, ly] = abs.reduce((a, b) => (b[1] > a[1] ? b : a));
      if (r() < 0.6) {
        const len = h * (0.25 + r() * 0.9);
        out += `<path d="M ${lx.toFixed(1)},${ly.toFixed(1)} q ${((r() - 0.5) * 6).toFixed(1)},${(len / 2).toFixed(1)} 0,${len.toFixed(1)}" fill="none" stroke="#8a0f16" stroke-width="${(h * 0.035).toFixed(1)}" stroke-linecap="round"/><circle cx="${lx.toFixed(1)}" cy="${(ly + len).toFixed(1)}" r="${(h * 0.035).toFixed(1)}" fill="#8a0f16"/>`;
      }
    }
    cx += w + h * 0.16;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${out}</g>`;
};

/** Rows of fives across a whole wall, run past every edge of `box`; `skip` boxes stay clear. */
export const tallies = ({ box: [x0, y0, x1, y1], h = 40, seed = 1, color = '#cfe0d2', skip = [], op = 0.85 }) => {
  const r = rng(seed);
  let out = '';
  for (let y = y0; y < y1; y += h * 1.5) {
    let x = x0 + r() * 30;
    const tilt = (r() - 0.5) * 6;
    while (x < x1) {
      const gx = x;
      const gy = y + ((x - x0) / 100) * tilt + (r() - 0.5) * 6;
      const step = h * 0.3;
      const blocked = skip.some(([a, b, c, d]) => gx + step * 4 > a && gx < c && gy + h > b && gy < d);
      if (!blocked) {
        const c = r() < 0.12 ? '#8a2a22' : color;
        for (let i = 0; i < 4; i++) out += line(shaky([[gx + i * step + (r() - 0.5) * 4, gy], [gx + i * step + (r() - 0.5) * 5, gy + h * (0.85 + r() * 0.25)]], r, 2.2), c, 2.6, op);
        out += line(shaky([[gx - step * 0.7, gy + h * (0.7 + r() * 0.2)], [gx + step * 3.8, gy + h * (0.1 + r() * 0.2)]], r, 2.2), c, 2.8, op);
      }
      x += step * 4 + h * (0.55 + r() * 0.3);
    }
  }
  return out;
};
