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

import { R, type Vec3 } from '@/island/shared/globe';
import {
  type CoastField,
  heightAt,
  MIN_LEVEL,
  selectTiles,
  tileId,
  type TileKey,
} from '@/island/entities/terrain';
import {
  bindEyeControls,
  type Eye,
  eyeAt,
  type GroundAt,
  IDLE,
  MAX_HEIGHT,
  poseOf,
  step,
  withHeight,
} from '@/island/features/eye';

import { skyColour } from '../lib/sky-colour';
import { startTilePool } from '../lib/tile-pool';
import { SEED } from '../lib/tile-protocol';
import { coverOf } from '../model/tile-cover';
import { groundLighting } from './ground-lighting';
import { tileMeshes } from './tile-meshes';

export type IslandScene = CanDispose & {
  /** Resolves once the first frame is drawn. */
  readonly ready: Promise<void>;
  /** Steps the eye `dt` seconds by the player's input (none under play) and draws. */
  readonly frame: (dt: number) => void;
  /** Puts the eye `m` metres up; resolves once every tile it then selects is drawn. */
  readonly setHeight: (m: number) => Promise<void>;
  /** `'webgpu'` or `'webgl2'`, once ready. */
  readonly backend: () => string;
};

/** Closest the camera sees: the eye is never under two metres up. */
const NEAR = 0.5;
/** Past the far side of the planet from `MAX_HEIGHT`. */
const FAR = 4 * (R + MAX_HEIGHT);

const unit = (v: Vec3): Vec3 => {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
};

/** Ground before the field arrives; nothing reads it before then. */
const SEA_LEVEL: GroundAt = () => 0;

const groundOf =
  (field: CoastField): GroundAt =>
  (x, y) =>
    heightAt(field, SEED, x, y);

/**
 * The globe outside the tiles, and under them before they load: a sphere
 * whose facets' sag stays below the tiles' sea, so it never shows through.
 */
const GLOBE_RADIUS = R - 1500;

/** A move under this share of the height reuses the last tile selection. */
const RESELECT_SHARE = 0.02;

/** Every root tile: always held, so a missing tile always has an ancestor to stand in. */
const ROOTS: TileKey[] = Array.from({ length: 4 ** MIN_LEVEL }, (_, i) => ({
  level: MIN_LEVEL,
  x: i % 2 ** MIN_LEVEL,
  y: Math.floor(i / 2 ** MIN_LEVEL),
}));

type MountIslandSceneParams = {
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
  { play, onError }: MountIslandSceneParams,
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
  const { land, sea, sky, lights } = lighting;
  const globe = new Mesh(new SphereGeometry(GLOBE_RADIUS, 256, 128), sea);
  const tiles = new Group();
  scene.add(globe, tiles, ...lights);

  const held = tileMeshes(tiles, { land, sea });
  const controls = bindEyeControls(canvas);

  let eye: Eye | null = null;
  let groundAt = SEA_LEVEL;
  /** The coast the selection refines along, once the field arrives. */
  let coast: CoastField | undefined;
  let selection: { at: Vec3; scale: number; keys: TileKey[] } | null = null;
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

  const pool = startTilePool((tile) => {
    if (disposed) return;
    held.add(tile);
    held.evict(new Set(selected().map((key) => tileId(key))));
    settle();
  }, fail);

  /** The tiles the eye selects now, reselected once it has moved enough. */
  function selected(): TileKey[] {
    if (eye === null) return [];
    const at = poseOf(eye, camera.aspect).position;
    if (
      selection !== null &&
      Math.hypot(
        at[0] - selection.at[0],
        at[1] - selection.at[1],
        at[2] - selection.at[2],
      ) <
        RESELECT_SHARE * eye.height &&
      Math.abs(Math.log(eye.height / selection.scale)) < RESELECT_SHARE
    ) {
      return selection.keys;
    }
    const keys = selectTiles(at, { coast });
    selection = { at, scale: eye.height, keys };
    // The selection repeats roots when it reaches up to them.
    const wanted = new Map(
      [...ROOTS, ...keys].map((key) => [tileId(key), key] as const),
    );
    const missing = [...wanted].flatMap(([id, key]) =>
      held.has(id) ? [] : [key],
    );
    pool.want(missing, eye.x, eye.y);
    return keys;
  }

  function render(): void {
    if (eye === null) return;
    const pose = poseOf(eye, camera.aspect);
    const [ex, ey, ez] = pose.position;
    held.draw(coverOf(selected(), held.has), pose.position);
    globe.position.set(-ex, -ey, -ez);
    camera.fov = (pose.fov * 180) / Math.PI;
    camera.updateProjectionMatrix();
    camera.up.set(...pose.up);
    camera.lookAt(...pose.forward);
    sky.position.set(...unit(pose.position));
    background.setHex(skyColour(eye.height));
    renderer.render(scene, camera);
  }

  /** Draws and lets every `setHeight` go whose tiles are all in hand. */
  function settle(): void {
    if (waiting.length === 0 || eye === null) return;
    if (!selected().every((key) => held.has(tileId(key)))) return;
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
    eye = step(eye, play ? IDLE : controls.read(), dt, groundAt);
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
    const [{ field }] = await Promise.all([pool.field, renderer.init()]);
    if (!live()) return;
    groundAt = groundOf(field);
    coast = field;
    eye = eyeAt({ x: 0, y: 0, height: MAX_HEIGHT }, groundAt);
    resize();
    render();
    if (!play) {
      last = performance.now();
      loop = requestAnimationFrame(tick);
    }
  })();
  ready.catch(fail);

  return {
    ready,
    frame,
    setHeight: async (m) => {
      if (failure !== null) throw failure;
      if (eye === null) throw new Error('scene not ready');
      eye = withHeight(eye, m);
      const done = new Promise<void>((resolve, reject) => {
        waiting.push({ resolve, reject });
      });
      settle();
      return done;
    },
    backend: () =>
      'isWebGPUBackend' in renderer.backend &&
      renderer.backend.isWebGPUBackend === true
        ? 'webgpu'
        : 'webgl2',
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
