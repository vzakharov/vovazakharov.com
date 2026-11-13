/** `angle` as the same turn in `[-π, π]`: the short way round. */
export const shortTurn = (angle: number): number =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

/** `to` as the yaw nearest `from` that looks the same way. */
export const nearestTurn = (from: number, to: number): number =>
  from + shortTurn(to - from);
