import { ellipse, ink, limb, polygon } from '@/clip/shared/ink';
import { jaw } from '@/clip/shared/score';
import { testCard } from '@/clip/shared/tape';
import { FORM_LOOKS, puppet } from '@/clip/entities/puppet';

import { CHANNELS_PALETTE } from './palette-channels';
import { box, caption, lurker, type Show, WIDTH } from './screen';

const { news, clock } = CHANNELS_PALETTE;

/** The news: the anchor behind his desk, the bunny at the window behind him. */
export const newsDesk: Show = (pen, nearness, since, stare) => {
  box(pen, news.wall);
  ink(
    pen,
    polygon([
      [600, 70],
      [900, 70],
      [900, 330],
      [600, 330],
    ]),
    {
      fill: news.window,
      seed: 81,
    },
  );
  lurker(pen, nearness, [750, 150], 'down', 11);
  puppet(pen, {
    place: { x: 330, y: 800, scale: 0.85 },
    pose: 'sing',
    outfit: 'suit',
    // Reading the autocue off to the side, until he stops and looks out.
    look: {
      ...FORM_LOOKS.vocal,
      jaw: jaw(pen.playhead) * (1 - stare),
      gaze: [-0.7 * (1 - stare), 0.2 * (1 - stare)],
      turn: -0.5 * (1 - stare),
      brow: stare * 0.6,
    },
    mark: 4000,
  });
  ink(
    pen,
    polygon([
      [60, 500],
      [900, 500],
      [880, 640],
      [80, 640],
    ]),
    {
      fill: news.desk,
      seed: 82,
    },
  );
  caption(pen, 'НОВОСТИ', [330, 545], 8);
  box(pen, news.ticker, [0, 650, WIDTH, 60]);
  const ticker = 'СРОЧНО: ВСЁ ХОРОШО';
  const x = WIDTH + 500 - ((since * 220) % (WIDTH + 1000));
  caption(pen, ticker, [x, 664], 5);
};

/** The station's test card, the bunny standing in its middle. */
export const bunnyCard: Show = (pen, nearness) => {
  testCard(pen, 0);
  lurker(pen, nearness, [WIDTH / 2, 230], 'down', 13);
};

/** The station clock at three in the night, the bunny's ears over its rim. */
export const stationClock: Show = (pen, nearness) => {
  const centre = [WIDTH / 2, 340] as const;
  box(pen, clock.field);
  lurker(pen, nearness, [WIDTH / 2, 150], 'down', 17);
  ink(pen, ellipse(centre, 220), { fill: clock.face, width: 10, seed: 91 });
  for (let n = 0; n < 12; n += 1) {
    const a = (n / 12) * Math.PI * 2;
    const [s, c] = [Math.sin(a), Math.cos(a)];
    limb(
      pen,
      [
        [centre[0] + s * 180, centre[1] - c * 180],
        [centre[0] + s * 200, centre[1] - c * 200],
      ],
      clock.hand,
      n % 3 === 0 ? 10 : 4,
      92 + n,
    );
  }
  const hand = (turn: number, length: number, width: number, color: string) => {
    const a = turn * Math.PI * 2;
    limb(
      pen,
      [
        centre,
        [centre[0] + Math.sin(a) * length, centre[1] - Math.cos(a) * length],
      ],
      color,
      width,
      110 + width,
    );
  };
  hand(0.25, 110, 14, clock.hand);
  hand(0, 170, 9, clock.hand);
  hand(Math.floor(pen.playhead) / 60, 190, 3, clock.dot);
  caption(pen, '03:00', [WIDTH / 2, 600], 12);
};
