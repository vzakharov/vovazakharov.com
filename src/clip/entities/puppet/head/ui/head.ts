import {
  add,
  at,
  clamp,
  ellipse,
  ink,
  INK_PALETTE,
  limb,
  type Pen,
  polygon,
} from '@/clip/shared/ink';

import type { Look } from '../model/look';
import { eye, led } from './eyes';
import type { Face } from './face';
import {
  DROP,
  DROP_STARTS,
  EAR,
  EAR_FOLD,
  GOATEE,
  HAIR,
  HINGE_AT,
  JAW,
  JAW_SHADE,
  JAW_SHINE,
  JAW_VENTS,
  LOWER_TEETH,
  MASK,
  MASK_BOLTS,
  MASK_LINES,
  MASK_SHADE,
  MASK_SHINE,
  NOSE,
  SKULL,
  UPPER_TEETH,
} from './head-shapes';
import { HEAD_PALETTE, LED_PALETTE } from './palette-head';
import { swivelled, swivelledPath } from './warp';

export const DEFAULT_LOOK: Look = {
  jaw: 0,
  gaze: [0, 0],
  brow: 0.4,
  lid: 0.2,
  led: LED_PALETTE.red,
  eyes: 'one',
  hair: 'cap',
  sweat: 0,
  turn: 0,
  nod: 0,
};

// How far the jaw plate travels when it drops all the way.
const JAW_DROP = 56;

function ears({ pen, look, seed }: Face): void {
  for (const side of [-1, 1] as const) {
    // The ear on the side turned away slides behind the skull.
    const hidden = Math.max(0, side * look.turn);
    at(pen, { x: -side * hidden * 20, flip: side < 0 }, () => {
      ink(pen, EAR, { fill: INK_PALETTE.skin, seed: seed + 1 });
      ink(pen, EAR_FOLD, { width: 3, seed: seed + 2 });
    });
  }
}

function hair({ pen, look, seed, bend }: Face): void {
  const shape = HAIR[look.hair];
  if (!shape) return;
  const mohawk = look.hair === 'mohawk';
  ink(pen, bend(shape), {
    fill: mohawk ? HEAD_PALETTE.mohawk : HEAD_PALETTE.hair,
    seed: seed + 3,
    // A mohawk's spikes are the one soft thing on the head.
    wobble: mohawk ? 3 : undefined,
  });
}

/** The hinged plate, its teeth, the goatee under it, and the dark it opens on. */
function jaw({ pen, look, seed, bend, spot }: Face): void {
  const open = clamp(look.jaw, 0, 1);
  const drop = open * JAW_DROP;
  ink(
    pen,
    bend(
      polygon([
        [-64, 42],
        [64, 42],
        [62, 72 + drop],
        [-62, 72 + drop],
      ]),
    ),
    { fill: HEAD_PALETTE.hollow, stroke: null },
  );
  if (open > 0.25) {
    ink(pen, bend(ellipse([0, 64 + drop * 0.6], 34, 4 + drop * 0.3)), {
      fill: HEAD_PALETTE.maw,
      stroke: null,
      alpha: clamp((open - 0.25) * 1.6, 0, 1),
    });
  }
  at(pen, { y: drop }, () => {
    ink(pen, bend(GOATEE), {
      fill: HEAD_PALETTE.hair,
      width: 4,
      seed: seed + 30,
    });
    ink(pen, bend(JAW), { fill: INK_PALETTE.metal, width: 6, seed: seed + 31 });
    ink(pen, bend(JAW_SHADE), {
      fill: INK_PALETTE.metalDark,
      stroke: null,
      alpha: 0.7,
    });
    ink(pen, bend(JAW_SHINE), {
      stroke: INK_PALETTE.metalLight,
      width: 5,
      alpha: 0.85,
      seed: seed + 32,
    });
    ink(pen, bend(JAW_VENTS), { width: 3.5, seed: seed + 33 });
    ink(pen, bend(LOWER_TEETH), {
      fill: INK_PALETTE.bone,
      width: 2.5,
      seed: seed + 34,
      wobble: 0.8,
    });
  });
  // The struts the plate hangs on: they stretch as it drops.
  for (const side of [-1, 1] as const) {
    const hinge = spot([side * HINGE_AT[0], HINGE_AT[1]]);
    const corner = spot([side * 78, 46 + drop]);
    limb(pen, [hinge, corner], INK_PALETTE.metalDark, 5, seed + 35);
  }
}

function mask({ pen, look, seed, bend, spot }: Face): void {
  ink(pen, bend(MASK[look.eyes]), {
    fill: INK_PALETTE.metal,
    width: 6,
    seed: seed + 10,
  });
  for (const shine of MASK_SHINE[look.eyes]) {
    ink(pen, bend(shine), {
      fill: INK_PALETTE.metalLight,
      stroke: null,
      alpha: 0.85,
    });
  }
  for (const shade of MASK_SHADE) {
    ink(pen, bend(shade), {
      fill: INK_PALETTE.metalDark,
      stroke: null,
      alpha: 0.7,
    });
  }
  ink(pen, bend(MASK_LINES), { width: 3, seed: seed + 11 });
  for (const bolt of MASK_BOLTS) {
    ink(pen, ellipse(spot(bolt), 3), {
      fill: INK_PALETTE.metalLight,
      width: 2,
    });
  }
  led({ pen, look, seed, bend, spot }, -1);
  if (look.eyes === 'two') led({ pen, look, seed: seed + 40, bend, spot }, 1);
  ink(pen, bend(NOSE), {
    fill: HEAD_PALETTE.hollow,
    width: 3,
    seed: seed + 12,
  });
  ink(pen, bend(UPPER_TEETH), {
    fill: INK_PALETTE.bone,
    width: 2.5,
    seed: seed + 13,
    wobble: 0.8,
  });
  for (const side of [-1, 1] as const) {
    const [x, y] = spot([side * HINGE_AT[0], HINGE_AT[1]]);
    ink(pen, ellipse([x, y], 8.5), {
      fill: INK_PALETTE.metalLight,
      width: 4,
      seed: seed + 14,
    });
    ink(
      pen,
      polygon(
        [
          [x - 4, y - 3],
          [x + 4, y + 3],
        ],
        'open',
      ),
      { width: 2.5 },
    );
  }
}

// How long a bead takes to run its course, in seconds, and how far it runs.
const DROP_PERIOD = 1.3;
const DROP_RUN = 70;

function sweat({ pen, look, seed, spot }: Face): void {
  const beads = Math.ceil(clamp(look.sweat, 0, 1) * DROP_STARTS.length);
  for (const [n, start] of DROP_STARTS.slice(0, beads).entries()) {
    const run = (pen.playhead / DROP_PERIOD + n * 0.37) % 1;
    const [x, y] = spot(add(start, [0, run * DROP_RUN]));
    at(pen, { x, y, scale: 0.7 + 0.5 * Math.sin(run * Math.PI) }, () => {
      ink(pen, DROP, {
        fill: HEAD_PALETTE.sweat,
        width: 3,
        seed: seed + 50 + n,
        alpha: 1 - run ** 4,
      });
    });
  }
}

/**
 * The robo-avatar's head, face-on, in its own units: about 190 wide, 340 tall,
 * the origin between the eyes. Place and size it with `at`.
 */
export function head(pen: Pen, look: Partial<Look> = {}, seed = 0): void {
  const full = { ...DEFAULT_LOOK, ...look };
  const { turn, nod, hair: style, eyes, sweat: wet } = full;
  const face: Face = {
    pen,
    look: full,
    seed,
    bend: (shape) => swivelledPath(shape, turn, nod),
    spot: (point) => swivelled(point, turn, nod),
  };
  ears(face);
  ink(pen, swivelledPath(SKULL, turn, nod), {
    fill: INK_PALETTE.skin,
    width: 6,
    seed,
  });
  if (style !== 'mohawk') hair(face);
  if (eyes === 'one') eye(face);
  jaw(face);
  mask(face);
  // The mohawk stands in front of the crest it grows beside.
  if (style === 'mohawk') hair(face);
  if (wet > 0) sweat(face);
}
