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

import {
  type CubeCell,
  dot,
  FACES,
  length,
  R,
  sub,
  unit,
  type Vec3,
} from '@/island/shared/globe';
import {
  type CoastDistance,
  CUBE_MIN_LEVEL,
  cubeTileId,
  frustumOf,
  heightAtSphere,
  sampleSphereField,
  selectCubeTiles,
  type SphereField,
} from '@/island/entities/terrain';
import {
  bindEyeControls,
  type GlobeEye as Eye,
  globeEyeAt as eyeAt,
  type GlobeGroundAt as GroundAt,
  globePoseOf as poseOf,
  headingOf,
  MAX_HEIGHT,
  openingOf,
  stepOnGlobe as step,
  STILL,
  withGlobeHeading as withHeading,
  withGlobeHeight as withHeight,
} from '@/island/features/eye';

import { skyColour } from '../lib/sky-colour';
import { startTilePool, type TilePool } from '../lib/tile-pool';
import { coverAround, coverOf } from '../model/tile-cover';
import { groundLighting } from './ground-lighting';
import { tileMeshes } from './tile-meshes';

export type IslandScene = CanDispose & {
  /** Resolves once the first frame is drawn. */
  readonly ready: Promise<void>;
  /** Steps the eye `dt` seconds by the player's input (none under play) and draws. */
  readonly frame: (dt: number) => void;
  /** Puts the eye `m` metres up; resolves once every tile it then selects is drawn. */
  readonly setHeight: (m: number) => Promise<void>;
  /** Puts the eye `m` metres over latitude `lat`, longitude `lon` (degrees, east positive), its heading kept, resolving as `setHeight` does. */
  readonly moveTo: (lat: number, lon: number, m: number) => Promise<void>;
  /** Turns the eye to `heading`, resolving as `setHeight` does. */
  readonly turnTo: (heading: number) => Promise<void>;
  /** `'webgpu'` or `'webgl2'`, once ready. */
  readonly backend: () => string;
  /**
   * Rebuilds the scene on world `world`: every tile held or in flight is
   * dropped and refilled from the new field, the eye left where it is.
   */
  readonly setWorld: (world: string) => void;
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

/** A move under this share of the height reuses the last tile selection. */
const RESELECT_SHARE = 0.02;
/**
 * Cosine of the turn that reselects: half the frustum's margin, so the view
 * never turns past the tiles selected for it.
 */
const RESELECT_TURN = Math.cos(0.05);

/** Every root tile, on every face: always held, so a missing tile always has an ancestor to stand in. */
const ROOTS: CubeCell[] = FACES.flatMap((face) =>
  Array.from({ length: 4 ** CUBE_MIN_LEVEL }, (_, i) => ({
    face,
    level: CUBE_MIN_LEVEL,
    x: i % 2 ** CUBE_MIN_LEVEL,
    y: Math.floor(i / 2 ** CUBE_MIN_LEVEL),
  })),
);

type MountIslandSceneParams = {
  /** The world number the scene opens on. */
  world: string;
  play: boolean;
  onError: (error: Error) => void;
};

/**
 * The island's scene on `canvas`: three's WebGPU renderer, which falls back
 * to WebGL 2 by itself, with a logarithmic depth buffer, the one depth mode
 * both backends keep from orbit to two metres. The camera sits at the
 * origin; everything else is placed relative to the eye each frame.
 */
export function mountIslandScene(
  canvas: HTMLCanvasElement,
  { world: firstWorld, play, onError }: MountIslandSceneParams,
): IslandScene {
  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  const scene = new Scene();
  const background = new Color(skyColour(MAX_HEIGHT));
  scene.background = background;
  const camera = new PerspectiveCamera(50, 1, NEAR, FAR);

  const lighting = groundLighting();
  const { land, sea, ocean, sky, lights } = lighting;
  const globe = new Mesh(new SphereGeometry(GLOBE_RADIUS, 256, 128), ocean);
  const tiles = new Group();
  scene.add(globe, tiles, ...lights);

  const held = tileMeshes(tiles, { land, sea });
  const controls = bindEyeControls(canvas);

  let eye: Eye | null = null;
  let groundAt = SEA_LEVEL;
  /** The coast the selection refines along, once the field arrives. */
  let coast: CoastDistance | undefined;
  let selection: {
    at: Vec3;
    scale: number;
    forward: Vec3;
    aspect: number;
    keys: CubeCell[];
  } | null = null;
  /** The last selection wholly in hand, drawn while a newer one loads. */
  let shown: CubeCell[] | null = null;
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
        held.add(tile);
        const keys = selected();
        held.evict(
          new Set([...keys, ...(shown ?? [])].map((key) => cubeTileId(key))),
        );
        showIfComplete(keys);
        settle();
      },
      (error) => {
        if (current()) fail(error);
      },
    );
    started.field.then(
      ({ field, seed }) => {
        if (!current()) return;
        coast = coastOf(field);
        groundAt = groundOf(coast, seed);
        selection = null;
        landed.resolve();
      },
      (error: unknown) => {
        if (!current()) return;
        fail(error instanceof Error ? error : new Error(String(error)));
      },
    );
    return started;
  };
  let pool = startPool(world);

  /**
   * The tiles the eye selects now, reselected once it has moved enough or
   * the view has turned toward the edge of the frustum's margin.
   */
  function selected(): CubeCell[] {
    if (eye === null) return [];
    const { aspect } = camera;
    const { position: at, forward, up, fov } = poseOf(eye, aspect);
    if (
      selection !== null &&
      length(sub(at, selection.at)) < RESELECT_SHARE * eye.height &&
      Math.abs(Math.log(eye.height / selection.scale)) < RESELECT_SHARE &&
      dot(forward, selection.forward) > RESELECT_TURN &&
      aspect === selection.aspect
    ) {
      return selection.keys;
    }
    const keys = selectCubeTiles(at, {
      coast,
      frustum: frustumOf(forward, up, fov, aspect),
      ground: groundAt,
    });
    selection = { at, scale: eye.height, forward, aspect, keys };
    // The selection repeats roots when it reaches up to them.
    const wanted = new Map(
      [...ROOTS, ...keys].map((key) => [cubeTileId(key), key] as const),
    );
    const missing = [...wanted].flatMap(([id, key]) =>
      held.has(id) ? [] : [key],
    );
    pool.want(missing, at);
    return keys;
  }

  function complete(keys: readonly CubeCell[]): boolean {
    return keys.every((key) => held.has(cubeTileId(key)));
  }

  function showIfComplete(keys: CubeCell[]): void {
    if (keys.length > 0 && complete(keys)) shown = keys;
  }

  function render(): void {
    if (eye === null) return;
    const pose = poseOf(eye, camera.aspect);
    const [ex, ey, ez] = pose.position;
    const keys = selected();
    showIfComplete(keys);
    held.draw(
      shown === null
        ? coverOf(keys, held.has)
        : coverAround(keys, shown, held.has),
      pose.position,
    );
    globe.position.set(-ex, -ey, -ez);
    camera.fov = (pose.fov * 180) / Math.PI;
    camera.updateProjectionMatrix();
    camera.up.set(...pose.up);
    camera.lookAt(...pose.forward);
    sky.position.set(...unit(pose.position));
    background.setHex(skyColour(eye.height));
    renderer.render(scene, camera);
  }

  /** Draws and lets every placing of the eye go whose tiles are all in hand. */
  function settle(): void {
    if (waiting.length === 0 || eye === null) return;
    if (!complete(selected())) return;
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

  const frame = (dt: number) => {
    if (eye === null) return;
    eye = step(eye, play ? STILL : controls.read(), dt, groundAt);
    render();
  };

  let loop = 0;
  let last = 0;
  const tick = (now: number) => {
    frame(Math.min(0.1, (now - last) / 1000));
    last = now;
    loop = requestAnimationFrame(tick);
  };

  const live = () => !disposed;
  const ready = (async () => {
    await Promise.all([landed.promise, renderer.init()]);
    if (!live()) return;
    eye = eyeAt(openingOf(Number(world)), groundAt);
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

  return {
    ready,
    frame,
    setHeight: async (m) => placed((from) => withHeight(from, m)),
    moveTo: async (lat, lon, m) => {
      // Tiles shown elsewhere say nothing of the ground under the new eye.
      shown = null;
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
    turnTo: async (heading) => placed((from) => withHeading(from, heading)),
    backend: () =>
      'isWebGPUBackend' in renderer.backend &&
      renderer.backend.isWebGPUBackend === true
        ? 'webgpu'
        : 'webgl2',
    setWorld: (next) => {
      if (next === world || disposed) return;
      world = next;
      pool.dispose();
      held.clear();
      selection = null;
      // Its tiles went with the clear above; kept, it would bar their stand-ins.
      shown = null;
      // The old coast would refine the selection where the new one has none.
      coast = undefined;
      pool = startPool(next);
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(loop);
      observer.disconnect();
      controls.dispose();
      pool.dispose();
      held.dispose();
      globe.geometry.dispose();
      lighting.dispose();
      renderer.dispose().catch(fail);
    },
  };
}
