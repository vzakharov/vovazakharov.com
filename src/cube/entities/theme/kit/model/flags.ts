import type { Sides, Walled } from '@/cube/shared/lib/sides';

/**
 * What a room tells the faces in it, packed into one word, so a point is lit
 * by the rooms around its own as well and the light is the same from either
 * side of an open edge. Sides go east, south, west, north; corner `c` lies
 * between side `c` and side `c + 1`, so south-east comes first.
 */
export type RoomState = Walled & {
  lampsOn: boolean;
  /** Which sides open onto a room whose lamps work. */
  litBeside: Sides;
  /** Which corners have, across them, a room light can come from whose lamps work. */
  litAcross: Sides;
  /**
   * The two ways light crosses each corner: whether it is open by way of the
   * room through side `c`, then by way of the room through side `c + 1`.
   */
  waysAcross: readonly [Sides, Sides];
  /**
   * The walls that end on the room's corners: whether the room through side
   * `s + 1` has its own side `s` closed, then the room through side `s + 3`.
   */
  wallsBeside: readonly [Sides, Sides];
};

const LIT_BIT = 4;
const BESIDE_SHIFT = 5;
const ACROSS_SHIFT = 9;
const WAYS_SHIFT = 13;
const WALLS_SHIFT = 21;

const bitsOf = (sides: Sides): number =>
  sides.reduce((bits, holds, side) => bits | (holds ? 1 << side : 0), 0);

export function roomFlags({
  closed,
  lampsOn,
  litBeside,
  litAcross,
  waysAcross: [wayFirst, waySecond],
  wallsBeside: [wallsNext, wallsBefore],
}: RoomState): number {
  return (
    (bitsOf(closed) |
      (lampsOn ? 1 << LIT_BIT : 0) |
      (bitsOf(litBeside) << BESIDE_SHIFT) |
      (bitsOf(litAcross) << ACROSS_SHIFT) |
      (bitsOf(wayFirst) << WAYS_SHIFT) |
      (bitsOf(waySecond) << (WAYS_SHIFT + 4)) |
      (bitsOf(wallsNext) << WALLS_SHIFT) |
      (bitsOf(wallsBefore) << (WALLS_SHIFT + 4))) >>>
    0
  );
}

/** The flag readers a floor's WGSL calls, over the same bits. */
export const FLAGS_WGSL = /* wgsl */ `
fn flagAt(s: Surf, bit: u32) -> bool {
  return ((s.flags >> bit) & 1u) != 0u;
}

/// Whether the room's side \`side\` (0 east, 1 south, 2 west, 3 north) is a closed wall.
fn closedAt(s: Surf, side: u32) -> bool {
  return flagAt(s, side);
}

/// 1 where the room's own lamps work, 0 where they have failed.
fn litOf(s: Surf) -> f32 {
  return f32(flagAt(s, ${String(LIT_BIT)}u));
}

/// Whether the room's side \`side\` opens onto a room whose lamps work.
fn litBeside(s: Surf, side: u32) -> bool {
  return flagAt(s, ${String(BESIDE_SHIFT)}u + side);
}

/// Whether the room across corner \`corner\` (0 south-east, 1 south-west,
/// 2 north-west, 3 north-east) has working lamps and a way for their light.
fn litAcross(s: Surf, corner: u32) -> bool {
  return flagAt(s, ${String(ACROSS_SHIFT)}u + corner);
}

/// Whether light crosses corner \`corner\` by way of the room through side
/// \`corner\` (\`first\`), or of the one through the side after it.
fn wayAcross(s: Surf, corner: u32, first: bool) -> bool {
  return flagAt(s, ${String(WAYS_SHIFT)}u + corner + select(4u, 0u, first));
}

/// Whether a wall along the line of side \`side\` ends on the room's corner
/// from outside: the room through the side after \`side\` (\`next\`), or
/// through the one before it, has its own side \`side\` closed.
fn wallBeside(s: Surf, side: u32, next: bool) -> bool {
  return flagAt(s, ${String(WALLS_SHIFT)}u + side + select(4u, 0u, next));
}
`;
