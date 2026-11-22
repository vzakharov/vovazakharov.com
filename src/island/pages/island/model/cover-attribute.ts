/**
 * The land geometry's float attribute holding forest cover per vertex: the
 * share of ground under tree crowns, 0 bare to 1 closed canopy (`forestCover`).
 */
export const COVER_ATTRIBUTE = 'cover';

/**
 * The land geometry's float attribute holding the share of sand in the ground
 * per vertex, 0 to 1 (`sandAt`): 1 on the beach and the dune belt.
 */
export const SAND_ATTRIBUTE = 'sand';

/**
 * The land geometry's float attribute holding the share of bare shore rock in
 * the ground per vertex, 0 to 1 (`rockAt`): 1 at the water of a rough stretch
 * of coast and on its skerries, 0 on a calm stretch and inland.
 */
export const ROCKY_ATTRIBUTE = 'rocky';
