// Procedural alternative covers: node gen.mjs <outdir>
import fs from 'node:fs';
import { contours } from 'd3-contour';
import { Delaunay } from 'd3-delaunay';
import { randomLcg, randomNormal } from 'd3-random';
import { line, curveBasis } from 'd3-shape';

const N = 150, S = 600, K = S / N;
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const seedOf = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) / 2 ** 32;

// Field terms, in cover units (0..600).
const T = {
  gauss: (x0, y0, a, s) => (x, y) => a * Math.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * s * s)),
  box: (x0, y0, a, s) => (x, y) => a * Math.exp(-Math.max(Math.abs(x - x0), Math.abs(y - y0)) / s),
  rhomb: (x0, y0, a, s) => (x, y) => a * Math.exp(-(Math.abs(x - x0) + Math.abs(y - y0)) / s),
  ring: (x0, y0, a, r, w) => (x, y) => a * Math.exp(-((Math.hypot(x - x0, y - y0) - r) ** 2) / (2 * w * w)),
  ramp: (a, y0) => (x, y) => a * (y - y0) / S,
  stripes: (a, k, phase) => (x, y) => a * Math.sin(x * k + phase) * (y / S),
  waves: (a, k) => (x, y) => a * Math.sin(y * k + Math.sin(x * 0.012) * 2),
};

function noise(rnd) {
  const waves = Array.from({ length: 6 }, () => [rnd() * 0.02 + 0.004, rnd() * 0.02 + 0.004, rnd() * 6.28, rnd() * 0.5 + 0.2]);
  return (x, y) => waves.reduce((v, [a, b, p, m]) => v + m * Math.sin(a * x + b * y + p), 0) * 0.12;
}

const ringPath = (ring) => 'M' + ring.map(([x, y]) => `${(x * K).toFixed(1)} ${(y * K).toFixed(1)}`).join('L') + 'Z';

function cover(slug, c) {
  const rnd = randomLcg(seedOf(slug));
  const n = noise(rnd);
  const f = (x, y) => c.field.reduce((v, t) => v + t(x, y), 0) + n(x, y) * (c.noise ?? 1);
  const values = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) values[j * N + i] = f((i + 0.5) * K, (j + 0.5) * K);
  let lo = Infinity, hi = -Infinity;
  for (const v of values) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const levels = c.levels ?? 22;
  const th = Array.from({ length: levels }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / levels);
  const bands = contours().size([N, N]).smooth(true).thresholds(th)(values);
  const [ink0, ink1] = c.ink;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a0, a1] = [rgb(ink0), rgb(ink1)];
  const mix = (t) => `rgb(${a0.map((v, i) => Math.round(v + (a1[i] - v) * t)).join(',')})`;

  const parts = [];
  parts.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg[0]}"/><stop offset="1" stop-color="${c.bg[1]}"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="blur"><feGaussianBlur stdDeviation="${c.blur ?? 18}"/></filter></defs>`);
  parts.push(`<rect width="${S}" height="${S}" fill="url(#g)"/>`);
  bands.forEach((b, i) => {
    const t = i / (bands.length - 1);
    const d = b.coordinates.flatMap((poly) => poly.map(ringPath)).join('');
    if (!d) return;
    if (c.fill) parts.push(`<path d="${d}" fill="${mix(t)}" fill-opacity="${c.fill}"/>`);
    parts.push(`<path d="${d}" fill="none" stroke="${mix(t)}" stroke-width="${c.stroke ?? 1.4}" stroke-opacity="${c.lineOpacity ?? 0.85}"/>`);
  });
  for (const o of c.over ?? []) parts.push(o(rnd));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">\n${parts.join('\n')}\n</svg>\n`;
}

// Overlays.
const glow = (x, y, r, color, core = 0) => () =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.55" filter="url(#blur)"/>` +
  (core ? `<circle cx="${x}" cy="${y}" r="${core}" fill="${color}"/>` : '');
const dots = (pts, r, color, halo = 3) => () =>
  pts.map(([x, y, s = 1]) => `<circle cx="${x}" cy="${y}" r="${r * s * halo}" fill="${color}" opacity="0.25" filter="url(#blur)"/><circle cx="${x}" cy="${y}" r="${r * s}" fill="${color}"/>`).join('');
const voronoi = (box, count, stroke, fill, accent) => (rnd) => {
  const [x0, y0, x1, y1] = box;
  const pts = Array.from({ length: count }, () => [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)]);
  const v = Delaunay.from(pts).voronoi(box);
  return [...v.cellPolygons()].map((p, i) =>
    `<path d="M${p.map((q) => q.map((z) => z.toFixed(1)).join(' ')).join('L')}Z" fill="${accent && i % 7 === 0 ? accent : fill}" fill-opacity="${accent && i % 7 === 0 ? 0.8 : 0.12 + rnd() * 0.25}" stroke="${stroke}" stroke-width="1.5"/>`).join('');
};
const mesh = (count, stroke, node, accent) => (rnd) => {
  const pts = Array.from({ length: count }, () => [40 + rnd() * 520, 40 + rnd() * 520]);
  const d = Delaunay.from(pts);
  return `<path d="${d.render()}" fill="none" stroke="${stroke}" stroke-opacity="0.45" stroke-width="1"/>` +
    pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 0 ? 7 : 2.5}" fill="${i === 0 ? accent : node}"/>`).join('');
};
const flow = (count, from, angle, len, color, curl = 0.012) => (rnd) => {
  const norm = randomNormal.source(rnd)(0, 1);
  const l = line().curve(curveBasis);
  return Array.from({ length: count }, () => {
    let [x, y] = [from[0] + norm() * from[2], from[1] + norm() * from[3]];
    const pts = [[x, y]];
    for (let s = 0; s < len; s++) {
      const a = angle + Math.sin(x * curl + y * curl * 0.7) * 1.2;
      x += Math.cos(a) * 6; y += Math.sin(a) * 6; pts.push([x, y]);
    }
    return `<path d="${l(pts)}" fill="none" stroke="${color}" stroke-opacity="${(0.15 + rnd() * 0.4).toFixed(2)}" stroke-width="${(0.8 + rnd() * 1.6).toFixed(1)}"/>`;
  }).join('');
};
const along = (fn, count, jitter, rnd0) => (rnd) => Array.from({ length: count }, (_, i) => { const [x, y] = fn(i / (count - 1)); return [x + (rnd() - 0.5) * jitter, y + (rnd() - 0.5) * jitter, 0.6 + rnd() * 0.8]; });

const sag = (y0, y1, dip) => (t) => [t * 600, y0 + (y1 - y0) * t + dip * 4 * t * (1 - t)];
const pts = (fn, count, jitter, seed) => { const r = randomLcg(seedOf(seed)); return Array.from({ length: count }, (_, i) => { const [x, y] = fn(i / (count - 1)); return [x + (r() - 0.5) * jitter, y + (r() - 0.5) * jitter, 0.6 + r() * 0.8]; }); };

const COVERS = {
  'father-sea': { bg: ['#d9d2c0', '#0d1e45'], ink: ['#e8e2d2', '#1f3a8a'], field: [T.ramp(-3, 330), T.gauss(410, 330, 1.2, 70), T.waves(0.25, 0.05)], over: [glow(410, 320, 80, '#e2563f', 34)] },
  'old-shite': { bg: ['#cdb894', '#6e5a3f'], ink: ['#efe2c4', '#3a332b'], field: [T.gauss(300, 300, 1, 200)], noise: 3, levels: 14, over: [voronoi([30, 30, 570, 570], 46, '#3a332b', '#efe2c4', '#c62a1d')] },
  'nursery-rhymes': { bg: ['#f2c6cf', '#5a2c4a'], ink: ['#fff3f6', '#2a1022'], field: [T.gauss(130, 430, 0.8, 50), T.gauss(260, 430, 0.8, 50), T.gauss(390, 430, 0.8, 50), T.gauss(450, 190, -2.2, 80)], over: [glow(450, 190, 40, '#120810', 26)] },
  prototypes: { bg: ['#1d3f8f', '#0a1638'], ink: ['#8fb4ff', '#ffffff'], field: [T.box(300, 300, 1.4, 160)], levels: 16, lineOpacity: 0.45, over: [mesh(70, '#cfe0ff', '#cfe0ff', '#ff3b2a')] },
  'for-none-and-for-all': { bg: ['#1b1d24', '#07080b'], ink: ['#2b2f3d', '#6d7591'], field: [T.ramp(1, 0), T.stripes(0.6, 0.06, 0)], levels: 16, over: [dots(Array.from({ length: 24 }, (_, k) => [110 + (k % 4) * 62, 150 + Math.floor(k / 4) * 70, 1]).filter((_, k) => [1, 6, 8, 13, 19, 22].includes(k)), 6, '#e9b93a', 4), glow(232, 166, 26, '#c62a1d', 8), flow(160, [460, 60, 90, 60], 2.1, 50, '#f2f0ea', 0.004)] },
  'stronger-than-love': { bg: ['#2a0b0b', '#0b0505'], ink: ['#5a1410', '#ff5a3a'], field: [T.gauss(300, 360, 2, 110), T.gauss(300, 150, -1.6, 120)], fill: 0.08, over: [glow(300, 370, 90, '#c62a1d', 0), flow(14, [440, 420, 12, 40], -1.4, 40, '#62c24a', 0.02)] },
  'at-the-diner': { bg: ['#231a3a', '#0b0714'], ink: ['#36e0ff', '#ff3fa4'], field: [T.ring(270, 300, 1, 120, 90), T.gauss(270, 300, 0.8, 40)], noise: 2, levels: 30, stroke: 1.2, over: [glow(270, 300, 50, '#c62a1d', 20), dots([[470, 230], [500, 200], [520, 260], [480, 330], [530, 350]], 5, '#ff3fa4', 3)] },
  'cross-out': { bg: ['#b9b4ac', '#3d3a36'], ink: ['#4a4641', '#e2621f'], field: [T.gauss(300, 320, 1.6, 120), (x, y) => -0.9 * Math.exp(-((x - y + 20) ** 2) / 900) - 0.9 * Math.exp(-((x + y - 620) ** 2) / 900)], levels: 26, over: [glow(300, 320, 90, '#e2621f', 0)] },
  'good-girl': { bg: ['#ede6dc', '#b8ada0'], ink: ['#8f8a84', '#c62a1d'], field: [T.box(335, 290, 2, 70), T.gauss(120, 470, 0.7, 40)], levels: 24, over: [glow(335, 290, 60, '#c62a1d', 0)] },
  'in-the-shadow': { bg: ['#8e9196', '#141518'], ink: ['#c9ccd1', '#141414'], field: [T.gauss(300, 330, -2.4, 150)], levels: 30, over: [flow(40, [80, 300, 30, 200], -1.57, 70, '#141414', 0.002), glow(352, 282, 30, '#ece4d2', 9)] },
  inside: { bg: ['#5f5a54', '#1c1a18'], ink: ['#d6d1c6', '#3a3631'], field: [T.box(300, 250, 2, 140)], levels: 18, stroke: 2, over: [glow(290, 260, 16, '#c62a1d', 7), glow(312, 260, 14, '#000', 7)] },
  'like-that': { bg: ['#f0b62b', '#c2410c'], ink: ['#fff1c9', '#ff4f9a'], field: [T.rhomb(240, 340, 2, 90), T.gauss(370, 220, 1, 120)], levels: 22, stroke: 1.8, over: [glow(240, 340, 40, '#ff4f9a', 10)] },
  schadina: { bg: ['#59c3d6', '#1d6f86'], ink: ['#e6fbff', '#c62a1d'], field: [T.gauss(320, 260, 2, 70), T.gauss(230, 260, 0.6, 30), T.gauss(410, 260, 0.6, 30)], levels: 22, over: [glow(320, 260, 50, '#c62a1d', 22), dots(pts((t) => [80 + t * 440, 500 + Math.sin(t * 9) * 30], 12, 30, 'sweets'), 5, '#f6d02c', 3)] },
  smoke: { bg: ['#0f0f12', '#000'], ink: ['#24262c', '#6b6c74'], field: [T.gauss(250, 260, 1.2, 140)], levels: 10, lineOpacity: 0.4, over: [flow(260, [260, 440, 60, 50], -1.65, 60, '#a2a2a8', 0.006), dots([[128, 460], [160, 460]], 5, '#ff7a1a', 4)] },
  'beyond-the-horizon': { bg: ['#eadcc4', '#0f3d44'], ink: ['#f6efe2', '#1c5a63'], field: [T.ramp(-3, 330), T.gauss(290, 330, 1.4, 90), T.waves(0.2, 0.06)], over: [glow(290, 320, 90, '#c62a1d', 40), dots([[90, 540], [140, 560], [196, 545], [240, 570], [120, 580]], 4, '#c62a1d', 3)] },
  chinaberry: { bg: ['#18264a', '#060a18'], ink: ['#2d3f70', '#ece4d2'], field: [T.gauss(450, 140, 2, 90)], levels: 26, over: [glow(450, 140, 70, '#ece4d2', 50), dots(pts(sag(150, 330, 80), 16, 30, 'berry'), 6, '#f2c230', 3)] },
  'minem-babay': { bg: ['#f0e2c0', '#2c5e2b'], ink: ['#f0a524', '#1f4a1e'], field: [T.ramp(-2.5, 0), T.waves(0.35, 0.03), T.gauss(330, 340, 0.9, 90)], levels: 24, stroke: 1.8, over: [glow(330, 340, 100, '#f0a524', 60)] },
  'night-garden': { bg: ['#121a2b', '#050a08'], ink: ['#1f3d2f', '#8fd1a8'], field: [T.stripes(1.4, 0.07, 1), T.ramp(1, 0)], levels: 18, over: [glow(460, 120, 60, '#d8dde3', 44)] },
  'little-lights': { bg: ['#15121e', '#05040a'], ink: ['#231d33', '#4a3a66'], field: [T.gauss(300, 300, 0.5, 250)], levels: 8, lineOpacity: 0.5, over: [dots(pts(sag(170, 200, 160), 11, 8, 'l1'), 9, '#f2c230', 4), dots(pts(sag(380, 420, 140), 9, 8, 'l2'), 7, '#ff7a1a', 4)] },
  'sonnet-74': { bg: ['#efe8d8', '#141414'], ink: ['#141414', '#efe8d8'], field: [T.ramp(14, 0), T.waves(0.15, 0.02)], noise: 0.3, levels: 18, stroke: 3, over: [glow(488, 380, 46, '#c62a1d', 30)] },
};

for (const [slug, c] of Object.entries(COVERS)) fs.writeFileSync(`${out}/${slug}.svg`, cover(slug, c));
console.log(Object.keys(COVERS).length, 'covers');
