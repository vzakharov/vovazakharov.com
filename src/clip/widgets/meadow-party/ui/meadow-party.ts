import type { Pen } from '@/clip/shared/ink';
import { jaw, KICKS, pulse, punch } from '@/clip/shared/score';
import { broadcast, SCREEN } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import {
  alphabetBlock,
  cardboardSun,
  cloud,
  rollingHills,
} from '@/clip/entities/meadow';
import { player, type Role } from '@/clip/entities/puppet';
import { CONFETTI_PALETTE, serotoninFall } from '@/clip/entities/serotonin';

import { PARTY_PALETTE } from './palette-meadow-party';

/** Where the camera stands on the meadow: the whole party, the band, or the sun and the bunnies. */
export const FRAMINGS = ['wide', 'band', 'hill'] as const;
export type Framing = (typeof FRAMINGS)[number];

// The point looked at and how far in, in the screen's units.
const CAMERAS: Readonly<Record<Framing, readonly [number, number, number]>> = {
  wide: [480, 360, 1],
  band: [480, 470, 1.55],
  hill: [640, 300, 1.45],
};

const GROUND = 600;
const BAND: ReadonlyArray<readonly [Role, number, number]> = [
  ['guitar', 190, 0],
  ['vocal', 390, 1000],
  ['bass', 590, 2000],
  ['drums', 800, 3000],
];
const BUNNIES: ReadonlyArray<readonly [number, number]> = [
  [80, 0.4],
  [490, 0.44],
  [900, 0.4],
];
const WORD = ['Х', 'О', 'Р', 'О', 'Ш', 'О'] as const;

/**
 * How high a hopper is, 0 to 1, `fraction` through the half-time pulse: on
 * the ground at each hit, at the top of the arc between.
 */
const hopHeight = (fraction: number): number => Math.sin(Math.PI * fraction);

/** The party itself, in the screen's units, the whole cast landing on each pulse. */
function party(pen: Pen, framing: Framing): void {
  const { ctx, playhead: t } = pen;
  const { index, fraction } = pulse(t);
  const beats = 2 * (index + fraction);
  const lift = hopHeight(fraction);
  const kick = punch(KICKS, t);
  const [cx, cy, zoom] = CAMERAS[framing];

  ctx.fillStyle = PARTY_PALETTE.sky;
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
  ctx.save();
  ctx.translate(SCREEN.width / 2, SCREEN.height / 2);
  ctx.scale(zoom * (1 + 0.025 * kick), zoom * (1 + 0.025 * kick));
  ctx.translate(-cx, -cy);

  ctx.fillStyle = PARTY_PALETTE.haze;
  ctx.fillRect(-200, 240, SCREEN.width + 400, 120);
  cardboardSun(pen, {
    x: 690,
    y: 130 - 26 * lift,
    scale: 1.1,
    smile: 1,
    bob: 0,
    gaze: [-0.6, 0.5],
    seed: 11,
  });
  cloud(pen, { x: 180, y: 110, scale: 0.9, drift: 6, seed: 3 });
  cloud(pen, { x: 520, y: 70, scale: 0.7, drift: 4, seed: 4 });
  rollingHills(pen, { x: -200, y: 260, width: 1360, height: 560, seed: 5 });

  for (const [n, [x, scale]] of BUNNIES.entries()) {
    bunny(pen, {
      x,
      y: 470,
      scale,
      nearness: 0.5,
      hop: fraction,
      swaying: 1,
      seed: 40 + n,
    });
  }
  for (const [role, x, mark] of BAND) {
    player(pen, role, {
      beats,
      jaw: role === 'vocal' ? jaw(t) : 0.15,
      place: { x, y: GROUND - 70 * lift, scale: 0.38 },
      look: { brow: -1, lid: 0, gaze: [0, 0.2] },
      mark,
    });
  }
  for (const [n, letter] of WORD.entries()) {
    alphabetBlock(pen, {
      letter,
      x: 230 + n * 100,
      y: 714,
      scale: 0.62,
      colouring: n,
      bounce: fraction,
      seed: 60 + n,
    });
  }
  ctx.restore();

  serotoninFall(pen, {
    ...SCREEN,
    density: 0.45,
    wind: 0.1,
    period: 9,
    seed: 7,
    palette: CONFETTI_PALETTE,
  });
}

/** The chorus meadow seen through the channel's tape, framed by `framing`. */
export const meadowParty =
  (framing: Framing): Drawing =>
  (pen) => {
    broadcast(
      pen,
      (inner) => {
        party(inner, framing);
      },
      { wear: 0.22 },
    );
  };
