import assert from 'node:assert/strict';

import type { Pose, Walls } from '@/cube/entities/world';

import { FIRST_LOOK } from './look';
import { type Holed, play, type Player, standingAt } from './play';
import { EYE_HEIGHT, type Input, STILL } from './step';

export const FRAME = 1 / 60;
export const NEAR = 1e-9;

export const allOpen: Walls = {
  isOpenEast: () => true,
  isOpenSouth: () => true,
};

/** Floor 3's room (1, 2), its hole in the north-west quarter. */
export const room = { n: 3, x: 1n, y: 2n };

/** That room's hole and wall lever, pulled with floor 1's look. */
export const holed: Holed = {
  quarter: { qx: 0, qy: 0 },
  lever: { mount: 'x-wall', at: { u: 0, v: 0.25 }, facing: { u: 1, v: 0 } },
  shrinkLook: FIRST_LOOK,
};

/** A whole body beside the hole, between it and the lever, looking at the lever. */
export const beside = (over: Partial<Pose> = {}): Player =>
  standingAt({
    ...room,
    u: 0.12,
    v: 0.25,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: Math.PI,
    elevation: 0.1,
    ...over,
  });

export const pull: Input = { ...STILL, pull: true };

/**
 * Every frame from `start` under `first` and then `held`, in the holed room,
 * up to and including the first frame `until` passes.
 */
export function frames(
  start: Player,
  first: Input,
  held: Input,
  until: (player: Player) => boolean,
  here: Holed | null = holed,
): Player[] {
  const out = [play(start, first, FRAME, allOpen, here)];
  for (;;) {
    const last = out.at(-1);
    assert.ok(last);
    if (until(last)) return out;
    assert.ok(out.length < 2000, 'never got there');
    out.push(play(last, held, FRAME, allOpen, here));
  }
}

/** A pull from beside the hole, played until the body is let go, small. */
export const shrunk = (look = FIRST_LOOK): Player[] =>
  frames(beside(), pull, STILL, ({ act }) => act === null, {
    ...holed,
    shrinkLook: look,
  });

/** The small body a pull leaves, turned east, towards the hole. */
export function small(): Player {
  const last = shrunk().at(-1);
  assert.ok(last);
  return { ...last, pose: { ...last.pose, yaw: 0 } };
}

export const ahead: Input = { ...STILL, walk: 1 };
