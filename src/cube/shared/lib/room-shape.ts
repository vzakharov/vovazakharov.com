/** A room's height from its slab to the slab over it, in its own side. */
export const ROOM_HEIGHT = 0.5;

/** How thick the slab over a room is, in the room's side. */
export const SLAB_THICK = 0.04;

/** A room's ceiling over its floor, in its own side: the slab's underside. */
export const CEILING_HEIGHT = ROOM_HEIGHT - SLAB_THICK;

/**
 * Half a wall's thickness, in its room's side: a wall is 12 cm through on
 * floor 1. A closed side's face stands this far in from the room's edge, and
 * so does whatever hangs on it.
 */
export const WALL_HALF = 0.012;

/** The side of a room, in metres, to a visitor of its own floor's size. */
export const ROOM_METRES = 5;
