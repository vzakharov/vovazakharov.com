import { at, ellipse, ink, type Pen, polygon } from '@/clip/shared/ink';

import { CHANNELS_PALETTE } from './palette-channels';
import { box, caption, HEIGHT, lurker, type Show, WIDTH } from './screen';

const { shop, weather, quiz, postcard, textShadow } = CHANNELS_PALETTE;

/** The miracle spoon, its bowl at the origin. */
function spoon(pen: Pen, seed: number): void {
  ink(
    pen,
    polygon([
      [-14, 40],
      [14, 40],
      [8, 300],
      [-8, 300],
    ]),
    {
      fill: shop.spoon,
      seed,
    },
  );
  ink(pen, ellipse([0, 0], 60, 80), { fill: shop.spoon, seed: seed + 1 });
}

/** The teleshop: a spoon turning on a stand, the price, a bunny holding one too. */
export const teleshop: Show = (pen, nearness, since) => {
  box(pen, shop.wall);
  for (let n = 0; n < 8; n += 2)
    box(pen, shop.stripe, [n * 120, 0, 120, HEIGHT]);
  at(pen, { x: 330, y: 300, rot: since * 70, scale: 1.2 }, () => {
    spoon(pen, 41);
  });
  caption(pen, 'ЛОЖКА', [330, 50], 14);
  caption(pen, '999 Р', [330, 560], 18, shop.price);
  if (Math.floor(since * 2) % 2 === 0) {
    caption(pen, 'ЗВОНИТЕ', [330, 660], 7);
  }
  lurker(pen, nearness, [720, 260], 'hold', 3);
};

/** The weather: a map, a sun and a cloud, minus forty, a bunny pointing. */
export const forecast: Show = (pen, nearness) => {
  box(pen, weather.sea);
  ink(
    pen,
    polygon([
      [300, 140],
      [620, 110],
      [860, 220],
      [820, 520],
      [560, 600],
      [320, 520],
      [260, 320],
    ]),
    { fill: weather.land, seed: 51 },
  );
  ink(pen, ellipse([470, 270], 50), { fill: weather.sun, seed: 52 });
  ink(pen, ellipse([690, 410], 80, 40), { fill: weather.cloud, seed: 53 });
  caption(pen, '-40', [600, 300], 16);
  caption(pen, 'ПОГОДА', [WIDTH / 2, 40], 10);
  lurker(pen, nearness, [170, 250], 'reach', 5);
};

const QUIZ_WORDS = ['КАК', 'СУКА', 'ХОРОШО'] as const;

/** The quiz: the song's three words turning over on the board one by one. */
export const quizBoard: Show = (pen, nearness, since) => {
  box(pen, quiz.wall);
  ink(
    pen,
    polygon([
      [60, 60],
      [900, 60],
      [900, 420],
      [60, 420],
    ]),
    {
      fill: quiz.board,
      seed: 61,
    },
  );
  for (const [n, word] of QUIZ_WORDS.entries()) {
    const y = 90 + n * 108;
    const shown = since > 0.4 + n * 0.5;
    ink(
      pen,
      polygon([
        [120, y],
        [840, y],
        [840, y + 90],
        [120, y + 90],
      ]),
      {
        fill: shown ? quiz.tile : quiz.tileDark,
        seed: 62 + n,
      },
    );
    if (shown) {
      caption(pen, word, [480, y + 17], 8, textShadow);
    } else {
      caption(pen, String(n + 1), [480, y + 17], 8);
    }
  }
  lurker(pen, nearness, [480, 360], 'conduct', 7);
};

/** A postcard from the village: a hut, two birches, a bunny behind the hut. */
export const postcardShow: Show = (pen, nearness) => {
  box(pen, postcard.sky);
  box(pen, postcard.field, [0, 430, WIDTH, HEIGHT - 430]);
  lurker(pen, nearness, [560, 230], 'down', 9);
  ink(
    pen,
    polygon([
      [380, 300],
      [700, 300],
      [700, 520],
      [380, 520],
    ]),
    {
      fill: postcard.hut,
      seed: 71,
    },
  );
  ink(
    pen,
    polygon([
      [350, 310],
      [540, 170],
      [730, 310],
    ]),
    {
      fill: postcard.roof,
      seed: 72,
    },
  );
  ink(
    pen,
    polygon([
      [500, 380],
      [580, 380],
      [580, 450],
      [500, 450],
    ]),
    {
      fill: postcard.sky,
      seed: 73,
    },
  );
  for (const x of [150, 830]) {
    ink(
      pen,
      polygon([
        [x - 12, 540],
        [x + 12, 540],
        [x + 8, 160],
        [x - 8, 160],
      ]),
      {
        fill: postcard.birch,
        seed: x,
      },
    );
    ink(pen, ellipse([x, 170], 80, 110), { fill: postcard.leaf, seed: x + 1 });
  }
  caption(pen, 'ПРИВЕТ ИЗ ДЕРЕВНИ', [WIDTH / 2, 600], 8);
};
