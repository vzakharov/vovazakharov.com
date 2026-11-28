// Storyboard sketch helpers: everything is an SVG string in a 1280x720 panel.
export const INK = '#141216';
export const SKIN = '#e2d4ac';
export const METAL = '#8f939b';
export const METAL_D = '#4a4d55';
export const METAL_L = '#cfd3da';
export const BONE = '#ece6cf';

let uid = 0;
export const id = p => `${p}${++uid}`;
export const rng = seed => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};
const f = n => Math.round(n * 10) / 10;
export const g = (inner, { x = 0, y = 0, s = 1, sx, rot = 0, attrs = '' } = {}) =>
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${sx ?? s} ${s})" ${attrs}>${inner}</g>`;

export const defs = `
<filter id="wob" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="7"/>
</filter>
<filter id="wob2" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
</filter>
<filter id="glow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5"/>
  <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.32"/>
</filter>
<filter id="vhs" x="-5%" y="-5%" width="110%" height="110%">
  <feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="-6" result="r2"/>
  <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
  <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="6" result="b2"/>
  <feBlend in="r2" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b2" mode="screen" result="c"/>
  <feGaussianBlur in="c" stdDeviation="1.3 0"/>
</filter>
<pattern id="half" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
  <circle cx="4.5" cy="4.5" r="2.1" fill="#000"/>
</pattern>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
  <rect width="4" height="2" fill="#000" opacity="0.22"/>
</pattern>
<radialGradient id="vig" cx="50%" cy="50%" r="72%">
  <stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
</radialGradient>`;

export const grain = (o = 0.5) =>
  `<rect width="1280" height="720" filter="url(#grain)" opacity="${o}"/><rect width="1280" height="720" fill="url(#vig)"/>`;

/** Outlined limb: a fat ink polyline under a thinner coloured one. */
export const limb = (pts, color, w = 26) => {
  const p = pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
  const base = `fill="none" stroke-linecap="round" stroke-linejoin="round" points="${p}"`;
  return `<polyline ${base} stroke="${INK}" stroke-width="${w + 9}"/><polyline ${base} stroke="${color}" stroke-width="${w}"/>`;
};

const teeth = (y, h, n, w, sag) => {
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    const x = t * w;
    const dy = sag * (1 - 4 * t * t);
    const tw = (w / n) * (0.9 - Math.abs(t) * 0.35);
    out += `<rect x="${f(x - tw / 2)}" y="${f(y + dy)}" width="${f(tw)}" height="${f(h * (1 - Math.abs(t) * 0.5))}" rx="3" fill="${BONE}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  return out;
};

/**
 * The robo-avatar's head, face-on, about 190 wide and 300 tall, origin between the eyes.
 * `open` drops the mask's hinged jaw (0..1); `eyes: 'two'` covers both eyes with LEDs.
 */
export const head = ({
  open = 0,
  led = '#ff2a1a',
  eyes = 'one',
  hair = 'cap',
  look = [0, 0],
  brow = 12,
  skin = SKIN,
  metal = METAL,
  sweat = false,
  lid = 0.25,
} = {}) => {
  const jaw = open * 46;
  const ears = [-1, 1]
    .map(s => `<path d="M ${s * 84},-34 C ${s * 112},-52 ${s * 118},6 ${s * 86},16 Z" fill="${skin}" stroke="${INK}" stroke-width="5"/>`)
    .join('');
  const skull = `<path d="M -86,-36 C -92,-128 -52,-172 0,-172 C 56,-172 94,-126 87,-36 C 85,12 72,66 42,104 C 26,124 -26,124 -42,104 C -72,66 -84,12 -86,-36 Z" fill="${skin}" stroke="${INK}" stroke-width="6"/>`;
  const hairs = {
    cap: `<path d="M -80,-88 C -74,-150 -40,-176 2,-176 C 46,-176 78,-146 82,-86 C 64,-126 36,-140 4,-132 C -28,-144 -62,-122 -80,-88 Z" fill="#2a2420" stroke="${INK}" stroke-width="5"/>`,
    mohawk: `<path d="M -22,-120 L -34,-214 L -10,-176 L 0,-236 L 12,-178 L 34,-216 L 22,-120 Z" fill="#c8ff2e" stroke="${INK}" stroke-width="5"/>`,
    bald: '',
    tuft: `<path d="M -40,-150 C -30,-200 20,-206 46,-160 C 20,-176 -10,-172 -40,-150 Z" fill="#2a2420" stroke="${INK}" stroke-width="5"/>`,
  }[hair];
  // The human eye (viewer's right) and its brow.
  const eyeR =
    eyes === 'two'
      ? ''
      : `<ellipse cx="44" cy="-34" rx="25" ry="19" fill="#f4f1e4" stroke="${INK}" stroke-width="4.5"/>
  <circle cx="${44 + look[0] * 9}" cy="${-33 + look[1] * 7}" r="10" fill="#6b4a2a" stroke="${INK}" stroke-width="3"/>
  <circle cx="${44 + look[0] * 9}" cy="${-33 + look[1] * 7}" r="4.5" fill="${INK}"/>
  <path d="M 18,-36 C 26,${-58 + lid * 22} 62,${-58 + lid * 22} 70,-36 C 62,-56 26,-56 18,-36 Z" fill="${skin}" stroke="${INK}" stroke-width="4"/>
  <path d="M 24,-12 C 36,-4 54,-4 66,-14" fill="none" stroke="${INK}" stroke-width="3" opacity="0.7"/>
  <path d="M 14,${-62 + brow} L 74,${-70 - brow * 0.4} L 72,-58 L 16,${-52 + brow} Z" fill="#2a2420" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  // The mask: a crest up the forehead, the left socket, the nose, cheekbones.
  const upper =
    eyes === 'two'
      ? `<path d="M -90,-30 L -76,-66 C -64,-96 -52,-124 -44,-166 C -30,-126 -20,-92 0,-80 C 20,-92 30,-126 44,-166 C 52,-124 64,-96 76,-66 L 90,-30 L 86,36 C 60,58 -60,58 -86,36 Z" fill="${metal}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`
      : `<path d="M -90,-30 L -76,-66 C -64,-96 -52,-124 -44,-166 C -32,-124 -22,-92 -8,-64 C 0,-44 4,-24 2,-8 C 30,2 62,-2 90,-18 L 86,36 C 60,58 -60,58 -86,36 Z" fill="${metal}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  const socket = cx => `<ellipse cx="${cx}" cy="-30" rx="27" ry="23" fill="#0c0b10" stroke="${INK}" stroke-width="4"/>
  <circle cx="${cx + look[0] * 5}" cy="${-30 + look[1] * 4}" r="26" fill="${led}" filter="url(#glow)" opacity="0.9"/>
  <circle cx="${cx + look[0] * 5}" cy="${-30 + look[1] * 4}" r="11" fill="${led}" stroke="#fff3" stroke-width="2"/>
  <circle cx="${cx + look[0] * 5 - 3}" cy="${-34 + look[1] * 4}" r="3.5" fill="#fff" opacity="0.85"/>`;
  const shade = `<path d="M -44,-160 C -40,-120 -30,-90 -14,-62 L -30,-66 C -44,-92 -48,-128 -44,-160 Z" fill="${METAL_L}" opacity="0.8"/>
  <path d="M -84,-20 C -76,10 -70,26 -58,40 L -84,34 Z" fill="${METAL_D}" opacity="0.7"/>
  <path d="M 84,-10 C 76,14 70,26 58,40 L 84,34 Z" fill="${METAL_D}" opacity="0.7"/>
  <path d="M -66,2 C -50,14 -30,16 -16,8" fill="none" stroke="${INK}" stroke-width="3.5"/>
  <path d="M 66,6 C 50,18 30,18 16,10" fill="none" stroke="${INK}" stroke-width="3.5"/>`;
  const nose = `<path d="M 0,-2 C -15,14 -20,36 -7,39 L 0,30 L 7,39 C 20,36 15,14 0,-2 Z" fill="#0c0b10" stroke="${INK}" stroke-width="3"/>`;
  const upperTeeth = teeth(42, 26, 8, 104, 6);
  const rivets = [-1, 1]
    .map(s => `<circle cx="${s * 86}" cy="-4" r="8" fill="${METAL_L}" stroke="${INK}" stroke-width="4"/><path d="M ${s * 82},-4 h ${s * 8}" stroke="${INK}" stroke-width="2.5"/>`)
    .join('');
  // The jaw is its own plate, hinged at the rivets: it drops and the dark of the mouth shows.
  const gap = `<path d="M -62,44 Q 0,62 62,44 L ${60},${70 + jaw} Q 0,${92 + jaw} -60,${70 + jaw} Z" fill="#0c0b10"/>`;
  const jawPlate = g(
    `<path d="M -84,34 C -60,54 60,54 84,34 C 78,74 64,100 44,118 C 26,134 -26,134 -44,118 C -64,100 -78,74 -84,34 Z" fill="${metal}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M -70,62 C -60,92 -46,108 -34,116 L -52,112 C -64,98 -72,82 -70,62 Z" fill="${METAL_D}" opacity="0.7"/>
    <path d="M 30,112 C 44,102 56,86 62,70" fill="none" stroke="${METAL_L}" stroke-width="5" opacity="0.8"/>
    ${teeth(56, 24, 8, 96, 8)}
    <path d="M -10,124 L -22,150 L -8,142 L -2,166 L 6,142 L 20,152 L 10,124 Z" fill="#2a2420" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    { y: jaw },
  );
  const drops = sweat
    ? [
        [-60, -120],
        [70, -96],
        [96, -40],
        [-98, 30],
      ]
        .map(([x, y]) => `<path d="M ${x},${y} c -8,14 -8,22 0,24 c 8,-2 8,-10 0,-24 Z" fill="#9fe8ff" stroke="${INK}" stroke-width="3"/>`)
        .join('')
    : '';
  return `${ears}${skull}${hairs}${eyeR}${gap}${jawPlate}${upper}${shade}${socket(-44)}${eyes === 'two' ? socket(44) : ''}${nose}${upperTeeth}${rivets}${drops}`;
};

const OUTFITS = {
  jacket: { body: '#5d626b', stripe: '#a7abb3', arm: '#5d626b', leg: '#26262c' },
  strait: { body: '#e9e4d2', stripe: '#b9b29a', arm: '#e9e4d2', leg: '#9fb7b0' },
  suit: { body: '#c2247a', stripe: '#ffd23e', arm: '#c2247a', leg: '#1f6f8f' },
  pajama: { body: '#8fc7d8', stripe: '#f4f1e4', arm: '#8fc7d8', leg: '#8fc7d8' },
  toy: { body: '#d83a2a', stripe: '#ffd23e', arm: '#3b6fd8', leg: '#3b6fd8' },
};

/**
 * The whole puppet, origin at the base of the neck. Arms and legs are polylines
 * of [x, y] joints from shoulder / hip; `under` and `over` slot props behind and in front.
 */
export const bot = ({
  x = 0,
  y = 0,
  s = 1,
  flip = false,
  rot = 0,
  outfit = 'jacket',
  headS = 1,
  headRot = 0,
  w = 1,
  torso = 200,
  armL = [
    [-30, 90],
    [-20, 180],
  ],
  armR = [
    [30, 90],
    [20, 180],
  ],
  legL = [
    [-6, 110],
    [-10, 220],
  ],
  legR = [
    [6, 110],
    [10, 220],
  ],
  legs = true,
  over = '',
  under = '',
  buckles = false,
  ...h
} = {}) => {
  const o = OUTFITS[outfit];
  const c = id('t');
  const sw = 62 * w;
  const hw = 44 * w;
  const pathT = `M ${-sw},6 C ${-sw * 0.6},-12 ${sw * 0.6},-12 ${sw},6 L ${hw},${torso} L ${-hw},${torso} Z`;
  let stripes = '';
  for (let i = -8; i < 9; i++) stripes += `<path d="M ${i * 26},-20 l -60,${torso + 60}" stroke="${o.stripe}" stroke-width="7"/>`;
  const hand = ([hx, hy]) => `<circle cx="${hx}" cy="${hy}" r="20" fill="${outfit === 'strait' ? o.arm : SKIN}" stroke="${INK}" stroke-width="5"/>`;
  const abs = (pts, ox, oy) => [[ox, oy], ...pts.map(([px, py]) => [ox + px, oy + py])];
  const aL = abs(armL, -sw + 8, 22);
  const aR = abs(armR, sw - 8, 22);
  const lL = abs(legL, -hw * 0.5, torso - 8);
  const lR = abs(legR, hw * 0.5, torso - 8);
  const boot = ([bx, by], dir) => `<path d="M ${bx - 16},${by - 10} L ${bx + 16},${by - 10} L ${bx + dir * 46},${by + 22} L ${bx - dir * 18},${by + 22} Z" fill="#17161b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  const legsS = legs ? `${limb(lL, o.leg, 24)}${limb(lR, o.leg, 24)}${boot(lL.at(-1), -1)}${boot(lR.at(-1), 1)}` : '';
  const belts = buckles
    ? [0.3, 0.55, 0.8].map(t => `<path d="M ${-sw},${torso * t} L ${sw},${torso * t}" stroke="#7a6a4a" stroke-width="9"/><rect x="-9" y="${torso * t - 9}" width="18" height="18" fill="#d8c27a" stroke="${INK}" stroke-width="3"/>`).join('')
    : '';
  const inner = `${under}${legsS}
  <clipPath id="${c}"><path d="${pathT}"/></clipPath>
  <path d="${pathT}" fill="${o.body}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <g clip-path="url(#${c})">${stripes}${belts}<path d="M ${sw * 0.2},0 L ${sw},6 L ${hw},${torso} L ${hw * 0.5},${torso} Z" fill="#000" opacity="0.18"/></g>
  <path d="${pathT}" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  ${limb(aL, o.arm, 27)}${hand(aL.at(-1))}
  <rect x="-17" y="-52" width="34" height="62" fill="${h.skin ?? SKIN}" stroke="${INK}" stroke-width="5"/>
  <path d="M -50,-6 C -30,-30 30,-30 50,-6 C 44,22 -44,22 -50,-6 Z" fill="#1b1a20" stroke="${INK}" stroke-width="5"/>
  ${g(head(h), { y: -150 * headS, s: headS, rot: headRot })}
  ${over}${limb(aR, o.arm, 27)}${hand(aR.at(-1))}`;
  return g(inner, { x, y, s, sx: flip ? -s : s, rot });
};

/** The ghost bunny off the wallpaper: paper-flat, button-eyed, too long everywhere. */
export const bunny = ({ x = 0, y = 0, s = 1, rot = 0, fill = '#eef3f7', op = 1, grin = 1, eye = 'button', arms = 'down', glow = false } = {}) => {
  const ear = (sx, bend) =>
    `<path d="M ${sx * 22},-150 C ${sx * 6},-250 ${sx * 20},-360 ${sx * 44 + bend},-400 C ${sx * 70 + bend},-360 ${sx * 62},-240 ${sx * 50},-150 Z" fill="${fill}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M ${sx * 34},-170 C ${sx * 26},-250 ${sx * 34},-330 ${sx * 44 + bend * 0.8},-372" fill="none" stroke="#f08aa8" stroke-width="9" stroke-linecap="round"/>`;
  const eyeS = cx =>
    eye === 'button'
      ? `<circle cx="${cx}" cy="-96" r="17" fill="#17161b" stroke="${INK}" stroke-width="4"/><circle cx="${cx - 5}" cy="-101" r="2.6" fill="#eee"/><circle cx="${cx + 5}" cy="-101" r="2.6" fill="#eee"/><circle cx="${cx - 5}" cy="-91" r="2.6" fill="#eee"/><circle cx="${cx + 5}" cy="-91" r="2.6" fill="#eee"/>`
      : `<circle cx="${cx}" cy="-96" r="24" fill="#fff36b" filter="url(#glow)"/><circle cx="${cx}" cy="-96" r="10" fill="#fffbd0"/>`;
  let stitches = '';
  for (let i = -5; i <= 5; i++) {
    const sx = i * 11 * grin;
    const sy = -52 + (1 - (i * i) / 25) * 20 * grin;
    stitches += `<path d="M ${sx},${sy - 8} L ${sx},${sy + 8}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  const armsS =
    arms === 'up'
      ? limb([[-58, 10], [-120, -60], [-150, -170]], fill, 16) + limb([[58, 10], [120, -60], [150, -170]], fill, 16)
      : arms === 'reach'
        ? limb([[-58, 10], [-150, 40], [-250, 10]], fill, 16) + limb([[58, 10], [130, 80], [230, 60]], fill, 16)
        : limb([[-58, 10], [-84, 150], [-70, 290]], fill, 16) + limb([[58, 10], [84, 150], [70, 290]], fill, 16);
  const inner = `${glow ? `<ellipse cx="0" cy="40" rx="150" ry="330" fill="#bfe6ff" filter="url(#soft)" opacity="0.45"/>` : ''}
  ${ear(-1, -30)}${ear(1, 46)}
  ${armsS}
  <path d="M -64,-10 C -80,120 -66,300 -40,420 L 40,420 C 66,300 80,120 64,-10 Z" fill="${fill}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M -20,40 L 14,120 L -18,210 L 12,300" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.35"/>
  <path d="M -84,-90 C -90,-160 -50,-176 0,-176 C 50,-176 90,-160 84,-90 C 80,-30 40,-6 0,-6 C -40,-6 -80,-30 -84,-90 Z" fill="${fill}" stroke="${INK}" stroke-width="6"/>
  ${eyeS(-36)}${eyeS(36)}
  <path d="M -8,-74 L 8,-74 L 0,-64 Z" fill="#f08aa8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M ${-58 * grin},-52 Q 0,${-52 + 40 * grin} ${58 * grin},-52" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  ${stitches}`;
  return g(inner, { x, y, s, rot, attrs: `opacity="${op}"` });
};

/** Serotonin-fall: pills and pink flakes, seeded so a panel redraws the same. */
export const fall = ({ n = 70, seed = 1, colors = ['#ff5fa2', '#ffd23e', '#7df0ff', '#fff'], minS = 0.6, maxS = 1.6, pills = 0.35 } = {}) => {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 1280;
    const y = r() * 720;
    const s = minS + r() * (maxS - minS);
    const c = colors[Math.floor(r() * colors.length)];
    const rot = r() * 360;
    out +=
      r() < pills
        ? `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><rect x="-13" y="-6" width="26" height="12" rx="6" fill="${c}" stroke="${INK}" stroke-width="2.5"/><path d="M 0,-6 v 12" stroke="${INK}" stroke-width="2"/><rect x="-13" y="-6" width="13" height="12" rx="6" fill="#fff" opacity="0.55"/></g>`
        : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4 * s)}" fill="${c}" stroke="${INK}" stroke-width="2"/>`;
  }
  return out;
};

export const guitar = ({ x = 0, y = 0, s = 1, rot = 0, color = '#ff3d2e', bass = false } = {}) =>
  g(
    `<rect x="40" y="-9" width="${bass ? 250 : 200}" height="18" fill="#3a2a1c" stroke="${INK}" stroke-width="4"/>
     <path d="M ${bass ? 290 : 240},-16 l 40,-10 l 6,40 l -46,6 Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <path d="M -70,-20 L -20,-62 L 30,-30 L 60,-44 L 54,40 L 10,34 L -30,70 L -84,44 Z" fill="${color}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M -20,-62 L 30,-30 L 60,-44 L 54,-10 L -50,-20 Z" fill="#fff" opacity="0.25"/>
     <rect x="-14" y="-10" width="16" height="22" fill="#17161b"/><rect x="14" y="-10" width="16" height="22" fill="#17161b"/>
     <path d="M -40,-3 H ${bass ? 290 : 240} M -40,4 H ${bass ? 290 : 240}" stroke="#ddd" stroke-width="1.5"/>`,
    { x, y, s, rot },
  );

export const mic = ({ x = 0, y = 0, h = 300, lean = 0 } = {}) =>
  `<path d="M ${x},${y} L ${x + lean},${y - h}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M ${x},${y} L ${x + lean},${y - h}" stroke="#8f939b" stroke-width="4" stroke-linecap="round"/>
   <path d="M ${x - 46},${y + 6} L ${x},${y - 10} L ${x + 46},${y + 6}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
   <ellipse cx="${x + lean}" cy="${y - h - 14}" rx="16" ry="20" fill="#2c2c33" stroke="${INK}" stroke-width="5"/>`;

/** Bubble display lettering with a hard drop shadow. */
export const title = (t, { x = 640, y = 100, size = 90, fill = '#ffd23e', shadow = '#c2247a', rot = -4, font = 'Inter Display, Inter, sans-serif', weight = 900, anchor = 'middle', stroke = INK, sw = 10 } = {}) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})" font-family="${font}" font-weight="${weight}" font-size="${size}" text-anchor="${anchor}" font-style="italic">
    <text x="7" y="9" fill="${shadow}" stroke="${shadow}" stroke-width="${sw}" stroke-linejoin="round">${t}</text>
    <text fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke">${t}</text></g>`;

export const panel = (inner, bg = '#222') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><defs>${defs}</defs><rect width="1280" height="720" fill="${bg}"/>${inner}</svg>`;
