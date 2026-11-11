import type { Sides, Walled } from '@/cube/shared/lib/sides';

/**
 * What a room tells the faces in it, packed into one word: which of its four
 * sides are closed walls; whether its own lamps work; and which of its sides
 * open onto a lit room, whose light comes in through them.
 */
export type RoomState = Walled & {
  lampsOn: boolean;
  litBeside: Sides;
};

const LIT_BIT = 4;
const BESIDE_SHIFT = 5;

const bitsOf = (sides: Sides): number =>
  sides.reduce((bits, holds, side) => bits | (holds ? 1 << side : 0), 0);

export function roomFlags({ closed, lampsOn, litBeside }: RoomState): number {
  return (
    bitsOf(closed) |
    (lampsOn ? 1 << LIT_BIT : 0) |
    (bitsOf(litBeside) << BESIDE_SHIFT)
  );
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

/// Whether the room's side \`side\` opens onto a lit room.
fn litBeside(s: Surf, side: u32) -> bool {
  return (s.flags & (${String(1 << BESIDE_SHIFT)}u << side)) != 0u;
}
`;
