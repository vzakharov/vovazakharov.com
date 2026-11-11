/** A room of floor `n`, by its BigInt index: `x` east, `y` south. */
export type Room = {
  n: number;
  x: bigint;
  y: bigint;
};

/** A key naming one room, for sets and maps of rooms. */
export const roomKey = ({ n, x, y }: Room): string => `${n}/${x}/${y}`;
