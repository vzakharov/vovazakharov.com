import type { Clock } from '@/cube/shared/lib/clock';
import type { InRoomOf, Quad } from '@/cube/entities/world';
import { happening, type RoomSound } from '@/cube/features/happenings';

import type { Mesh } from './cube-mesh';

/** A sound a room in view is making, and the room, in whose frame it is. */
export type Heard = RoomSound & InRoomOf;

/**
 * What goes on by itself in `mesh`'s rooms at `clock`: the quads of that
 * instant, each in its room's frame, and the sounds.
 */
export function goingOn(
  { settings }: Mesh,
  clock: Clock,
): { quads: Quad[]; heard: Heard[] } {
  const quads: Quad[] = [];
  const heard: Heard[] = [];
  for (const setting of settings) {
    const { room } = setting;
    const now = happening(setting, room.n, clock);
    quads.push(...now.quads);
    for (const sound of now.sounds) heard.push({ ...sound, room });
  }
  return { quads, heard };
}
