import type { WithOnError } from '@/kernel/shared/typings';

import type { Seen } from '@/cube/shared/lib/vec';
import {
  type Ajar,
  beyondOf,
  doorFrame,
  type Facing,
  farSideOf,
  type Pose,
  type Quad,
  roomBeyond,
  roomKey,
  wayThrough,
} from '@/cube/entities/world';

import { poseIn } from '../lib/eye-room';
import { floorsIn } from '../lib/mesh';
import { doorwayOpening, seenBeyond } from '../lib/portal-frame';
import { build, type Mesh, type Selling } from './cube-mesh';
import type { Through } from './portal-pass';
import type { Renderer } from './renderer';

/** What the rooms through a portal door are built by and uploaded to. */
type Showing = Selling &
  WithOnError & {
    /** The renderer, null before it is made and once it is disposed. */
    renderer: () => Renderer | null;
  };

/** One frame's door and the eye that may see through it. */
type Glance = Seen & {
  /** The door the body holds open, if any. */
  door: Ajar | null;
  /** The door's leaf as the frame draws it. */
  leaf: readonly Quad[];
  /** The eye, and the mesh drawn with the pose it was built for. */
  at: Pose;
  frame: Pose;
  mesh: Mesh;
  /** The frame's instant, in milliseconds since the epoch. */
  now: number;
};

export type PortalView = {
  /**
   * What `glance`'s door shows, null where it is no open portal or its rooms
   * are not built yet. Builds them the first time they are asked for, and
   * again once the door leads elsewhere, showing where it led until then.
   */
  through: (glance: Glance) => Through | null;
  /** Resolves once the rooms last asked for are built and uploaded, or failed to be. */
  settled: () => Promise<void>;
};

const wayKey = ({ isEast, toward, ...room }: Facing): string =>
  `${roomKey(room)}${isEast ? 'e' : 's'}${String(toward)}`;

export function createPortalView({
  copy,
  bought,
  onError,
  renderer,
}: Showing): PortalView {
  /** The rooms uploaded: the way into them, and the way out they are built past. */
  let shown: { key: string; way: Facing; far: Facing } | null = null;
  let building: string | null = null;
  let pending = Promise.resolve();

  const show = async (key: string, way: Facing, far: Facing): Promise<void> => {
    const frame = poseIn(roomBeyond(far));
    const mesh = await build(frame, copy, bought(), null, far);
    const rooms = mesh.faces(null);
    // The far floor's own shader too, which the eye sees through on arrival.
    await Promise.all([
      renderer()?.prepare(floorsIn([rooms]), way.n),
      renderer()?.prepare([far.n]),
    ]);
    if (building !== key) return;
    renderer()?.uploadBeyond(rooms, way.n);
    shown = { key, way, far };
  };

  return {
    through: ({ door, leaf, at, frame, mesh, now, ...seen }) => {
      if (door?.n !== frame.n) return null;
      const way = wayThrough(door, at);
      const far = farSideOf(way, now);
      if (far === null) return null;
      const key = `${wayKey(way)}>${wayKey(far)}`;
      if (shown?.key !== key && building !== key) {
        building = key;
        pending = show(key, way, far).catch(onError);
      }
      if (shown === null || wayKey(shown.way) !== wayKey(way)) return null;
      const placing = beyondOf(frame, way, shown.far);
      return {
        seen: seenBeyond(placing, seen),
        opening: doorwayOpening(placing.to, way),
        door: mesh.stood([...doorFrame(door), ...leaf]),
      };
    },
    settled: async () => pending,
  };
}
