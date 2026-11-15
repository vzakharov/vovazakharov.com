import type { Vec3 } from '@/cube/entities/world';

/**
 * A quarter turn about the upright through `[about, about]`, `side` times:
 * what is by a room's east wall goes to its south, west or north one, in the
 * world's step order. `about` 0.5 turns a place in the room, 0 a direction.
 */
export const spun =
  (side: number, about: number) =>
  ([x, y, z]: Vec3): Vec3 => {
    const [dx, dz] = [x - about, z - about];
    if (side === 0) return [x, y, z];
    if (side === 1) return [about - dz, y, about + dx];
    if (side === 2) return [about - dx, y, about - dz];
    return [about + dz, y, about - dx];
  };
