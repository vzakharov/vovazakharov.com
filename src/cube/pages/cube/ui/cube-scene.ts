import { asError } from '@/kernel/shared/lib/error-class';
import type { WithOnError } from '@/kernel/shared/typings';

import { type Clock, clockAt } from '@/cube/shared/lib/clock';
import { type OutdoorState, toCube } from '@/cube/shared/outside';
import { themeOf } from '@/cube/entities/theme';
import {
  descend,
  eyeInFrame,
  type InRoomOf,
  type Outside,
  type Pose,
  type Posed,
  type Quad,
  roomKey,
  type Whereabouts,
} from '@/cube/entities/world';
import { happening, type RoomSound } from '@/cube/features/happenings';

import {
  gazeInCube,
  OUTSIDE_FAR,
  seenInWorld,
  viewProjection,
} from '../lib/camera';
import type { Scenery } from '../lib/mesh';
import { OUTSIDE_LENS, type OutsideLens } from '../lib/outside-lens';
import { between } from '../lib/palette';
import type { ScenePlay } from '../lib/play';
import { shaderOf } from '../lib/shader';
import { build, type Mesh, type Selling, type SignOf } from './cube-mesh';
import { createRenderer, type Drawing, type Renderer } from './renderer';

/**
 * What one frame draws: the eye's pose, the pill taken, if any, and
 * `moving`, what is in the rooms for this frame alone, each quad in its own
 * room's frame. An eye outside the cube is `outside`, its pose then kept for
 * its return, and sees through `lens`, `OUTSIDE_LENS` where none is given.
 * An eye on floor 1 given a `lens` sees through it too, in its floor's
 * place: the eye getting used to the doorway's light. The ladder stands at
 * the doorway until `ladderGone` is true, and `body` casts a shadow.
 */
type Frame = Posed &
  Partial<OutsideEye> &
  OutdoorState & {
    taken: InRoomOf | null;
    moving: readonly Quad[];
  };

/**
 * The room an outside eye's frame is built in: floor 1's, whose sides are the
 * cube frame's units.
 */
const FIRST_ROOM: Pose = {
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  yaw: 0,
  elevation: 0,
  scale: 1,
  eyeAbove: 0,
};

/**
 * Moves the eye one frame on: the pose it was at, the seconds since the last
 * frame and the signs around it in, the frame to draw out. Whatever moves the
 * eye — input, collision, a fall — is one of these.
 */
type FrameHook = (pose: Pose, seconds: number, signOf: SignOf) => Frame;

/** An eye outside the cube and the lens it sees through. */
type OutsideEye = { outside: Outside; lens: OutsideLens };

/** A sound a room in view is making, and the room, in whose frame it is. */
export type Heard = RoomSound & InRoomOf;

/** `onError` hears a device lost or a build that threw. */
export type CubeOptions = WithOnError &
  Selling & {
    start: Pose;
    onFrame: FrameHook;
    /**
     * Every frame, what the rooms in view are sounding at its instant, and
     * where the eye drawn is: the outside eye when it is outside.
     */
    onHeard: (heard: readonly Heard[], at: Whereabouts) => void;
    /** The instant a frame is drawn at, in milliseconds since the epoch. */
    now: () => number;
    /** Hears that the browser has no WebGPU; nothing is drawn then. */
    onUnsupported: () => void;
  };

/**
 * The play hook's calls, which the page also drives itself; `refresh`, which
 * rebuilds the mesh once a purchase changes what it draws; the GPU's time per
 * stage, as the renderer gives it; and its end.
 */
export type CubeScene = ScenePlay & Drawing & { refresh: () => void };

const noSign: SignOf = () => null;

/** What shows where no face is drawn, for an eye `depth` floors down. */
const airAt = (depth: number) => between((n) => themeOf(n).air, depth);

/**
 * What goes on by itself in `mesh`'s rooms at `clock`: the quads of that
 * instant, each in its room's frame, and the sounds.
 */
function goingOn(
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

/** The floors any of `sceneries` has a face on. */
const floorsIn = (sceneries: readonly Scenery[]): number[] => [
  ...new Set(sceneries.flatMap(({ ranges }) => ranges.map(({ n }) => n))),
];

/**
 * `pose` on the floor whose room holds its eye: the floor below once a
 * falling eye has passed under its slab, so the mesh is that room's.
 */
const inEyeRoom = (pose: Pose): Pose =>
  pose.eyeAbove < 0 ? descend(pose) : pose;

/**
 * Draws the cube into `canvas` every animation frame from `options.start`,
 * moving the eye by `options.onFrame` and rebuilding the mesh whenever the
 * eye's room changes or `refresh` says a purchase has.
 */
export function mountCube(
  canvas: HTMLCanvasElement,
  {
    start,
    copy,
    bought,
    onFrame,
    onHeard,
    now,
    onError,
    onUnsupported,
  }: CubeOptions,
): CubeScene {
  let pose = start;
  let taken: InRoomOf | null = null;
  let moving: readonly Quad[] = [];
  /** What the play hook's last call put in the rooms. */
  let staged: readonly Quad[] = [];
  /** The pill the play hook's last call took off its shelf. */
  let stagedTaken: InRoomOf | null = null;
  /** The outside eye the frame hook gave, and the one the play hook holds. */
  let hooked: OutsideEye | null = null;
  let stagedEye: OutsideEye | null = null;
  /**
   * The lens for an eye on floor 1 as for one outside: the frame hook's, and
   * the one a staged pose carries, which the hook's frames do not clear.
   */
  let through: OutsideLens | null = null;
  let stagedThrough: OutsideLens | null = null;
  /** The ladder and the body as the frame hook last gave them, and the play hook's. */
  let hookedState: OutdoorState = {};
  let stagedState: OutdoorState = {};
  /** Whether the renderer holds moving quads, to drop once a frame has none. */
  let movingDrawn = false;
  let renderer: Renderer | null = null;
  /** Counts purchases, so a mesh built before one is rebuilt. */
  let generation = 0;
  /** What a mesh is built for: the eye's room, as of `generation`. */
  const meshKey = (target: Pose): string =>
    `${roomKey(target)}#${String(generation)}`;
  /** The mesh drawn, and `lenses`, the floors whose shaders it prepared. */
  let built: {
    key: string;
    pose: Pose;
    mesh: Mesh;
    lenses: ReadonlySet<number>;
  } | null = null;
  /** The pill taken as the mesh last uploaded draws it. */
  let uploadedTaken = '';
  let building: { key: string; done: Promise<void> } | null = null;
  let frame = 0;
  let last = performance.now();
  let disposed = false;
  const firstFrame = Promise.withResolvers<void>();

  const takenKey = (): string => (taken === null ? '' : roomKey(taken.room));

  const upload = async (target: Pose, key: string): Promise<void> => {
    const mesh = await build(target, copy, bought());
    const off = takenKey();
    const scenery = mesh.faces(taken);
    const floors = [
      ...floorsIn([scenery, ...mesh.boards.map((board) => board.scenery)]),
      target.n,
    ];
    await Promise.all([
      renderer?.prepare(floors),
      target.n === 1 ? renderer?.prepareOutside() : null,
    ]);
    if (disposed || renderer === null) return;
    renderer.upload(scenery);
    renderer.uploadBoards(mesh.boards);
    uploadedTaken = off;
    built = { key, pose: target, mesh, lenses: new Set(floors) };
  };

  /** The mesh build for `target`'s room: the one under way, or a new one. */
  const rebuild = (target: Pose): { done: Promise<void> } => {
    const key = meshKey(target);
    if (building?.key !== key) {
      const done = upload(target, key);
      done.catch(onError);
      building = { key, done };
    }
    return building;
  };

  // Until the eye's room has its own mesh, it is drawn in a neighbouring
  // floor's: one being left by a fall shows the floor below through its hole.
  const render = (): void => {
    if (renderer === null) return;
    const outdoor = stagedEye ?? hooked;
    const at = outdoor === null ? inEyeRoom(pose) : FIRST_ROOM;
    if (built?.key !== meshKey(at)) rebuild(at);
    if (built === null || Math.abs(built.pose.n - at.n) > 1) return;
    // The outside is drawn in floor 1's frame alone, which prepared it.
    const first = built.pose.n === 1;
    if (outdoor !== null && !first) return;
    if (takenKey() !== uploadedTaken) {
      renderer.upload(built.mesh.faces(taken));
      uploadedTaken = takenKey();
    }
    const { lenses, mesh } = built;
    const clock = clockAt(now());
    const { quads, heard } = goingOn(mesh, clock);
    onHeard(heard, outdoor?.outside ?? pose);
    const shown = [...moving, ...staged, ...quads].filter(({ room }) =>
      lenses.has(room.n),
    );
    if (shown.length > 0 || movingDrawn) {
      renderer.uploadMoving(mesh.stood(shown));
      movingDrawn = shown.length > 0;
    }
    const { width, height } = canvas;
    const { eye, side } =
      outdoor === null
        ? eyeInFrame(built.pose, at)
        : { eye: toCube(outdoor.outside.eye), side: 1 };
    const unit = side * at.scale;
    const depth = at.n - Math.log2(at.scale);
    const showsOutside = first && (outdoor !== null || at.n === 1);
    const seen = {
      viewProjection: viewProjection(
        outdoor === null ? at : gazeInCube(outdoor.outside),
        eye,
        width / height,
        unit,
        showsOutside ? { roll: outdoor?.outside.roll, far: OUTSIDE_FAR } : {},
      ),
      eye,
    };
    renderer.draw({
      ...seen,
      clear: airAt(depth),
      lens:
        outdoor?.lens ??
        (showsOutside ? (stagedThrough ?? through) : null) ??
        (lenses.has(at.n) ? at.n : built.pose.n),
      outdoors: showsOutside
        ? {
            ...seenInWorld(seen),
            ...(stagedEye === null ? hookedState : stagedState),
          }
        : null,
      ...clock,
    });
    firstFrame.resolve();
  };

  // Assigning a canvas's size clears it, so only a change is assigned.
  const resize = (): void => {
    const ratio = globalThis.devicePixelRatio;
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  };

  const tick = (time: number): void => {
    const seconds = Math.min((time - last) / 1000, 0.1);
    last = time;
    const { outside, lens, ladderGone, body, ...next } = onFrame(
      pose,
      seconds,
      built?.mesh.signOf ?? noSign,
    );
    ({ pose, taken, moving } = next);
    taken ??= stagedTaken;
    hookedState = { ladderGone, body };
    through = lens ?? null;
    hooked =
      outside === undefined ? null : { outside, lens: lens ?? OUTSIDE_LENS };
    resize();
    render();
    frame = requestAnimationFrame(tick);
  };

  const begin = async (): Promise<void> => {
    const created = await createRenderer(canvas, shaderOf, onError);
    if (disposed) {
      created?.dispose();
      return;
    }
    if (created === null) {
      onUnsupported();
      return;
    }
    renderer = created;
    frame = requestAnimationFrame(tick);
  };
  begin().catch((error: unknown) => {
    onError(asError(error));
  });

  /** A frame of what the play hook just set, built for `target`, on screen. */
  const shown = async (target: Pose): Promise<void> => {
    await rebuild(target).done;
    resize();
    render();
    await renderer?.drawn();
  };

  return {
    ready: async () => firstFrame.promise,
    setPose: async (
      next,
      { moving: among = [], lens = null, taken: off = null } = {},
    ) => {
      await firstFrame.promise;
      pose = next;
      staged = among;
      stagedTaken = off;
      taken = off;
      stagedEye = null;
      stagedThrough = lens;
      await shown(inEyeRoom(next));
    },
    setEye: async (
      outside,
      lens = OUTSIDE_LENS,
      { moving: among = [], ...state } = {},
    ) => {
      await firstFrame.promise;
      stagedEye = { outside, lens };
      staged = among;
      stagedState = state;
      stagedThrough = null;
      await shown(FIRST_ROOM);
    },
    adapter: () => renderer?.adapter ?? 'none',
    passTimes: () => renderer?.passTimes() ?? null,
    refresh: () => {
      generation += 1;
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
    },
  };
}
