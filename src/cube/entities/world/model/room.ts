/** A room's place on its floor's grid, by BigInt index: `x` east, `y` south. */
export type Cell = { x: bigint; y: bigint };

/** The floor a thing is on, counting down from 1 at the top. */
export type Floored = { n: number };

/** A room of floor `n`. */
export type Room = Cell & Floored;

/** A thing of one room: a pill taken in it, a sign hung in it. */
export type InRoomOf = { room: Room };

/** How many rooms floor `n` has along each side. */
export const roomsAcross = (n: number): bigint => 1n << BigInt(n - 1);

/** Whether `(x, y)` is a room of floor `n`. */
export const isRoom = (n: number, x: bigint, y: bigint): boolean => {
  const rooms = roomsAcross(n);
  return x >= 0n && y >= 0n && x < rooms && y < rooms;
};

/** A key naming one room, for sets and maps of rooms. */
export const roomKey = ({ n, x, y }: Room): string => `${n}/${x}/${y}`;
