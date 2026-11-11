/**
 * What a room tells the faces in it, packed into one word: which of its four
 * sides are closed walls, in the world's step order (east, south, west,
 * north); whether its own lamps work; and how many of the rooms it opens onto
 * are lit, whose light spills in.
 */
export type RoomState = {
  closed: readonly [boolean, boolean, boolean, boolean];
  lit: boolean;
  /** 0 to 4. */
  litBeside: number;
};

const LIT_BIT = 4;
const BESIDE_SHIFT = 5;

export function roomFlags({ closed, lit, litBeside }: RoomState): number {
  const walls = closed.reduce(
    (bits, isClosed, side) => bits | (isClosed ? 1 << side : 0),
    0,
  );
  return walls | (lit ? 1 << LIT_BIT : 0) | (litBeside << BESIDE_SHIFT);
}

/** The flag readers a floor's WGSL calls, over the same bits. */
export const FLAGS_WGSL = /* wgsl */ `
/// Whether the room's side \`side\` (0 east, 1 south, 2 west, 3 north) is a closed wall.
fn closedAt(s: Surf, side: u32) -> bool {
  return (s.flags & (1u << side)) != 0u;
}

/// 1 where the room's own lamps work, 0 where they have failed.
fn litOf(s: Surf) -> f32 {
  return f32((s.flags >> ${String(LIT_BIT)}u) & 1u);
}

/// The share of the room's four sides that open onto a lit room.
fn spillOf(s: Surf) -> f32 {
  return f32((s.flags >> ${String(BESIDE_SHIFT)}u) & 7u) / 4.0;
}
`;
