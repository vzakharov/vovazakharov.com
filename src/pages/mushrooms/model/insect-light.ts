/**
 * How an insect keeps the sun's light as it turns: its lit parts are painted
 * in its own frame and turned with it, so they are painted afresh for its
 * new turn whenever it has turned `LIGHT_STEP` past the one they show, and
 * stay at most that far off the sun in between.
 */

import { type Point, wrap } from './geometry';

/** How far a body turns before its lit parts are painted afresh, in radians. */
export const LIGHT_STEP = Math.PI / 8;

/**
 * The turn a body's lit parts show once it stands at `turn`, having shown
 * `painted`: the same while it is within `LIGHT_STEP` of it, `turn` past.
 */
export function litTurn(painted: number, turn: number): number {
  return Math.abs(wrap(turn - painted)) > LIGHT_STEP ? turn : painted;
}

/**
 * Where a shine sits on an oval `rx` by `ry` about its middle, `share` of
 * the way out along its radius toward `toward`, the light in the body's own
 * frame; a share under 0 goes the other way, for a glint thrown back off
 * the far side.
 */
export function litCrest(
  toward: Point,
  [rx, ry]: readonly [number, number],
  share: number,
): Point {
  return { x: toward.x * rx * share, y: toward.y * ry * share };
}
