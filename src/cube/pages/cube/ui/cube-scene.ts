import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose, WithOnError } from '@/kernel/shared/typings';

import {
  faces,
  type HoleOf,
  holesOf,
  maze,
  planted,
  type Pose,
  roomKey,
  sight,
  slabRooms,
  type Vec3,
  withBelow,
} from '@/cube/entities/world';

import { viewProjection } from '../lib/camera';
import { pack } from '../lib/mesh';
import { airOf, ambientOf } from '../lib/palette';
import type { CubePlayHook } from '../lib/play';
import { createRenderer, type Renderer } from './renderer';

/**
 * Moves the eye one frame on: the pose it was at and the seconds since the
 * last frame in, the pose to draw out. Whatever moves the eye — input,
 * collision, a fall — is one of these.
 */
type FrameHook = (pose: Pose, seconds: number) => Pose;

/** `onError` hears a device lost or a build that threw. */
export type CubeOptions = WithOnError & {
  start: Pose;
  onFrame: FrameHook;
  /** Hears that the browser has no WebGPU; nothing is drawn then. */
  onUnsupported: () => void;
};

/** The play hook's calls, which the page also drives itself, and its end. */
export type CubeScene = CubePlayHook & CanDispose;

/** Rooms of the eye's floor drawn on each side of its own. */
const RADIUS = 3;
/** Fog density per room side of the eye's floor. */
const FOG_DENSITY = 0.32;

const rolled = maze(planted.seed);

/**
 * The vertex buffer for an eye at `pose`. Its floor's holes are resolved
 * first, since they decide which rooms of the floor below it sees, and only
 * then those rooms' own.
 */
async function build(pose: Pose): Promise<Float32Array<ArrayBuffer>> {
  const seen = sight(pose, RADIUS);
  const holeAbove = await holesOf(planted, slabRooms(seen));
  const full = withBelow(seen, holeAbove);
  const holeBelow = await holesOf(planted, full.below);
  const holeOf: HoleOf = (room) =>
    room.n > pose.n ? holeBelow(room) : holeAbove(room);
  return pack(faces(rolled, pose, full, holeOf));
}

/** The eye in the frame of the mesh built for `built`, on the same floor. */
const eyeIn = (built: Pose, pose: Pose): Vec3 => [
  Number(pose.x - built.x) + pose.u,
  pose.eyeAbove,
  Number(pose.y - built.y) + pose.v,
];

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
  let renderer: Renderer | null = null;
  let built: Pose | null = null;
  let building: { key: string; done: Promise<void> } | null = null;
  let frame = 0;
  let last = performance.now();
  let disposed = false;
  const firstFrame = Promise.withResolvers<void>();

  const upload = async (target: Pose): Promise<void> => {
    const vertices = await build(target);
    if (disposed || renderer === null) return;
    renderer.upload(vertices);
    built = target;
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

  const render = (): void => {
    if (renderer === null) return;
    if (built?.n !== pose.n || roomKey(built) !== roomKey(pose)) {
      rebuild(pose);
    }
    if (built?.n !== pose.n) return;
    const { width, height } = canvas;
    const eye = eyeIn(built, pose);
    renderer.draw(viewProjection(pose, eye, width / height), {
      eye,
      density: FOG_DENSITY,
      fog: airOf(pose.n),
      ambient: ambientOf(pose.n),
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
    pose = onFrame(pose, seconds);
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
      await rebuild(next).done;
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
