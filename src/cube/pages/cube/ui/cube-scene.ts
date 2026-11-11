import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose, WithOnError } from '@/kernel/shared/typings';

import {
  descend,
  eyeInFrame,
  faces,
  type HoleOf,
  holesOf,
  maze,
  mazeWalls,
  planted,
  type Pose,
  type Posed,
  type Pulled,
  roomKey,
  sight,
  slabRooms,
  withBelow,
} from '@/cube/entities/world';

import { FAR, viewProjection } from '../lib/camera';
import { pack } from '../lib/mesh';
import { airOf, ambientOf, between } from '../lib/palette';
import type { CubePlayHook } from '../lib/play';
import { createRenderer, type Renderer } from './renderer';

/** What one frame draws: the eye's pose and the lever pulled, if any. */
type Frame = Posed & { pulled: Pulled | null };

/**
 * Moves the eye one frame on: the pose it was at and the seconds since the
 * last frame in, the frame to draw out. Whatever moves the eye — input,
 * collision, a fall — is one of these.
 */
type FrameHook = (pose: Pose, seconds: number) => Frame;

/** The vertex buffer of one room's view, the lever pulled drawn as such. */
type Mesh = (pulled: Pulled | null) => Float32Array<ArrayBuffer>;

/** `onError` hears a device lost or a build that threw. */
export type CubeOptions = WithOnError & {
  start: Pose;
  onFrame: FrameHook;
  /** Hears that the browser has no WebGPU; nothing is drawn then. */
  onUnsupported: () => void;
};

/** The play hook's calls, which the page also drives itself, and its end. */
export type CubeScene = CubePlayHook & CanDispose;

const rolled = maze(planted.seed);
const walls = mazeWalls(rolled);

/**
 * The mesh for an eye at `pose`. Its floor's holes are resolved first, since
 * they decide which rooms of the floor below it sees, and only then those
 * rooms' own. What it awaits is resolved once per room, so a swinging lever
 * re-packs the faces without resolving the holes again.
 */
async function build(pose: Pose): Promise<Mesh> {
  const seen = sight(pose, FAR, walls);
  const holeAbove = await holesOf(planted, slabRooms(seen));
  const full = withBelow(seen, holeAbove);
  const holeBelow = await holesOf(planted, full.below);
  const holeOf: HoleOf = (room) =>
    room.n > pose.n ? holeBelow(room) : holeAbove(room);
  return (pulled) => pack(faces(rolled, pose, full, holeOf, pulled));
}

/**
 * `pose` on the floor whose room holds its eye: the floor below once a
 * falling eye has passed under its slab, so the mesh is that room's.
 */
const inEyeRoom = (pose: Pose): Pose =>
  pose.eyeAbove < 0 ? descend(pose) : pose;

/**
 * Draws the cube into `canvas` every animation frame from `options.start`,
 * moving the eye by `options.onFrame` and rebuilding the mesh whenever the
 * eye's room changes.
 */
export function mountCube(
  canvas: HTMLCanvasElement,
  { start, onFrame, onError, onUnsupported }: CubeOptions,
): CubeScene {
  let pose = start;
  let pulled: Pulled | null = null;
  let renderer: Renderer | null = null;
  let built: { pose: Pose; mesh: Mesh } | null = null;
  /** The lever pulled as the mesh last uploaded draws it. */
  let uploadedPull = '';
  let building: { key: string; done: Promise<void> } | null = null;
  let frame = 0;
  let last = performance.now();
  let disposed = false;
  const firstFrame = Promise.withResolvers<void>();

  const pullKey = (): string =>
    pulled === null ? '' : `${roomKey(pulled.room)} ${pulled.swung}`;

  const upload = async (target: Pose): Promise<void> => {
    const mesh = await build(target);
    if (disposed || renderer === null) return;
    renderer.upload(mesh(pulled));
    uploadedPull = pullKey();
    built = { pose: target, mesh };
  };

  /** The mesh build for `target`'s room: the one under way, or a new one. */
  const rebuild = (target: Pose): { done: Promise<void> } => {
    const key = roomKey(target);
    if (building?.key !== key) {
      const done = upload(target);
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
    if (built === null || roomKey(built.pose) !== roomKey(at)) rebuild(at);
    if (built === null || Math.abs(built.pose.n - at.n) > 1) return;
    if (pullKey() !== uploadedPull) {
      renderer.upload(built.mesh(pulled));
      uploadedPull = pullKey();
    }
    const { width, height } = canvas;
    const { eye, side } = eyeInFrame(built.pose, at);
    const unit = side * at.scale;
    const depth = at.n - Math.log2(at.scale);
    renderer.draw(viewProjection(at, eye, width / height, unit), {
      clear: between(airOf, depth),
      ambient: between(ambientOf, depth),
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

  const tick = (now: number): void => {
    const seconds = Math.min((now - last) / 1000, 0.1);
    last = now;
    ({ pose, pulled } = onFrame(pose, seconds));
    resize();
    render();
    frame = requestAnimationFrame(tick);
  };

  const begin = async (): Promise<void> => {
    const created = await createRenderer(canvas, onError);
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
    setPose: async (next) => {
      await firstFrame.promise;
      pose = next;
      await rebuild(inEyeRoom(next)).done;
      resize();
      render();
      await renderer?.drawn();
    },
    adapter: () => renderer?.adapter ?? 'none',
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
    },
  };
}
