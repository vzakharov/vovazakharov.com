import { INK, bot, bunny, fall, grain, guitar, panel } from './lib.mjs';

const wob = inner => `<g filter="url(#wob)">${inner}</g>`;

const glyph = (x, y, s, fill) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-9" cy="-30" rx="7" ry="20" fill="${fill}"/><ellipse cx="9" cy="-30" rx="7" ry="20" fill="${fill}"/><circle r="17" fill="${fill}"/><ellipse cy="30" rx="15" ry="20" fill="${fill}"/></g>`;
let paper = '';
for (let r = 0; r < 8; r++) for (let c = 0; c < 14; c++) if (!(r === 2 && c === 7)) paper += glyph(50 + c * 96 + (r % 2) * 48, 60 + r * 84, 0.62, '#4950a8');

const diamond = (x, y, r, fill, sw = 4) => `<path d="M ${x},${y - r} L ${x + r * 0.7},${y} L ${x},${y + r} L ${x - r * 0.7},${y} Z" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const carpet = (x, y, w, h) => {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8f1d2a" stroke="${INK}" stroke-width="6"/><rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" fill="none" stroke="#e8b84a" stroke-width="7"/><rect x="${x + 30}" y="${y + 30}" width="${w - 60}" height="${h - 60}" fill="#b3202e" stroke="#1d2a6b" stroke-width="6"/>`;
  out += diamond(x + w / 2, y + h / 2, h * 0.36, '#1d2a6b') + diamond(x + w / 2, y + h / 2, h * 0.25, '#e8b84a') + diamond(x + w / 2, y + h / 2, h * 0.13, '#b3202e');
  for (const dx of [0.2, 0.8]) out += diamond(x + w * dx, y + h / 2, h * 0.16, '#e8b84a', 3) + diamond(x + w * dx, y + h / 2, h * 0.08, '#1d2a6b', 3);
  return out;
};

const night = `<rect width="1280" height="720" fill="#2a2e6c"/>${paper}
  <g transform="translate(722 228) scale(1.25)"><ellipse cx="-9" cy="-30" rx="9" ry="22" fill="#0b0d2a"/><ellipse cx="9" cy="-30" rx="9" ry="22" fill="#0b0d2a"/><circle r="19" fill="#0b0d2a"/><ellipse cy="30" rx="17" ry="22" fill="#0b0d2a"/></g>
  <rect y="600" width="1280" height="120" fill="#15173a"/><path d="M 0,600 H 1280" stroke="${INK}" stroke-width="5"/>
  ${wob(`${carpet(90, 70, 520, 270)}
  <rect x="1010" y="70" width="220" height="300" fill="#0b0f33" stroke="${INK}" stroke-width="8"/><circle cx="1170" cy="130" r="30" fill="#fff6c8"/><path d="M 1020,370 V 250 H 1080 V 370 M 1100,370 V 210 H 1160 V 370" fill="#1c2152" stroke="${INK}" stroke-width="3"/>
  <rect x="1034" y="270" width="12" height="12" fill="#ffd23e"/><rect x="1120" y="240" width="12" height="12" fill="#ffd23e"/><rect x="1136" y="300" width="12" height="12" fill="#ff5fa2"/>
  <path d="M 1120,70 V 370 M 1010,200 H 1230" stroke="${INK}" stroke-width="6"/>
  ${bunny({ x: 880, y: 250, s: 0.78, fill: '#dfe9ff', glow: true, op: 0.93 })}
  <rect x="60" y="400" width="34" height="220" fill="#6b4a2a" stroke="${INK}" stroke-width="6"/>
  <path d="M 100,470 C 100,440 220,440 230,470 L 230,520 L 100,520 Z" fill="#f4f1e4" stroke="${INK}" stroke-width="6"/>
  ${bot({ x: 330, y: 400, s: 0.86, outfit: 'pajama', legs: false, sweat: true, lid: 0, brow: -12, look: [1, 0.1], open: 0.25, torso: 210, armL: [[-10, 90], [30, 150]], armR: [[10, 90], [-20, 150]] })}
  <path d="M 90,540 C 300,500 560,520 760,548 L 760,640 L 90,640 Z" fill="#c2247a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  ${[160, 260, 360, 460, 560, 660].map(x => `<path d="M ${x},528 l 16,110" stroke="#ffd23e" stroke-width="12"/>`).join('')}
  <rect x="80" y="630" width="700" height="26" fill="#6b4a2a" stroke="${INK}" stroke-width="6"/>
  <rect x="1010" y="520" width="150" height="110" fill="#4a3320" stroke="${INK}" stroke-width="6"/><rect x="1030" y="470" width="110" height="52" rx="8" fill="#15121a" stroke="${INK}" stroke-width="5"/>`)}
  <text x="1085" y="508" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="36" fill="#ff2a1a">3:07</text>
  <path d="M 1010,70 L 1230,70 L 900,720 L 420,720 Z" fill="#bcd0ff" opacity="0.12"/>
  ${fall({ n: 34, seed: 21, colors: ['#ff5fa2', '#ff8fc0'], pills: 0.4 })}
  <rect width="1280" height="720" fill="#05061c" opacity="0.3"/>${grain(0.6)}`;

let field = '';
for (let r = 0; r < 7; r++) for (let c = 0; c < 13; c++) field += diamond(60 + c * 100 + (r % 2) * 50, 90 + r * 96, 30, (r + c) % 3 === 0 ? '#e8b84a' : (r + c) % 3 === 1 ? '#1d2a6b' : '#f4f1e4', 3);
let fringe = '';
for (let i = 0; i < 64; i++) fringe += `<path d="M ${10 + i * 20},0 v 26 M ${10 + i * 20},694 v 26" stroke="#f4f1e4" stroke-width="6"/>`;
const toy = { outfit: 'toy' };
const inCarpet = `<rect width="1280" height="720" fill="#b3202e"/>${field}
  <rect x="24" y="24" width="1232" height="672" fill="none" stroke="#1d2a6b" stroke-width="22"/><rect x="46" y="46" width="1188" height="628" fill="none" stroke="#e8b84a" stroke-width="10"/>${fringe}
  ${wob(`${diamond(640, 380, 330, '#1d2a6b', 8)}${diamond(640, 380, 270, '#e8b84a', 6)}${diamond(640, 380, 214, '#ff5fa2', 6)}
  ${bot({ ...toy, x: 190, y: 300, s: 0.6, hair: 'mohawk', torso: 220, armL: [[-40, 70], [10, 120]], armR: [[40, 60], [-30, 110]], over: guitar({ x: -40, y: 130, rot: -24, s: 0.8, color: '#39ff88' }) })}
  ${bot({ ...toy, x: 1090, y: 310, s: 0.62, w: 1.5, torso: 180, headS: 0.8, eyes: 'two', hair: 'bald', armL: [[-30, 80], [20, 130]], armR: [[30, 70], [-40, 120]], over: guitar({ x: -60, y: 130, rot: -14, s: 0.8, color: '#2bd4c4', bass: true }) })}
  ${bot({ ...toy, x: 930, y: 470, s: 0.46, headS: 1.35, hair: 'tuft', torso: 150, led: '#39ff88', armL: [[-80, -30], [-120, -100]], armR: [[80, -20], [130, -110]], legL: [[-10, 60], [-14, 120]], legR: [[10, 60], [14, 120]] })}
  ${bunny({ x: 760, y: 300, s: 0.62, arms: 'up', rot: 9, fill: '#f4f1e4' })}
  ${bot({ x: 520, y: 330, s: 0.8, outfit: 'pajama', rot: -8, open: 1, lid: 0, brow: -8, look: [0.6, -0.6], armL: [[-70, -40], [-110, -140]], armR: [[70, -30], [150, -90]], legL: [[-30, 90], [-70, 190]], legR: [[30, 100], [20, 210]] })}`)}
  ${fall({ n: 60, seed: 33, colors: ['#ff5fa2', '#7df0ff', '#39ff88', '#fff'], pills: 0.5, maxS: 2 })}${grain(0.35)}`;

const crayon = `<g filter="url(#wob2)" fill="none" stroke-linecap="round" stroke-width="7">
  <rect x="640" y="150" width="230" height="130" stroke="#d83a2a"/><path d="M 755,160 L 820,215 L 755,270 L 690,215 Z" stroke="#e8b84a"/><path d="M 660,170 l 20,20 m 150,-20 l 20,20 m -190,70 l 20,20 m 150,-20 l 20,20" stroke="#3b6fd8"/>
  <circle cx="960" cy="190" r="26" stroke="#3b6fd8"/><path d="M 960,216 v 60 m -30,-40 h 60 m -30,40 l -22,36 m 22,-36 l 22,36" stroke="#3b6fd8"/>
  <ellipse cx="560" cy="170" rx="22" ry="30" stroke="#8a8a8a"/><path d="M 560,200 v 90" stroke="#8a8a8a"/></g>`;
const morning = `<rect width="1280" height="720" fill="#ece8d4"/><rect y="330" width="1280" height="390" fill="#9cbcaa"/><path d="M 0,330 H 1280" stroke="${INK}" stroke-width="5"/>
  <rect y="620" width="1280" height="100" fill="#c9b48a"/><path d="M 0,620 H 1280" stroke="${INK}" stroke-width="5"/>
  <path d="M 1060,60 L 1240,60 L 760,720 L 300,720 Z" fill="#fff6b0" opacity="0.5"/>
  ${[0, 1, 2, 3, 4].map(i => `<path d="M ${1080 + i * 36},60 L ${350 + i * 90},720" stroke="#6f8f80" stroke-width="12" opacity="0.5"/>`).join('')}
  ${crayon}
  <g transform="translate(650 470)"><g filter="url(#soft)"><ellipse cx="-22" cy="-110" rx="20" ry="62" fill="#fffbd0"/><ellipse cx="26" cy="-104" rx="20" ry="62" fill="#fffbd0"/><circle r="62" fill="#fffbd0"/></g>
  <ellipse cx="-22" cy="-110" rx="15" ry="56" fill="#fffde8"/><ellipse cx="26" cy="-104" rx="15" ry="56" fill="#fffde8"/><circle r="54" fill="#fffde8"/></g>
  <g filter="url(#wob2)" font-family="JetBrains Mono, monospace" font-weight="500" fill="none" stroke="#3f5a4c" stroke-width="2.6"><text x="60" y="420" font-size="50" transform="rotate(-4 60 420)">КАК,</text><text x="50" y="484" font-size="54" transform="rotate(2 50 484)">СУКА,</text><text x="40" y="556" font-size="60" transform="rotate(-2 40 556)">ХОРОШ</text></g>
  ${wob(`<rect x="1040" y="60" width="210" height="270" fill="#dff4ff" stroke="${INK}" stroke-width="8"/>${[0, 1, 2, 3, 4].map(i => `<path d="M ${1066 + i * 40},60 V 330" stroke="${INK}" stroke-width="8"/>`).join('')}
  <path d="M 820,520 H 1250 V 560 H 820 Z" fill="#f4f1e4" stroke="${INK}" stroke-width="6"/><path d="M 830,440 V 680 M 1240,400 V 680" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  ${bot({ x: 300, y: 440, s: 0.8, outfit: 'pajama', flip: true, headRot: 14, open: 0.35, lid: 0.1, brow: 2, look: [-1, 0.2], armL: [[-50, 20], [-110, 30]], armR: [[60, 30], [124, 76]], legL: [[-50, 50], [-10, 130]], legR: [[40, 40], [70, 130]], torso: 170 })}`)}
  <g transform="translate(700 660) rotate(20)"><rect x="-13" y="-6" width="26" height="12" rx="6" fill="#ff5fa2" stroke="${INK}" stroke-width="2.5"/></g>${grain(0.3)}`;

export default {
  name: 'v2',
  title: 'Вариант 2 — «Зайчик с обоев»: одна комната, три часа ночи',
  note: 'История вместо эфира. Панельная квартира, ковёр на стене, обои в зайчиках — и одного на обоях не хватает. Куплет — погоня по квартире; в припеве оказывается, что зайчик хотел танцевать, и все проваливаются в ковёр, где на орнаменте играет группа — игрушечные роботы с серванта. К утру ковёр оказывается нарисован мелками на стене палаты, а призрачный зайчик — солнечным.',
  panels: [
    { svg: panel(night), tc: '0:00–0:18 · вступление', cap: '«Когда просыпаешься ночью в поту прохладном и сочном». На обоях дырка в форме зайца. Сам заяц уже у окна и никуда не торопится.' },
    { svg: panel(inCarpet), tc: '0:42–1:02 · припев', cap: 'Внутри ковра. Тот самый узор, в который все смотрели в детстве, — сцена; группа в цветах заводных игрушек; погоня кончилась танцем.' },
    { svg: panel(morning), tc: '1:36–1:58 · финал', cap: 'Утро. Решётка, мелки, третье слово почти дописано ногтём. На стене сидит зайчик — теперь солнечный, как в оригинале у Александровой.' },
  ],
};
