/** A room of some floor, by its BigInt index: `x` east, `y` south. */
export type Room = { x: bigint; y: bigint };

/** The floor a thing is on, counting down from 1 at the top. */
export type Floored = { n: number };

/** A room of floor `n`. */
export type FloorRoom = Room & Floored;

/** A key naming one room, for sets and maps of rooms. */
export const roomKey = ({ n, x, y }: FloorRoom): string => `${n}/${x}/${y}`;
