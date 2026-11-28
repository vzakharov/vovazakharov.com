import type { Pen } from '@/clip/shared/ink';
import {
  jaw,
  KICKS,
  pulse,
  punch,
  sectionAt,
  through,
} from '@/clip/shared/score';
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
// The bunnies by when they have arrived, 0 to 1 through the chorus: x, the
// floor they stand on, their size. The first five dance behind the band, the
// last three close in from the front, nearer each time.
type Arrival = readonly [x: number, y: number, scale: number, from: number];
const BEHIND: readonly Arrival[] = [
  [80, 470, 0.4, 0],
  [490, 440, 0.44, 0],
  [900, 470, 0.4, 0],
  [300, 420, 0.32, 0.2],
  [700, 420, 0.32, 0.35],
];
const IN_FRONT: readonly Arrival[] = [
  [20, 760, 0.7, 0.5],
  [950, 770, 0.75, 0.65],
  [130, 900, 1, 0.85],
];
// The share of a hop spent on the ground: the landing's squash, then the
// crouch to spring, both in the knees.
const GROUNDED = 0.32;
// How deep the knees bend and how far the hands lag, in the puppet's units.
const KNEES = 36;
const LAG = 26;
const WORD = ['Х', 'О', 'Р', 'О', 'Ш', 'О'] as const;

type Hop = { height: number; dip: number; trail: number };

/**
 * A player's hop `fraction` through the half-time pulse: it lands squashed on
 * the hit, rises, crouches again to spring, and is in the air for the rest,
 * its hands trailing low on the way up and flung high on the way down.
 */
function hopOf(fraction: number): Hop {
  if (fraction < GROUNDED) {
    const u = fraction / GROUNDED;
    return {
      height: 0,
      dip: KNEES * (0.55 + 0.45 * Math.cos(2 * Math.PI * u)),
      trail: LAG * (0.7 - 1.7 * (1 - u) ** 2),
    };
  }
  const u = (fraction - GROUNDED) / (1 - GROUNDED);
  return {
    height: Math.sin(Math.PI * u),
    dip: -6 * Math.sin(Math.PI * u),
    trail: LAG * (0.85 * Math.cos(Math.PI * u) - 0.15),
  };
}

function bunnies(
  pen: Pen,
  arrivals: readonly Arrival[],
  fraction: number,
  wrong: number,
  seed: number,
): void {
  for (const [n, [x, y, scale, from]] of arrivals.entries()) {
    if (wrong < from) continue;
    bunny(pen, {
      x,
      y,
      scale,
      nearness: 0.5 + 0.2 * wrong,
      grin: 0.4 + 0.6 * wrong,
      eyes: 'button',
      hop: fraction,
      swaying: 1,
      seed: seed + n,
    });
  }
}

/**
 * The party itself, in the screen's units, the whole cast landing on each
 * pulse. It goes wrong through the chorus a pulse at a time: grins widen past
 * their faces, jaws hang, more bunnies arrive, nearer, and the camera creeps in.
 */
function party(pen: Pen, framing: Framing): void {
  const { ctx, playhead: t } = pen;
  const { index, fraction, seconds } = pulse(t);
  const beats = 2 * (index + fraction);
  const { height: lift, dip, trail } = hopOf(fraction);
  const kick = punch(KICKS, t);
  const [cx, cy, framed] = CAMERAS[framing];
  const wrong = through(sectionAt(t), t - fraction * seconds);
  const zoom = framed * (1 + 0.14 * wrong);

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
    smile: 1 + 1.4 * wrong,
    bob: 0,
    gaze: [-0.6 * (1 - wrong), 0.5 * (1 - wrong)],
    seed: 11,
  });
  cloud(pen, { x: 180, y: 110, scale: 0.9, drift: 6, seed: 3 });
  cloud(pen, { x: 520, y: 70, scale: 0.7, drift: 4, seed: 4 });
  rollingHills(pen, { x: -200, y: 260, width: 1360, height: 560, seed: 5 });

  bunnies(pen, BEHIND, fraction, wrong, 40);
  const gape = 0.15 + 0.75 * wrong;
  for (const [role, x, mark] of BAND) {
    player(pen, role, {
      beats,
      jaw: role === 'vocal' ? Math.max(jaw(t), gape) : gape,
      place: { x, y: GROUND - 70 * lift, scale: 0.38 },
      carriage: { dip },
      trail,
      look: { brow: -1, lid: 0, gaze: [0, 0.2 * (1 - wrong)] },
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
  bunnies(pen, IN_FRONT, fraction, wrong, 50);
  ctx.restore();

  serotoninFall(pen, {
    ...SCREEN,
    density: 0.4 + 0.6 * wrong,
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
