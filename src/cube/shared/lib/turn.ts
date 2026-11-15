/** `angle` as the same turn in `[-π, π]`: the short way round. */
export const shortTurn = (angle: number): number =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

const TURN = 2 * Math.PI;

/** `angle` as the same turn in `[0, 2π)`: the way round from zero. */
export const positiveTurn = (angle: number): number =>
  ((angle % TURN) + TURN) % TURN;

/** `to` as the yaw nearest `from` that looks the same way. */
export const nearestTurn = (from: number, to: number): number =>
  from + shortTurn(to - from);
