import { asError } from '@/kernel/shared/lib/error-class';
import type { WithOnError } from '@/kernel/shared/typings';

import { type Clock, clockAt } from '@/cube/shared/lib/clock';
import { themeOf } from '@/cube/entities/theme';
import {
  descend,
  eyeInFrame,
  type InRoomOf,
  type Pose,
  type Posed,
  type Pulled,
  type Quad,
  roomKey,
} from '@/cube/entities/world';
import { happening, type RoomSound } from '@/cube/features/happenings';

import { viewProjection } from '../lib/camera';
import type { Scenery } from '../lib/mesh';
import { between } from '../lib/palette';
import type { ScenePlay } from '../lib/play';
import { shaderOf } from '../lib/shader';
import { build, type Mesh, type Selling, type SignOf } from './cube-mesh';
import { createRenderer, type Drawing, type Renderer } from './renderer';

/**
 * What one frame draws: the eye's pose, the lever pulled, if any, and
 * `moving`, what is in the rooms for this frame alone, each quad in its own
 * room's frame.
 */
type Frame = Posed & { pulled: Pulled | null; moving: readonly Quad[] };

/**
 * Moves the eye one frame on: the pose it was at, the seconds since the last
 * frame and the signs around it in, the frame to draw out. Whatever moves the
 * eye — input, collision, a fall — is one of these.
 */
type FrameHook = (pose: Pose, seconds: number, signOf: SignOf) => Frame;

/** A sound a room in view is making, and the room, in whose frame it is. */
export type Heard = RoomSound & InRoomOf;

/** `onError` hears a device lost or a build that threw. */
export type CubeOptions = WithOnError &
  Selling & {
    start: Pose;
    onFrame: FrameHook;
    /** Every frame, what the rooms in view are sounding at its instant. */
    onHeard: (heard: readonly Heard[]) => void;
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
  let pulled: Pulled | null = null;
  let moving: readonly Quad[] = [];
  /** What the play hook's last call put in the rooms. */
  let staged: readonly Quad[] = [];
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
  /** The lever pulled as the mesh last uploaded draws it. */
  let uploadedPull = '';
  let building: { key: string; done: Promise<void> } | null = null;
  let frame = 0;
  let last = performance.now();
  let disposed = false;
  const firstFrame = Promise.withResolvers<void>();

  const pullKey = (): string =>
    pulled === null ? '' : `${roomKey(pulled.room)} ${pulled.swung}`;

  const upload = async (target: Pose, key: string): Promise<void> => {
    const mesh = await build(target, copy, bought());
    const pull = pullKey();
    const scenery = mesh.faces(pulled);
    const floors = [
      ...floorsIn([scenery, ...mesh.boards.map((board) => board.scenery)]),
      target.n,
    ];
    await renderer?.prepare(floors);
    if (disposed || renderer === null) return;
    renderer.upload(scenery);
    renderer.uploadBoards(mesh.boards);
    uploadedPull = pull;
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
    const at = inEyeRoom(pose);
    if (built?.key !== meshKey(at)) rebuild(at);
    if (built === null || Math.abs(built.pose.n - at.n) > 1) return;
    if (pullKey() !== uploadedPull) {
      renderer.upload(built.mesh.faces(pulled));
      uploadedPull = pullKey();
    }
    const { lenses, mesh } = built;
    const clock = clockAt(now());
    const { quads, heard } = goingOn(mesh, clock);
    onHeard(heard);
    const seen = [...moving, ...staged, ...quads].filter(({ room }) =>
      lenses.has(room.n),
    );
    if (seen.length > 0 || movingDrawn) {
      renderer.uploadMoving(mesh.stood(seen));
      movingDrawn = seen.length > 0;
    }
    const { width, height } = canvas;
    const { eye, side } = eyeInFrame(built.pose, at);
    const unit = side * at.scale;
    const depth = at.n - Math.log2(at.scale);
    renderer.draw({
      viewProjection: viewProjection(at, eye, width / height, unit),
      eye,
      clear: airAt(depth),
      lens: lenses.has(at.n) ? at.n : built.pose.n,
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
    ({ pose, pulled, moving } = onFrame(
      pose,
      seconds,
      built?.mesh.signOf ?? noSign,
    ));
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

  return {
    ready: async () => firstFrame.promise,
    setPose: async (next, among = []) => {
      await firstFrame.promise;
      pose = next;
      staged = among;
      await rebuild(inEyeRoom(next)).done;
      resize();
      render();
      await renderer?.drawn();
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
