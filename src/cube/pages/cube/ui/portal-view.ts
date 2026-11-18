import type { Seen } from '@/cube/shared/lib/vec';
import {
  type Ajar,
  beyondOf,
  cycleFrom,
  doorFrame,
  type Facing,
  farSideOf,
  type Pose,
  type Quad,
  roomBeyond,
  roomKey,
  type Tick,
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

/** The most built rooms kept, oldest dropped first: two cycles' worth. */
const KEPT = 2 * cycleFrom(0).length + 2;

const holdOf = ({ startMs, endMs }: Tick): number => endMs - startMs;

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
  /** Builds queued and not yet done, by key: when the last tick wanting each ends. */
  const due = new Map<string, number>();
  /** Builds that failed, so one is reported once rather than every tick. */
  const failed = new Set<string>();
  /** The rooms uploaded to the renderer, by key. */
  let uploaded: string | null = null;
  /** The way and tick last looked ahead from, so a frame looks once a tick. */
  let looked: string | null = null;
  /** The instant of the frame last seen, which a build whose ticks have passed is skipped by. */
  let clock = 0;
  let pending = Promise.resolve();

  const make = async (key: string, way: Facing, far: Facing): Promise<void> => {
    if ((due.get(key) ?? 0) <= clock) {
      due.delete(key);
      return;
    }
    try {
      const frame = poseIn(roomBeyond(far));
      const mesh = await build(frame, copy, bought(), null, far);
      const rooms = mesh.faces(null);
      // The far floor's own shader too, which the eye sees through on arrival.
      await Promise.all([
        renderer()?.prepare(floorsIn([rooms]), way.n),
        renderer()?.prepare([far.n]),
      ]);
      built.set(key, rooms);
    } catch (error) {
      failed.add(key);
      throw error;
    } finally {
      due.delete(key);
    }
    for (const old of built.keys()) {
      if (built.size <= KEPT) break;
      if (old !== uploaded) built.delete(old);
    }
  };

  /**
   * Queues the rooms `way` leads to over the coming cycle of ticks, the
   * longest tick's first: the one a player can aim for, should builds fall
   * behind the flicker.
   */
  const lookAhead = (way: Facing, epochMs: number): void => {
    const ticks = cycleFrom(epochMs);
    const [now] = ticks;
    const at = `${wayKey(way)}@${String(now?.cycle)}/${String(now?.tick)}`;
    if (looked === at) return;
    looked = at;
    for (const tick of ticks.toSorted((a, b) => holdOf(b) - holdOf(a))) {
      const far = farSideOf(way, tick.startMs);
      if (far === null) continue;
      const key = keyOf(way, far);
      if (built.has(key) || failed.has(key)) continue;
      const until = due.get(key);
      due.set(key, Math.max(until ?? 0, tick.endMs));
      if (until !== undefined) continue;
      pending = pending.then(async () => make(key, way, far)).catch(onError);
    }
  };

  return {
    through: ({ door, leaf, at, frame, mesh, epochMs, ...seen }) => {
      if (door?.n !== frame.n) return null;
      const way = wayThrough(door, at);
      const far = farSideOf(way, epochMs);
      if (far === null) return null;
      clock = epochMs;
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
