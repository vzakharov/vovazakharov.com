import type { Vec3 } from '@/cube/entities/world';

import { pick } from '../lib/ease';
import { inLane, onSide, openSides, shutSides } from '../lib/side';
import { added, block, heading, type Made } from '../lib/solid';
import { type Act, heard, NOTHING, shown, sounding } from './staging';

const PHONE_PAINTS = [0x8a_1f_1a, 0xc8_c0_a8, 0x12_12_14] as const;

/** A ring and the pause after it, and how much of that is ringing, in seconds. */
const RING = { every: 3, long: 1.3 } as const;
/** How long before the act's end the phone gives up. */
const GIVEN_UP = 2;

/**
 * A telephone on the floor of an empty room, ringing; nobody answers, and it
 * stops.
 */
export const phone: Act = (staging) => {
  const { setting, age, lastsFor, chance } = staging;
  const made: Made = {
    stuff: 'plastic',
    tint: pick(PHONE_PAINTS, chance('paint')),
  };
  const at: Vec3 = [inLane(chance('u')), 0, inLane(chance('v'))];
  const turn = heading(2 * Math.PI * chance('yaw'));
  const rings = Math.floor((lastsFor - GIVEN_UP) / RING.every);
  const ringing = age % RING.every < RING.long && age < rings * RING.every;
  const jolt = ringing ? 0.0015 * Math.sin(age * 60) : 0;
  return shown(
    [
      ...block(
        setting.room,
        added(at, [0, 0.006, 0]),
        [0.04, 0.012, 0.03],
        turn,
        made,
      ),
      ...block(
        setting.room,
        added(at, [jolt, 0.017 + Math.abs(jolt), 0]),
        [0.012, 0.008, 0.045],
        turn,
        made,
      ),
    ],
    Array.from({ length: rings }, (_, ring) =>
      sounding(staging, 'ring', at, 0.7, [ring * RING.every, RING.long]),
    ).flat(),
  );
};

/** The floor from which a knock comes more often than a hand would knock. */
const INSISTENT = 20;

/** Knocking from inside a wall. */
export const knock: Act = (staging) => {
  const { setting, n, chance } = staging;
  const [first, ...rest] = shutSides(setting);
  if (first === undefined) return NOTHING;
  const source = onSide(
    setting,
    pick([first, ...rest], chance('side')),
    0.15 + 0.7 * chance('spot'),
    0.22,
    0,
  );
  const knocks = n >= INSISTENT ? 7 : 3;
  return heard(
    Array.from({ length: knocks }, (_, index) =>
      sounding(staging, 'knock', source, 0.5, [index * 0.45, 0.3]),
    ).flat(),
  );
};

/** Steps going away through a doorway, nobody making them. */
export const footsteps: Act = (staging) => {
  const { setting, lastsFor, chance } = staging;
  const [first, ...rest] = openSides(setting);
  if (first === undefined) return NOTHING;
  return heard(
    sounding(
      staging,
      'steps',
      onSide(setting, pick([first, ...rest], chance('side')), 0.5, 0, 0.05),
      0.5,
      [0, lastsFor],
    ),
  );
};
