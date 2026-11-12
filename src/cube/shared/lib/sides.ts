/** One answer for each of a room's sides, in the world's step order. */
export type Sides = readonly [
  east: boolean,
  south: boolean,
  west: boolean,
  north: boolean,
];

/** A room that knows which of its sides are closed walls. */
export type Walled = { closed: Sides };
