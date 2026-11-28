import { bot, bunny, g, guitar, head, panel, title } from './lib.mjs';

const wob = inner => `<g filter="url(#wob)">${inner}</g>`;

const faces = panel(
  wob(
    g(head({}), { x: 230, y: 380, s: 1.45 }) +
      g(head({ open: 1, look: [0, -1], brow: -6, lid: 0 }), { x: 640, y: 340, s: 1.45 }) +
      g(head({ eyes: 'two', hair: 'bald', open: 0.3 }), { x: 1050, y: 380, s: 1.45 }),
  ) + title('пасть на шарнире', { x: 640, y: 690, size: 44, rot: 0, sw: 6 }),
  '#3b2a5c',
);

const band = panel(
  `<rect y="596" width="1280" height="110" fill="#1b1a20"/>` +
    wob(
      bot({ x: 190, y: 330, s: 0.78, outfit: 'jacket', hair: 'mohawk', torso: 230, armL: [[-40, 70], [10, 120]], armR: [[40, 60], [-30, 110]], over: guitar({ x: -40, y: 130, rot: -24, s: 0.8 }) }) +
        bot({ x: 480, y: 310, s: 0.84, open: 0.8, armL: [[-50, 40], [-30, -40]], armR: [[30, 80], [60, 150]], brow: -4 }) +
        bot({ x: 770, y: 350, s: 0.82, w: 1.5, torso: 180, headS: 0.8, eyes: 'two', hair: 'bald', armL: [[-30, 80], [20, 130]], armR: [[30, 70], [-40, 120]], over: guitar({ x: -60, y: 130, rot: -14, s: 0.8, color: '#2bd4c4', bass: true }) }) +
        bot({ x: 1010, y: 440, s: 0.6, headS: 1.35, hair: 'tuft', torso: 150, armL: [[-70, -30], [-90, -110]], armR: [[70, -30], [90, -110]], legL: [[-10, 60], [-14, 120]], legR: [[10, 60], [14, 120]], led: '#39ff88' }) +
        bunny({ x: 1180, y: 330, s: 0.62 }),
    ),
  '#c2247a',
);

export default {
  name: 'cast',
  title: 'Состав: робоаватар, перерисованный',
  note: 'Один и тот же Вова в четырёх экземплярах. Маска с челюстью на шарнире: поёт она, а не он — рот открывается как у щелкунчика.',
  panels: [
    { svg: faces, tc: 'ГОЛОВА', cap: 'Спокойный · орёт «Хорошо!» · басист в полной маске' },
    { svg: band, tc: 'ГРУППА', cap: 'Гитара (ирокез) · вокал · бас (шкаф, голова маленькая) · ударник (мелкий, зелёный глаз) · зайчик' },
  ],
};
