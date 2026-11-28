import { INK, bot, bunny, fall, g, grain, guitar, head, id, mic, panel } from './lib.mjs';

const wob = inner => `<g filter="url(#wob)">${inner}</g>`;

const flag = (x, y, c, ch, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(0.6)"><rect x="-36" y="0" width="72" height="84" fill="${c}" stroke="${INK}" stroke-width="5"/><text y="64" text-anchor="middle" font-family="Inter Display, sans-serif" font-weight="900" font-size="62" fill="${INK}">${ch}</text></g>`;
const banner = [...'ХОРОШО!'].map((ch, i) => flag(430 + i * 70, 66 + Math.sin(i * 0.9) * 8 + 8, ['#ffd23e', '#ff5fa2', '#7df0ff', '#f4f1e4'][i % 4], ch, (i % 2 ? 1 : -1) * 6)).join('');
const pot = (x, y, s, dots = '#d83a2a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -60,-40 L 60,-40 L 52,40 L -52,40 Z" fill="#f4f1e4" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><ellipse cy="-40" rx="62" ry="12" fill="#cfd3da" stroke="${INK}" stroke-width="5"/><path d="M -60,-20 h -20 v 16 h 18 M 60,-20 h 20 v 16 h -18" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="-24" cy="4" r="9" fill="${dots}"/><circle cx="8" cy="-10" r="9" fill="${dots}"/><circle cx="26" cy="14" r="9" fill="${dots}"/></g>`;
const orderly = (x, flipS) =>
  g(
    `${bunny({ s: 0.62, fill: '#f4f1e4' })}<path d="M -40,6 C -50,80 -42,190 -26,262 L 26,262 C 42,190 50,80 40,6 Z" fill="#fff" stroke="${INK}" stroke-width="5"/><path d="M -9,60 h 18 M 0,51 v 18" stroke="#d83a2a" stroke-width="8"/>`,
    { x, y: 330, sx: flipS, s: 1 },
  );
let crowd = '';
for (let i = 0; i < 9; i++) {
  const x = 70 + i * 143;
  const y = 690 + (i % 2) * 26;
  crowd += `<path d="M ${x - 80},760 C ${x - 80},${y + 40} ${x + 80},${y + 40} ${x + 80},760 Z" fill="${i % 3 ? '#8fc7d8' : '#e9e4d2'}" stroke="${INK}" stroke-width="6"/>` + g(head({ look: [0, 0], lid: 0.05, brow: 4, open: i === 4 ? 0.5 : 0 }), { x, y: y - 60, s: 0.5 });
}
const hall = `<rect width="1280" height="720" fill="#cfc8a6"/><rect y="250" width="1280" height="470" fill="#4f8672"/><path d="M 0,250 H 1280" stroke="${INK}" stroke-width="5"/>
  ${wob(`<rect x="170" y="60" width="940" height="466" fill="#241a36" stroke="${INK}" stroke-width="7"/>
  <path d="M 170,60 C 250,200 230,400 190,526 L 170,526 Z M 1110,60 C 1030,200 1050,400 1090,526 L 1110,526 Z" fill="#b3202e" stroke="${INK}" stroke-width="6"/>
  <path d="M 250,64 Q 640,96 1030,64" fill="none" stroke="${INK}" stroke-width="4"/>${banner}
  ${bot({ x: 930, y: 290, s: 0.46, outfit: 'pajama', headS: 1.35, hair: 'tuft', torso: 150, led: '#39ff88', armL: [[-80, -30], [-120, -100]], armR: [[80, -20], [130, -110]], legs: false })}
  ${pot(860, 450, 0.9)}${pot(980, 440, 1.05, '#3b6fd8')}${pot(920, 484, 0.7)}
  ${bot({ x: 340, y: 276, s: 0.5, outfit: 'pajama', hair: 'mohawk', torso: 230, armL: [[-40, 70], [10, 120]], armR: [[40, 60], [-30, 110]], over: guitar({ x: -40, y: 130, rot: -24, s: 0.8 }) })}
  ${bot({ x: 740, y: 296, s: 0.52, outfit: 'pajama', w: 1.5, torso: 180, headS: 0.8, eyes: 'two', hair: 'bald', armL: [[-30, 80], [20, 130]], armR: [[30, 70], [-40, 120]], over: guitar({ x: -60, y: 130, rot: -14, s: 0.8, color: '#2bd4c4', bass: true }) })}
  ${bot({ x: 540, y: 262, s: 0.6, outfit: 'strait', buckles: true, open: 1, lid: 0, brow: -6, look: [0, -1], armL: [[-70, -30], [-100, -120]], armR: [[70, -30], [100, -120]] })}
  <rect x="150" y="522" width="980" height="40" fill="#7a5a36" stroke="${INK}" stroke-width="6"/>
  ${orderly(86, 1)}${orderly(1194, -1)}${crowd}`)}
  ${fall({ n: 70, seed: 41, colors: ['#ff5fa2', '#ffd23e', '#7df0ff', '#fff'], pills: 0.6 })}${grain(0.4)}`;

let rays = '';
for (let i = 0; i < 18; i++) rays += `<path d="M 640,400 L ${640 + Math.cos((i * Math.PI) / 9) * 1100},${400 + Math.sin((i * Math.PI) / 9) * 1100} L ${640 + Math.cos(((i + 0.5) * Math.PI) / 9) * 1100},${400 + Math.sin(((i + 0.5) * Math.PI) / 9) * 1100} Z" fill="#ff3d8a"/>`;
const strap = (x, y, dx) => `<path d="M ${x},${y} q ${dx},60 ${dx * 0.4},150" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M ${x},${y} q ${dx},60 ${dx * 0.4},150" fill="none" stroke="#7a6a4a" stroke-width="8" stroke-linecap="round"/>`;
const close = `<rect width="1280" height="720" fill="#ffd23e"/>${rays}<rect width="1280" height="720" fill="url(#half)" opacity="0.16"/>
  <g transform="translate(640 250) rotate(-7)" font-family="Inter Display, sans-serif" font-weight="900" font-style="italic" font-size="300" text-anchor="middle"><text x="12" y="16" fill="${INK}">ХОРОШО</text><text fill="#fff" stroke="${INK}" stroke-width="12" paint-order="stroke">ХОРОШО</text></g>
  ${wob(`${bot({ x: 600, y: 520, s: 1.75, outfit: 'strait', buckles: true, rot: -5, headRot: -8, open: 1, lid: 0, brow: -14, look: [0.3, -1], legs: false, armL: [[-90, -50], [-150, -170]], armR: [[90, -40], [170, -150]], torso: 260 })}
  ${strap(300, 190, -50)}${strap(940, 250, 60)}${mic({ x: 760, y: 740, h: 250, lean: -70 })}
  <g transform="translate(1110 560) rotate(-38)"><rect x="-150" y="-26" width="210" height="52" rx="8" fill="#eaf7ff" stroke="${INK}" stroke-width="6"/><rect x="-150" y="-26" width="120" height="52" rx="8" fill="#ff5fa2" stroke="${INK}" stroke-width="6"/><path d="M 60,0 H 96 M 96,-34 V 34 M -150,0 H -260" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M -260,0 h 6" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="130" cy="6" rx="58" ry="44" fill="#f4f1e4" stroke="${INK}" stroke-width="6"/><path d="M 110,-20 q -18,8 -22,24 M 132,-30 q -16,10 -20,28" fill="none" stroke="${INK}" stroke-width="4"/></g>`)}
  ${fall({ n: 30, seed: 52, colors: ['#7df0ff', '#fff', '#39ff88'], pills: 0.8, maxS: 2.4 })}${grain(0.35)}`;

const gc = id('globe');
let wins = '';
for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) wins += `<rect x="${-112 + c * 40}" y="${-110 + r * 44}" width="22" height="28" fill="${r === 1 && c === 4 ? '#ff2a1a' : (r + c) % 4 === 0 ? '#1a1a2a' : '#ffd23e'}" stroke="${INK}" stroke-width="3"/>`;
const globe = `<rect width="1280" height="720" fill="#120c24"/>
  ${wob(`${bunny({ x: 640, y: 330, s: 1.75, fill: '#d9d4e6', grin: 1.15 })}
  <ellipse cx="640" cy="470" rx="250" ry="250" fill="#7fd0ff" opacity="0.5" filter="url(#soft)"/>
  <clipPath id="${gc}"><circle cx="640" cy="440" r="212"/></clipPath>
  <circle cx="640" cy="440" r="212" fill="#1c2a5a" stroke="${INK}" stroke-width="8"/>
  <g clip-path="url(#${gc})"><path d="M 400,580 Q 640,520 880,580 V 700 H 400 Z" fill="#f4f1e4" stroke="${INK}" stroke-width="5"/>
  <g transform="translate(640 560)"><rect x="-126" y="-130" width="252" height="130" fill="#b9b29a" stroke="${INK}" stroke-width="6"/>${wins}<rect x="-16" y="-34" width="32" height="34" fill="#3a2a1c" stroke="${INK}" stroke-width="3"/><path d="M -140,-130 H 140" stroke="${INK}" stroke-width="10"/></g>
  <g transform="translate(0 -40) scale(1 1)">${fall({ n: 150, seed: 61, colors: ['#ff5fa2', '#ff8fc0', '#fff'], pills: 0.2, maxS: 1.1 })}</g>
  <path d="M 500,330 Q 540,260 620,246" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.5"/></g>
  <circle cx="640" cy="440" r="212" fill="none" stroke="${INK}" stroke-width="8"/>
  <path d="M 470,630 L 810,630 L 850,712 L 430,712 Z" fill="#6b4a2a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="540" y="652" width="200" height="40" fill="#e8b84a" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="420" cy="500" rx="56" ry="86" fill="#d9d4e6" stroke="${INK}" stroke-width="7" transform="rotate(-18 420 500)"/><ellipse cx="860" cy="500" rx="56" ry="86" fill="#d9d4e6" stroke="${INK}" stroke-width="7" transform="rotate(18 860 500)"/>
  <path d="M 396,450 q 20,20 30,50 M 420,440 q 18,22 26,54 M 884,450 q -20,20 -30,50 M 860,440 q -18,22 -26,54" fill="none" stroke="${INK}" stroke-width="4"/>`)}
  <text x="640" y="682" text-anchor="middle" font-family="Inter Display, sans-serif" font-weight="900" font-size="30" fill="${INK}">ХОРОШО!</text>${grain(0.5)}`;

export default {
  name: 'v3',
  title: 'Вариант 3 — «Ёлка в дурдоме»: концерт в актовом зале',
  note: 'Самый «горилласовый»: фильм-концерт. Грёбаный бал играет утренник в актовом зале: гирлянда из букв, ударные из эмалированных кастрюль, санитары в заячьих масках у дверей, с потолка сыплются таблетки. Куплет — комиксовые крупные планы на каждое «(Хорошо!)», припев — общий план и мош в пижамах. В тишине перед финалом зал пуст; на последних ударах камера отъезжает, пока больница не окажется шаром со снегом.',
  panels: [
    { svg: panel(hall), tc: '0:20–0:28 · вход группы', cap: 'Общий план. Группа на сцене, а зал — девять таких же — сидит к сцене спиной и смотрит на нас. Один подпевает.' },
    { svg: panel(close), tc: '0:28–0:42 · «(Хорошо!)»', cap: 'Крупный план на каждый выкрик: рыбий глаз, полутон, челюсть нараспашку, ремни рубашки летят. Справа в кадр входит лапа со шприцем — серотонин.' },
    { svg: panel(globe), tc: '1:50–1:58 · последний удар', cap: 'Отъезд: больница — шар со снегом, серотонинопад идёт только внутри. Одно окно красное. Шар держит тот, кто его встряхнул.' },
  ],
};
