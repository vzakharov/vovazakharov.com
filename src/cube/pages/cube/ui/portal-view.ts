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
  ticksFrom,
  wayThrough,
} from '@/cube/entities/world';

import { poseIn } from '../lib/eye-room';
import { floorsIn, type Scenery } from '../lib/mesh';
import { doorwayOpening, seenBeyond } from '../lib/portal-frame';
import { build, type Building, type Mesh } from './cube-mesh';
import type { Through } from './portal-pass';
import type { Renderer } from './renderer';

/** What the rooms through a portal door are built by and uploaded to. */
type Showing = Building & {
  /** The renderer, null before it is made and once it is disposed. */
  renderer: () => Renderer | null;
};

/** One frame's door and the eye that may see through it, at the frame's instant. */
type Glance = Seen & {
  /** The shared clock, in ms since the epoch: its tick picks where a hub leads. */
  epochMs: number;
  /** The door the body holds open, if any. */
  door: Ajar | null;
  /** The door's leaf as the frame draws it. */
  leaf: readonly Quad[];
  /** The eye, and the mesh drawn with the pose it was built for. */
  at: Pose;
  frame: Pose;
  mesh: Mesh;
};

export type PortalView = {
  /**
   * What `glance`'s door shows, null where it is no open portal or the rooms
   * it leads to this instant are not built yet — never rooms it led to
   * before. Builds, ahead of the clock, the rooms it leads to over the
   * coming cycle of ticks.
   */
  through: (glance: Glance) => Through | null;
  /** Resolves once every build asked for so far is done, or failed. */
  settled: () => Promise<void>;
};

/** How many ticks ahead of the clock the rooms through a door are built. */
const AHEAD = 11;

/** The most built rooms kept, oldest dropped first: two cycles' worth. */
const KEPT = 2 * AHEAD + 2;

const wayKey = ({ isEast, toward, ...room }: Facing): string =>
  `${roomKey(room)}${isEast ? 'e' : 's'}${String(toward)}`;

const keyOf = (way: Facing, far: Facing): string =>
  `${wayKey(way)}>${wayKey(far)}`;

export function createPortalView({
  copy,
  bought,
  onError,
  renderer,
}: Showing): PortalView {
  /** Rooms built and prepared, by the way into them and the way out past them. */
  const built = new Map<string, Scenery>();
  /** Every build ever queued, so a failed one is not tried again each tick. */
  const queued = new Set<string>();
  /** The rooms uploaded to the renderer, by key. */
  let uploaded: string | null = null;
  /** The way and tick last looked ahead from, so a frame looks once a tick. */
  let looked: string | null = null;
  let pending = Promise.resolve();

  const make = async (key: string, way: Facing, far: Facing): Promise<void> => {
    const frame = poseIn(roomBeyond(far));
    const mesh = await build(frame, copy, bought(), null, far);
    const rooms = mesh.faces(null);
    // The far floor's own shader too, which the eye sees through on arrival.
    await Promise.all([
      renderer()?.prepare(floorsIn([rooms]), way.n),
      renderer()?.prepare([far.n]),
    ]);
    built.set(key, rooms);
    for (const old of built.keys()) {
      if (built.size <= KEPT) break;
      if (old !== uploaded) built.delete(old);
    }
  };

  /** Queues, in tick order, the rooms `way` leads to over the coming ticks. */
  const lookAhead = (way: Facing, epochMs: number): void => {
    const ticks = ticksFrom(epochMs);
    const now = ticks.next().value;
    const at = `${wayKey(way)}@${String(now.cycle)}/${String(now.tick)}`;
    if (looked === at) return;
    looked = at;
    for (let i = 0, tick = now; i < AHEAD; i += 1, tick = ticks.next().value) {
      const far = farSideOf(way, tick.startMs);
      if (far === null) continue;
      const key = keyOf(way, far);
      if (queued.has(key)) continue;
      queued.add(key);
      pending = pending.then(async () => make(key, way, far)).catch(onError);
    }
  };

  return {
    through: ({ door, leaf, at, frame, mesh, epochMs, ...seen }) => {
      if (door?.n !== frame.n) return null;
      const way = wayThrough(door, at);
      const far = farSideOf(way, epochMs);
      if (far === null) return null;
      lookAhead(way, epochMs);
      const key = keyOf(way, far);
      const rooms = built.get(key);
      if (rooms === undefined) return null;
      if (uploaded !== key) {
        renderer()?.uploadBeyond(rooms, way.n);
        uploaded = key;
      }
      const placing = beyondOf(frame, way, far);
      return {
        seen: seenBeyond(placing, seen),
        opening: doorwayOpening(placing.to, way),
        door: mesh.stood([...doorFrame(door), ...leaf]),
      };
    },
    settled: async () => pending,
  };
}
