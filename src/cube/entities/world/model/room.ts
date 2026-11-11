/** A room's place on its floor's grid, by BigInt index: `x` east, `y` south. */
export type Cell = { x: bigint; y: bigint };

/** The floor a thing is on, counting down from 1 at the top. */
export type Floored = { n: number };

/** A room of floor `n`. */
export type Room = Cell & Floored;

/** A key naming one room, for sets and maps of rooms. */
export const roomKey = ({ n, x, y }: Room): string => `${n}/${x}/${y}`;
