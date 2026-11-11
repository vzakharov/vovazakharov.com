import { asError } from '@/kernel/shared/lib/error-class';
import type { CanDispose, WithOnError } from '@/kernel/shared/typings';

import {
  descend,
  eyeInFrame,
  faces,
  type Holdings,
  type HoleOf,
  holesOf,
  maze,
  mazeWalls,
  placed,
  planted,
  type Pose,
  type Posed,
  priceOf,
  type Pulled,
  type Room,
  roomKey,
  sight,
  type Sign,
  type Signed,
  signFacets,
  signPost,
  signsSeen,
  slabRooms,
  withBelow,
} from '@/cube/entities/world';

import type COPY from '../config/messages/en.json';
import { FAR, viewProjection } from '../lib/camera';
import { formatPrice } from '../lib/figures';
import { pack, packSigns } from '../lib/mesh';
import { airOf, ambientOf, between } from '../lib/palette';
import type { ScenePlay } from '../lib/play';
import { type Boards, createRenderer, type Renderer } from './renderer';
import { drawBoard } from './sign-board';

/** What one frame draws: the eye's pose and the lever pulled, if any. */
type Frame = Posed & { pulled: Pulled | null };

/**
 * The sign of a room on the eye's floor, null where the room has none or the
 * scene has not resolved it yet.
 */
export type SignOf = (room: Room) => Sign | null;

/**
 * Moves the eye one frame on: the pose it was at, the seconds since the last
 * frame and the signs around it in, the frame to draw out. Whatever moves the
 * eye — input, collision, a fall — is one of these.
 */
type FrameHook = (pose: Pose, seconds: number, signOf: SignOf) => Frame;

/** One room's view: its vertex buffer, the lever pulled drawn as such, and its signs. */
type Mesh = {
  faces: (pulled: Pulled | null) => Float32Array<ArrayBuffer>;
  boards: readonly Boards[];
  signOf: SignOf;
};

/** The offer's copy, which holds what each kind of sign says. */
type SignCopy = (typeof COPY)['offer'];

/** What the signs say, and which rooms they mark as the viewer's. */
export type Selling = {
  copy: SignCopy;
  /** The rooms the viewer bought, read on every mesh build. */
  bought: () => Holdings;
};

/** `onError` hears a device lost or a build that threw. */
export type CubeOptions = WithOnError &
  Selling & {
    start: Pose;
    onFrame: FrameHook;
    /** Hears that the browser has no WebGPU; nothing is drawn then. */
    onUnsupported: () => void;
  };

/**
 * The play hook's calls, which the page also drives itself; `refresh`, which
 * rebuilds the mesh once a purchase changes what it draws; and its end.
 */
export type CubeScene = ScenePlay & CanDispose & { refresh: () => void };

const rolled = maze(planted.seed);
const walls = mazeWalls(rolled);

const noSign: SignOf = () => null;

/**
 * The boards of `signed` in the eye's frame at `pose`, one texture per floor
 * and kind of sign, since a floor's rooms share a price.
 */
function boardsOf(
  pose: Pose,
  signed: readonly Signed[],
  { signs, sold }: SignCopy,
): Boards[] {
  const byBoard = Map.groupBy(
    signed,
    ({ room, sign }) => `${sign.kind}/${String(room.n)}`,
  );
  return [...byBoard].flatMap(([id, rooms]) => {
    const [first] = rooms;
    if (first === undefined) return [];
    const { n } = first.room;
    const { kind } = first.sign;
    const isSold = kind === 'yours';
    const line = isSold ? sold : formatPrice(priceOf(n));
    return [
      {
        id,
        image: () => drawBoard(n, isSold, signs[kind], line),
        vertices: packSigns(
          rooms.flatMap(({ room, sign }) =>
            signFacets(sign, n, placed(pose, room)),
          ),
        ),
      },
    ];
  });
}

/**
 * The mesh for an eye at `pose`. Its floor's holes are resolved first, since
 * they decide which rooms of the floor below it sees, and only then those
 * rooms' own; which rooms sell is read off the same answers. What it awaits
 * is resolved once per room, so a swinging lever re-packs the faces without
 * resolving the holes again.
 */
async function build(
  pose: Pose,
  copy: SignCopy,
  bought: Holdings,
): Promise<Mesh> {
  const seen = sight(pose, FAR, walls);
  const holeAbove = await holesOf(planted, slabRooms(seen));
  const full = withBelow(seen, holeAbove);
  const holeBelow = await holesOf(planted, full.below);
  const holeOf: HoleOf = (room) =>
    room.n > pose.n ? holeBelow(room) : holeAbove(room);
  const signed = signsSeen(walls, bought, full, holeOf);
  const onFloor = new Map(
    signed
      .filter(({ room }) => room.n === pose.n)
      .map(({ room, sign }) => [roomKey(room), sign]),
  );
  const owns = (room: Room) => bought.has(roomKey(room));
  const posts = signed.flatMap(({ room, sign }) =>
    signPost(sign, room.n, placed(pose, room)),
  );
  return {
    faces: (pulled) =>
      pack([...faces(rolled, pose, full, holeOf, pulled, owns), ...posts]),
    boards: boardsOf(pose, signed, copy),
    signOf: (room) => onFloor.get(roomKey(room)) ?? null,
  };
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
 * eye's room changes or `refresh` says a purchase has.
 */
export function mountCube(
  canvas: HTMLCanvasElement,
  { start, copy, bought, onFrame, onError, onUnsupported }: CubeOptions,
): CubeScene {
  let pose = start;
  let pulled: Pulled | null = null;
  let renderer: Renderer | null = null;
  /** Counts purchases, so a mesh built before one is rebuilt. */
  let generation = 0;
  /** What a mesh is built for: the eye's room, as of `generation`. */
  const meshKey = (target: Pose): string =>
    `${roomKey(target)}#${String(generation)}`;
  let built: { key: string; pose: Pose; mesh: Mesh } | null = null;
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
    if (disposed || renderer === null) return;
    renderer.upload(mesh.faces(pulled));
    renderer.uploadBoards(mesh.boards);
    uploadedPull = pullKey();
    built = { key, pose: target, mesh };
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
    ({ pose, pulled } = onFrame(pose, seconds, built?.mesh.signOf ?? noSign));
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
