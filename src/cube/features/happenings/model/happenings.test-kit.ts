import assert from 'node:assert/strict';

import { CEILING_HEIGHT } from '@/cube/shared/lib/room-shape';
import type { Sides } from '@/cube/shared/lib/sides';
import { type Quad, type Setting, WALL_HALF } from '@/cube/entities/world';

import { ACTS } from './happening';
import { HAPPENING_KINDS, type HappeningKind, lastsOf } from './kinds';
import { chancesOf } from './schedule';
import type { Happening } from './staging';

/** A room with a wall, a doorway and a closed corner: every kind fits it. */
export const MIXED: Sides = [true, true, false, false];
export const SHUT: Sides = [true, true, true, true];
export const OPEN: Sides = [false, false, false, false];

export const settingOf = (
  grain: number,
  closed: Sides = MIXED,
  hole: Setting['hole'] = null,
): Setting => ({ room: { n: 7, x: 3n, y: 5n }, closed, hole, grain });

const SLACK = 1e-9;

/** The least and the most a coordinate may be on a side, shut or open. */
const least = (shut: boolean) => (shut ? WALL_HALF : 0) - SLACK;
const most = (shut: boolean) => 1 - (shut ? WALL_HALF : 0) + SLACK;

/** Fails unless every corner of `quads` is inside `setting`'s room. */
export function assertInRoom(
  { closed, room }: Setting,
  quads: readonly Quad[],
  what: string,
): void {
  const [east, south, west, north] = closed;
  for (const quad of quads) {
    assert.equal(quad.room, room, `${what}: a quad of another room`);
    for (const [x, y, z] of quad.corners) {
      assert.ok(
        x >= least(west) && x <= most(east),
        `${what}: x = ${x} is outside the room`,
      );
      assert.ok(
        y >= -SLACK && y <= CEILING_HEIGHT + SLACK,
        `${what}: y = ${y} is outside the room`,
      );
      assert.ok(
        z >= least(north) && z <= most(south),
        `${what}: z = ${z} is outside the room`,
      );
    }
    assert.ok(
      Math.abs(Math.hypot(...quad.normal) - 1) < 1e-6,
      `${what}: a normal that is not of length 1`,
    );
  }
}

/** A second since the epoch for an act under test to have begun at. */
export const BEGAN = 1_700_000_000;

/** The chances `kind` draws in `beat`, and how long they make it last. */
function runOf(kind: HappeningKind, setting: Setting, n: number, beat: number) {
  const chance = chancesOf(setting, n, HAPPENING_KINDS[kind].pace, beat);
  return { chance, lastsFor: lastsOf(kind, chance('lasts')) };
}

/**
 * `kind` played in `setting`'s room on floor `n` with the chances of `beat`,
 * `seconds` into its run — or, under zero, that long before its end.
 */
export function playedAt(
  kind: HappeningKind,
  setting: Setting,
  n: number,
  seconds: number,
  beat = 0,
): Happening {
  const { chance, lastsFor } = runOf(kind, setting, n, beat);
  return ACTS[kind]({
    setting,
    n,
    sinceEpoch: BEGAN,
    lastsFor,
    age: seconds < 0 ? lastsFor + seconds : seconds,
    chance,
  });
}

/** `playedAt`, `share` of the way through the act's run. */
export function played(
  kind: HappeningKind,
  setting: Setting,
  n: number,
  share: number,
  beat = 0,
): Happening {
  const { lastsFor } = runOf(kind, setting, n, beat);
  return playedAt(kind, setting, n, share * lastsFor, beat);
}
