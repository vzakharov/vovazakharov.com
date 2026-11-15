import { type DoorWall, isSameWall } from './wall-frame';

/**
 * A stand-in for the portal model, with its shape: which walls are portals,
 * and where each leads at an instant. One hub on floor 6 leads three floors
 * down to one of two spokes, the other each minute; both spokes lead back to
 * it. `portal.ts` is its only reader.
 */
const HUB: DoorWall = { n: 6, x: 2n, y: 0n, isEast: true };

/** One spoke in a wall running as the hub's does, one in a wall across it. */
const STUB_SPOKES: readonly [DoorWall, DoorWall] = [
  { n: 9, x: 1n, y: 0n, isEast: true },
  { n: 9, x: 0n, y: 0n, isEast: false },
];

/** Milliseconds a hub leads to one spoke for. */
const STUB_PERIOD = 60_000;

/** The portal standing in `wall`, or null. */
export const portalAt = (wall: DoorWall): DoorWall | null =>
  [HUB, ...STUB_SPOKES].find((portal) => isSameWall(portal, wall)) ?? null;

/** The wall `portal` leads to at `epochMs`, a portal's too. */
export const portalTarget = (portal: DoorWall, epochMs: number): DoorWall =>
  isSameWall(portal, HUB)
    ? STUB_SPOKES[Math.floor(epochMs / STUB_PERIOD) % 2 === 0 ? 0 : 1]
    : HUB;
