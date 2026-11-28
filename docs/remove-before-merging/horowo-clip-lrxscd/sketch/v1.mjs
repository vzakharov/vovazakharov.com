import { INK, bot, bunny, fall, g, grain, guitar, id, panel, title } from './lib.mjs';
import { scratched, tallies } from './scratch.mjs';

const wob = inner => `<g filter="url(#wob)">${inner}</g>`;
export const mono = (t, x, y, size = 30, fill = '#fff', anchor = 'start') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="JetBrains Mono, monospace" font-weight="800" font-size="${size}" fill="${fill}" stroke="#000" stroke-width="5" paint-order="stroke">${t}</text>`;

/** A 4:3 picture inside the 16:9 frame, seen through a tape: chroma split, scanlines, on-screen display. */
const crt = (inner, osd = '') => {
  const c = id('crt');
  return `<rect width="1280" height="720" fill="#050506"/><clipPath id="${c}"><rect x="160" width="960" height="720" rx="54"/></clipPath>
  <g clip-path="url(#${c})"><g filter="url(#vhs)"><g transform="translate(160 0)">${inner}</g></g>
  <rect x="160" width="960" height="720" fill="url(#scan)"/><rect x="160" y="612" width="960" height="26" fill="#fff" opacity="0.13"/><rect x="160" y="640" width="960" height="5" fill="#fff" opacity="0.3"/>
  <rect x="160" width="960" height="720" fill="url(#vig)"/>${osd}</g>`;
};
const bug = `<g transform="translate(1010 70)"><circle r="34" fill="#ffd23e" stroke="${INK}" stroke-width="5"/><text y="11" text-anchor="middle" font-family="Inter Display, sans-serif" font-weight="900" font-size="30" fill="${INK}">ГБ</text></g>`;

const sun = `<g transform="translate(150 150)">
  ${Array.from({ length: 12 }, (_, i) => `<path d="M -16,-118 L 0,-170 L 16,-118 Z" transform="rotate(${i * 30})" fill="#ff9a1f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`).join('')}
  <circle r="100" fill="#ffd23e" stroke="${INK}" stroke-width="6"/>
  <circle cx="-34" cy="-22" r="24" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="38" cy="-22" r="24" fill="#fff" stroke="${INK}" stroke-width="4"/>
  <circle cx="-22" cy="-12" r="5" fill="${INK}"/><circle cx="50" cy="-12" r="5" fill="${INK}"/>
  <path d="M -64,26 Q 0,92 64,26 Q 0,50 -64,26 Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  ${[-36, -18, 0, 18, 36].map(x => `<path d="M ${x},34 v 30" stroke="${INK}" stroke-width="3"/>`).join('')}
  <circle cx="-66" cy="14" r="13" fill="#ff5fa2" opacity="0.8"/><circle cx="68" cy="14" r="13" fill="#ff5fa2" opacity="0.8"/></g>`;
const cloud = (x, y, s) => `<path d="M ${x},0 V ${y - 30}" stroke="${INK}" stroke-width="3"/><g transform="translate(${x} ${y}) scale(${s})"><path d="M -80,20 C -110,20 -110,-20 -74,-22 C -70,-60 -14,-66 0,-36 C 26,-62 80,-44 70,-10 C 102,-6 98,22 72,22 Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g>`;
const cube = (x, y, c, ch, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-44" y="-44" width="88" height="88" rx="8" fill="${c}" stroke="${INK}" stroke-width="6"/><text y="24" text-anchor="middle" font-family="Inter Display, sans-serif" font-weight="900" font-size="68" fill="#fff" stroke="${INK}" stroke-width="5" paint-order="stroke">${ch}</text></g>`;

const kids = crt(
  `<rect width="960" height="720" fill="#58c8f5"/>
  ${wob(`${cloud(420, 210, 0.9)}${cloud(790, 150, 1.1)}${sun}
  ${bunny({ x: 810, y: 560, s: 0.55, eye: 'glow', fill: '#f4f1e4' })}
  <path d="M 0,560 Q 200,400 470,530 T 960,440 V 720 H 0 Z" fill="#3fae53" stroke="${INK}" stroke-width="6"/>
  <path d="M 0,640 Q 300,520 600,610 T 960,560 V 720 H 0 Z" fill="#62d06e" stroke="${INK}" stroke-width="6"/>
  ${bot({ x: 440, y: 470, s: 0.98, outfit: 'suit', legs: false, open: 0.45, brow: -8, lid: 0, look: [0, 0], armL: [[-70, 10], [-96, -110]], armR: [[36, 90], [10, 170]], torso: 320 })}
  ${cube(150, 640, '#ff3d2e', 'Ш', -9)}${cube(250, 652, '#3b6fd8', 'О', 6)}${cube(760, 650, '#c2247a', '!', 12)}`)}
  ${title('ХОРОШО!', { x: 610, y: 112, size: 104, rot: -4 })}
  ${fall({ n: 60, seed: 4, colors: ['#ff5fa2', '#ff8fc0', '#fff'], pills: 0.45 }).replaceAll('cx="', 'cx="').replace(/^/, '<g transform="scale(0.75 1)">')}</g>`,
  `${mono('PLAY ►', 200, 64)}${mono('SP 0:00:07', 200, 690)}${bug}`,
);

const light = (x, c, tilt) => `<path d="M ${x - 20},0 L ${x + 20},0 L ${x + tilt + 190},620 L ${x + tilt - 190},620 Z" fill="${c}" opacity="0.3"/>`;
const ears = (x, s, lift = 0) => `<g transform="translate(${x} ${720 - lift}) scale(${s})"><path d="M -70,40 C -80,-40 -40,-70 0,-70 C 40,-70 80,-40 70,40 Z M -34,-60 C -50,-130 -40,-200 -18,-220 C 0,-190 -4,-120 -8,-64 Z M 10,-64 C 6,-130 20,-200 50,-214 C 62,-170 46,-110 32,-58 Z" fill="#07060a"/></g>`;
const kit = `<g transform="translate(790 470)"><ellipse cx="-110" cy="-120" rx="70" ry="14" fill="#ffd23e" stroke="${INK}" stroke-width="5"/><path d="M -110,-110 V 110" stroke="${INK}" stroke-width="6"/>
  <ellipse cx="120" cy="-140" rx="76" ry="15" fill="#ffd23e" stroke="${INK}" stroke-width="5"/><path d="M 120,-130 V 110" stroke="${INK}" stroke-width="6"/>
  <circle cx="0" cy="50" r="74" fill="#f4f1e4" stroke="${INK}" stroke-width="7"/><circle cx="0" cy="50" r="54" fill="none" stroke="#c2247a" stroke-width="8"/>
  <text x="0" y="64" text-anchor="middle" font-family="Inter Display,sans-serif" font-weight="900" font-size="40" fill="${INK}">ГБ</text>
  <rect x="-96" y="-60" width="74" height="44" rx="6" fill="#2bd4c4" stroke="${INK}" stroke-width="5"/><rect x="24" y="-64" width="80" height="46" rx="6" fill="#ff3d2e" stroke="${INK}" stroke-width="5"/></g>`;

const live = crt(
  `<rect width="960" height="720" fill="#1a0f33"/><rect y="540" width="960" height="180" fill="#2c1b52"/>
  ${light(140, '#ff5fa2', 80)}${light(480, '#ffd23e', 0)}${light(800, '#7df0ff', -60)}
  ${wob(`${bot({ x: 800, y: 300, s: 0.62, headS: 1.35, hair: 'tuft', torso: 150, led: '#39ff88', armL: [[-80, -30], [-120, -100]], armR: [[80, -20], [130, -110]], legs: false })}${kit}
  ${bot({ x: 150, y: 290, s: 0.7, hair: 'mohawk', torso: 230, armL: [[-40, 70], [10, 120]], armR: [[40, 60], [-30, 110]], over: guitar({ x: -40, y: 130, rot: -24, s: 0.8 }) })}
  ${bot({ x: 590, y: 310, s: 0.74, w: 1.5, torso: 180, headS: 0.8, eyes: 'two', hair: 'bald', armL: [[-30, 80], [20, 130]], armR: [[30, 70], [-40, 120]], over: guitar({ x: -60, y: 130, rot: -14, s: 0.8, color: '#2bd4c4', bass: true }) })}
  ${bot({ x: 380, y: 280, s: 0.86, open: 0.9, lid: 0, brow: -6, look: [0, -1], armL: [[-60, 10], [-50, -90]], armR: [[30, 80], [60, 150]] })}`)}
  <rect x="40" y="548" width="640" height="56" fill="#3b6fd8" stroke="${INK}" stroke-width="5"/><rect x="40" y="548" width="150" height="56" fill="#ff3d2e" stroke="${INK}" stroke-width="5"/>
  <text x="115" y="587" text-anchor="middle" font-family="Inter Display,sans-serif" font-weight="900" font-size="30" fill="#fff">ЭФИР</text>
  <text x="206" y="587" font-family="Inter Display,sans-serif" font-weight="800" font-style="italic" font-size="30" fill="#fff">ГРЁБАНЫЙ БАЛ — «ХОРОШО!»</text>
  ${ears(110, 0.8, -30)}${ears(300, 0.62, -40)}${ears(500, 0.86, -30)}${ears(730, 0.66, -36)}${ears(890, 0.8, -30)}`,
  `${mono('●REC', 200, 64, 30, '#ff3d2e')}${bug}`,
);

const WORDS = [40, 300, 450, 600];
const marks = tallies({ box: [-40, 284, 1320, 610], h: 42, seed: 5, skip: [WORDS] }) + tallies({ box: [-40, 14, 1320, 262], h: 34, seed: 8, color: '#5f6b60', op: 0.7 });
const off = `<rect width="1280" height="720" fill="#aab3a0"/><rect y="270" width="1280" height="450" fill="#2f5a4b"/><path d="M 0,270 H 1280" stroke="${INK}" stroke-width="5"/>
  <rect y="610" width="1280" height="110" fill="#1d1c22"/><path d="M 0,610 H 1280" stroke="${INK}" stroke-width="5"/>
  ${marks}
  <ellipse cx="560" cy="420" rx="520" ry="330" fill="#8fd8ff" opacity="0.5" filter="url(#soft)"/>
  <g transform="translate(900 380)" opacity="0.62" filter="url(#wob2)"><path d="M -150,330 C -190,60 -150,-60 0,-70 C 150,-60 190,60 150,330 Z M -90,-40 C -150,-220 -130,-380 -70,-430 C -20,-360 -20,-200 -30,-66 Z M 30,-66 C 20,-220 60,-380 130,-410 C 170,-320 120,-160 86,-36 Z" fill="#06070a"/></g>
  ${scratched('КАК,', 70, 322, 66, 3, -4)}${scratched('СУКА,', 96, 408, 70, 7, 3)}${scratched('ХОРОШО', 52, 500, 78, 12, -2)}
  ${wob(`<rect x="470" y="560" width="150" height="20" fill="#6b5a44" stroke="${INK}" stroke-width="5"/><path d="M 490,580 L 478,700 M 600,580 L 612,700" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  ${bot({ x: 545, y: 370, s: 0.95, outfit: 'strait', buckles: true, open: 0.5, lid: 0, brow: -10, look: [0, -0.4], armL: [[-10, 80], [110, 110]], armR: [[10, 90], [-110, 124]], legL: [[-40, 30], [-50, 140]], legR: [[40, 30], [50, 140]], torso: 190 })}`)}
  ${fall({ n: 16, seed: 9, colors: ['#ff5fa2'], pills: 0.6 })}
  <rect width="1280" height="720" fill="#04060c" opacity="0.28"/>${grain(0.55)}`;

export default {
  name: 'v1',
  title: 'Вариант 1 — канал «ГБ»: детская передача из 90-х, которую никто не выключил',
  note: 'Клип — это VHS-запись телеэфира в 4:3. Тихое вступление ведёт детскую передачу; на входе группы декорация падает, и дальше каждое «(Хорошо!)» — щелчок пульта: телемагазин «Ложка с секретом», прогноз «ненастье рифмы ради», «Поле чудес» с тремя словами на табло. Зайчик сидит на каждом канале, каждый раз ближе. Рваный финал — удары по каналам и чёрный экран; в 16:9 и без плёнки снята только «реальность».',
  panels: [
    { svg: panel(kids), tc: '0:00–0:18 · вступление', cap: 'Ведущий поёт «не сдохнуть бы от счастья» детям. Солнце смотрит не туда. За холмом кто-то есть. Серотонин идёт как студийный снег.' },
    { svg: panel(live), tc: '0:20, 0:42–1:02 · вход группы, припев', cap: '«Живой звук» в телестудии: четыре Вовы. В зале одни уши. Плашка внизу, REC мигает, лента подёргивается.' },
    { svg: panel(off), tc: '1:32–1:58 · провалы в тишину', cap: 'Каждая пауза — телевизор гаснет, и видно, кто его смотрел. Свет экрана, три слова ногтём и кровью, считалочки пятёрками без конца и края, и тень того, кто стоит за камерой.' },
  ],
};
