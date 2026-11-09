import {
  Color,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGPURenderer,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { R, unit } from '@/island/shared/globe';
import {
  type CoastDistance,
  heightAtSphere,
  sampleSphereField,
  type SphereField,
} from '@/island/entities/terrain';
import {
  bindEyeControls,
  type Eye,
  eyeAt,
  type GroundAt,
  headingOf,
  type HintShowing,
  latchHint,
  lookHint,
  MAX_HEIGHT,
  NO_HINT,
  openingOf,
  poseOf,
  step,
  STILL,
  withHeading,
  withHeight,
} from '@/island/features/eye';

import {
  advance,
  dayHours,
  heavensAt,
  OPENING_CLOCK,
  solarHours,
} from '../lib/day';
import { eyeOfPose, poseOfEye } from '../lib/eye-pose';
import { smoothedFrameMs } from '../lib/frame-time';
import type { Pose } from '../lib/place-hash';
import { skyColour } from '../lib/sky-colour';
import { startTilePool, type TilePool } from '../lib/tile-pool';
import type { Where } from '../lib/where-line';
import { groundLighting } from './ground-lighting';
import { tileView } from './tile-view';
import { bindTimeKeys } from './time-keys';

export type IslandScene = CanDispose & {
  /** Resolves once the first frame is drawn. */
  readonly ready: Promise<void>;
  /** Steps the eye `dt` seconds by the player's input (none under play) and draws. */
  readonly frame: (dt: number) => void;
  /** Puts the eye `m` metres up; resolves once every tile it then selects is drawn. */
  readonly setHeight: (m: number) => Promise<void>;
  /** Puts the eye `m` metres over latitude `lat`, longitude `lon` (degrees, east positive), its heading kept, resolving as `setHeight` does. */
  readonly moveTo: (lat: number, lon: number, m: number) => Promise<void>;
  /** Sets the clock to `hours` past the opening's sun, as it stands, and draws. */
  readonly setTime: (hours: number) => void;
  /** Turns the eye to `heading`, resolving as `setHeight` does. */
  readonly turnTo: (heading: number) => Promise<void>;
  /** `'webgpu'` or `'webgl2'`, once ready. */
  readonly backend: () => string;
  /** Ms the worker took to build the current world's field; throws until it lands. */
  readonly buildMs: () => number;
  /**
   * Rebuilds the scene on world `world`: every tile held or in flight is
   * dropped and refilled from the new field, the eye left where it is.
   */
  readonly setWorld: (world: string) => void;
  /** Puts the eye in `pose` and the clock at its hour, the opening's when it names none. */
  readonly placeAt: (pose: Pose) => void;
  /** Where the eye stands now, in the world on screen; throws until ready. */
  readonly where: () => Where;
  /** Ms between drawn frames, smoothed; none before the first frame, nor under play. */
  readonly frameMs: () => number | undefined;
};

/** Closest the camera sees: the eye is never under two metres up. */
const NEAR = 0.5;
/** Past the far side of the planet from `MAX_HEIGHT`. */
const FAR = 4 * (R + MAX_HEIGHT);

/** Ground before the field arrives; nothing reads it before then. */
const SEA_LEVEL: GroundAt = () => 0;

const coastOf =
  (field: SphereField): CoastDistance =>
  (p) =>
    sampleSphereField(field, p);

const groundOf =
  (coast: CoastDistance, seed: number): GroundAt =>
  (p) =>
    heightAtSphere(coast, seed, p);

const DEGREE = Math.PI / 180;

/**
 * The globe outside the tiles, and under them before they load: a sphere
 * whose facets' sag stays below the tiles' sea, so it never shows through.
 */
const GLOBE_RADIUS = R - 1500;

type MountIslandSceneParams = {
  /** The world number the scene opens on. */
  world: string;
  /** Where the eye opens, when not at the world's opening. */
  pose: Pose | undefined;
  play: boolean;
  onError: (error: Error) => void;
  /** Told each time a look hint is shown or goes; never under play. */
  onLookHint: (showing: HintShowing | undefined) => void;
};

/**
 * The island's scene on `canvas`: three's WebGPU renderer, which falls back
 * to WebGL 2 by itself, with a logarithmic depth buffer, the one depth mode
 * both backends keep from orbit to two metres. The camera sits at the
 * origin; everything else is placed relative to the eye each frame.
 */
export function mountIslandScene(
  canvas: HTMLCanvasElement,
  {
    world: firstWorld,
    pose: firstPose,
    play,
    onError,
    onLookHint,
  }: MountIslandSceneParams,
): IslandScene {
  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  const scene = new Scene();
  const background = new Color(skyColour(MAX_HEIGHT, 1));
  scene.background = background;
  const camera = new PerspectiveCamera(50, 1, NEAR, FAR);

  const lighting = groundLighting();
  const { land, sea, ocean, lights } = lighting;
  const globe = new Mesh(new SphereGeometry(GLOBE_RADIUS, 256, 128), ocean);
  const tiles = new Group();
  scene.add(globe, tiles, ...lights);

  const controls = bindEyeControls(canvas);
  // Under play the clock moves only by `setTime`.
  const timeKeys = play ? null : bindTimeKeys(canvas);
  let clock = OPENING_CLOCK;

  let eye: Eye | null = null;
  /** Where the eye opens once the field lands, when not at the world's opening. */
  let pending: Pose | undefined;
  let groundAt = SEA_LEVEL;
  /** The coast the selection refines along, once the field arrives. */
  let coast: CoastDistance | undefined;
  /** The current world's tile pool, started once `view` exists to take its tiles. */
  let pool: TilePool;
  const view = tileView(tiles, {
    materials: { land, sea },
    ground: () => ({ coast, groundAt }),
    want: (missing, at) => {
      pool.want(missing, at);
    },
  });
  const waiting: Array<{ resolve: () => void; reject: (e: Error) => void }> =
    [];
  let failure: Error | null = null;
  let disposed = false;

  const fail = (error: Error) => {
    if (failure !== null) return;
    failure = error;
    for (const waiter of waiting.splice(0)) waiter.reject(error);
    onError(error);
  };

  let world = firstWorld;
  let built: { of: number; ms: number } | null = null;
  /** Counts the pools started, so a disposed one's late reply is told apart. */
  let generation = 0;
  /** Resolves once the first world's field is in hand. */
  const landed = Promise.withResolvers<void>();

  /** A pool on `on`, whose tiles and field are taken only while it is current. */
  const startPool = (on: string): TilePool => {
    generation += 1;
    const mine = generation;
    const current = () => !disposed && mine === generation;
    const started = startTilePool(
      on,
      (tile) => {
        if (!current()) return;
        view.add(tile, eye, camera.aspect);
        settle();
      },
      (error) => {
        if (current()) fail(error);
      },
    );
    started.field.then(
      ({ field, seed, buildMs }) => {
        if (!current()) return;
        built = { of: mine, ms: buildMs };
        coast = coastOf(field);
        groundAt = groundOf(coast, seed);
        view.reselect();
        landed.resolve();
      },
      (error: unknown) => {
        if (!current()) return;
        fail(error instanceof Error ? error : new Error(String(error)));
      },
    );
    return started;
  };
  pool = startPool(world);

  function render(): void {
    if (eye === null) return;
    const pose = poseOf(eye, camera.aspect);
    const [ex, ey, ez] = pose.position;
    view.draw(eye, camera.aspect);
    globe.position.set(-ex, -ey, -ez);
    camera.fov = (pose.fov * 180) / Math.PI;
    camera.updateProjectionMatrix();
    camera.up.set(...pose.up);
    camera.lookAt(...pose.forward);
    const heavens = heavensAt(openingOf(Number(world)), clock.hours);
    const day = lighting.shine(heavens, unit(pose.position));
    background.setHex(skyColour(eye.height, day));
    renderer.render(scene, camera);
  }

  /** Draws and lets every placing of the eye go whose tiles are all in hand. */
  function settle(): void {
    if (waiting.length === 0 || eye === null) return;
    if (!view.complete(eye, camera.aspect)) return;
    render();
    for (const waiter of waiting.splice(0)) waiter.resolve();
  }

  const resize = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let hint = NO_HINT;
  /** Seconds the frames have stepped, the clock the look hint's latch reads. */
  let stepped = 0;
  const frame = (dt: number) => {
    if (eye === null) return;
    stepped += dt;
    eye = step(eye, play ? STILL : controls.read(), dt, groundAt);
    if (timeKeys !== null) {
      const keys = timeKeys.read();
      if (keys.toggled) clock = { ...clock, running: !clock.running };
      clock = advance(clock, keys, dt);
    }
    render();
    const earned = play ? undefined : lookHint(eye, camera.aspect);
    const latched = latchHint(hint, earned, stepped);
    if (latched.showing !== hint.showing) onLookHint(latched.showing);
    hint = latched;
  };

  let loop = 0;
  let last = 0;
  let frameMs: number | undefined;
  const tick = (now: number) => {
    frameMs = smoothedFrameMs(frameMs, now - last);
    frame(Math.min(0.1, (now - last) / 1000));
    last = now;
    loop = requestAnimationFrame(tick);
  };

  const live = () => !disposed;
  const ready = (async () => {
    await Promise.all([landed.promise, renderer.init()]);
    if (!live()) return;
    eye =
      pending === undefined
        ? eyeAt(openingOf(Number(world)), groundAt)
        : eyeOfPose(pending, groundAt);
    resize();
    render();
    if (!play) {
      last = performance.now();
      loop = requestAnimationFrame(tick);
    }
  })();
  ready.catch(fail);

  /** Moves the eye by `move` and resolves once every tile it then selects is drawn. */
  const placed = async (move: (from: Eye) => Eye) => {
    if (failure !== null) throw failure;
    if (eye === null) throw new Error('scene not ready');
    eye = move(eye);
    const done = new Promise<void>((resolve, reject) => {
      waiting.push({ resolve, reject });
    });
    settle();
    return done;
  };

  const placeAt = (pose: Pose) => {
    clock = { ...clock, hours: pose.hours ?? OPENING_CLOCK.hours };
    if (eye === null) {
      pending = pose;
      return;
    }
    view.forgetShown();
    eye = eyeOfPose(pose, groundAt);
  };
  if (firstPose !== undefined) placeAt(firstPose);

  return {
    ready,
    frame,
    setHeight: async (m) => placed((from) => withHeight(from, m)),
    moveTo: async (lat, lon, m) => {
      view.forgetShown();
      return placed((from) =>
        eyeAt(
          {
            lat: lat * DEGREE,
            lon: lon * DEGREE,
            height: m,
            heading: headingOf(from),
          },
          groundAt,
        ),
      );
    },
    setTime: (hours) => {
      clock = { ...clock, hours: dayHours(hours) };
      render();
    },
    turnTo: async (heading) => placed((from) => withHeading(from, heading)),
    backend: () =>
      'isWebGPUBackend' in renderer.backend &&
      renderer.backend.isWebGPUBackend === true
        ? 'webgpu'
        : 'webgl2',
    buildMs: () => {
      if (built?.of !== generation) throw new Error('field not built');
      return built.ms;
    },
    setWorld: (next) => {
      if (next === world || disposed) return;
      world = next;
      pool.dispose();
      view.clear();
      // The old coast would refine the selection where the new one has none.
      coast = undefined;
      pool = startPool(next);
    },
    placeAt,
    where: () => {
      if (eye === null) throw new Error('scene not ready');
      const { sun } = heavensAt(openingOf(Number(world)), clock.hours);
      return {
        commit: process.env.NEXT_PUBLIC_COMMIT ?? 'dev',
        page: `${location.origin}${location.pathname}`,
        place: { world, pose: poseOfEye(eye, clock.hours, groundAt) },
        solarHours: solarHours(sun, eye.at),
        tiles: view.levels(eye.at),
      };
    },
    frameMs: () => frameMs,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(loop);
      observer.disconnect();
      controls.dispose();
      timeKeys?.dispose();
      pool.dispose();
      view.dispose();
      globe.geometry.dispose();
      lighting.dispose();
      renderer.dispose().catch(fail);
    },
  };
}
