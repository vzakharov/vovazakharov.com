import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';
import { box, face, type Quad, times } from '@/cube/entities/world';

import { pick } from '../lib/pick';
import {
  inLane,
  openSides,
  SIDE_FRAMES,
  sideAt,
  SIDES,
  spot,
} from '../lib/side';
import { type Act, NOTHING, shown, sounding, type Staging } from './staging';

/** How far over the floor a shadow lies: clear of the floor's own face. */
const SHADE_LIFT = 0.0015;
const SHADE = 0x01_01_01;

/**
 * A standing person's shadow sliding over the floor with nobody to cast it,
 * raising an arm halfway.
 */
export const shadow: Act = ({ setting, age, lastsFor, chance }) => {
  const side = pick(SIDES, chance('side'));
  const { along, into } = SIDE_FRAMES[side];
  const middle = inLane(chance('spot'));
  const foot = 0.15 + (0.3 * age) / lastsFor;
  const raised = smooth(ramp(age, 0.45 * lastsFor, 0.6 * lastsFor));
  /** A strip of shadow from `near` to `far` ahead of the foot, `left` to `right` across. */
  const strip = (
    [near, far]: readonly [number, number],
    [left, right]: readonly [number, number],
  ): Quad =>
    face(
      spot(side, middle + left, SHADE_LIFT, foot + near),
      times(into, far - near),
      times(along, right - left),
      setting.room,
      'fabric',
      SHADE,
    );
  return shown([
    strip([0, 0.13], [-0.016, -0.003]),
    strip([0, 0.13], [0.003, 0.016]),
    strip([0.13, 0.235], [-0.022, 0.022]),
    strip([0.245, 0.29], [-0.013, 0.013]),
    strip([0.12, 0.22], [-0.036, -0.026]),
    strip([lerp(0.12, 0.2, raised), 0.22], [0.026, 0.036]),
    ...(raised > 0
      ? [strip([0.2, 0.215], [0.022, 0.022 + 0.09 * raised])]
      : []),
  ]);
};

const FLESH = 0xb8_a8_9a;
/** A finger's thickness, and the gap to the next, in room sides. */
const FINGER = 0.0045;
const KNUCKLE = 0.0015;
/** Where across a corner's pillar the fingers lie, from the room's corner. */
const GRIP: readonly [number, number] = [0.014, 0.034];
/** The floor from which the hand has too many fingers, each too long. */
const WRONG_HAND = 30;

/**
 * Fingers round the pillar of a doorway, from the far side: they creep in,
 * hold, and are drawn back out of sight.
 */
export const hand: Act = (staging: Staging) => {
  const { setting, n, age, lastsFor, chance } = staging;
  const side = sideAt(openSides(setting), chance('side'));
  if (side === null) return NOTHING;
  const { along, into } = SIDE_FRAMES[side];
  const wrong = n >= WRONG_HAND;
  const fingers = wrong ? 6 : 4;
  const long = wrong ? 0.03 : 0.018;
  const high = 0.2 + 0.1 * chance('spot');
  const [near, far] = GRIP;
  const from = chance('way') < 0.5 ? near : 1 - far;
  const goes = lastsFor - 1.5;
  const quads = Array.from({ length: fingers }, (_, index) => {
    const creeps = smooth(ramp(age, 0.15 * index, 1.2 + 0.15 * index));
    const twitch = 0.0015 * Math.sin(age * 5 + index);
    const reach =
      (long * (0.85 + 0.15 * chance('raise', index)) + twitch) *
      creeps *
      (1 - smooth(ramp(age, goes, goes + 0.5)));
    return reach > 0.0005
      ? box(
          spot(side, from, high + index * (FINGER + KNUCKLE), 0),
          [times(along, far - near), [0, FINGER, 0], times(into, reach)],
          setting.room,
          'skin',
          FLESH,
        )
      : [];
  }).flat();
  return shown(
    quads,
    sounding(staging, 'scrape', spot(side, from, high, 0), 0.15, [goes, 0.5]),
  );
};
