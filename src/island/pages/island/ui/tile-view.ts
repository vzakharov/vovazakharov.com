import type { Group, Material } from 'three/webgpu';

import {
  type CubeCell,
  dot,
  FACES,
  length,
  sphereToFace,
  sub,
  type Vec3,
} from '@/island/shared/globe';
import {
  type CoastDistance,
  CUBE_MIN_LEVEL,
  cubeTileId,
  frustumOf,
  selectCubeTiles,
  tileHolds,
} from '@/island/entities/terrain';
import { type Eye, type GroundAt, poseOf } from '@/island/features/eye';

import type { FilledTile } from '../lib/tile-protocol';
import type { Where } from '../lib/where-line';
import { coverAround, coverOf } from '../model/tile-cover';
import { type HeldTiles, tileMeshes } from './tile-meshes';

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

/** What the selection reads of the world the scene stands on, now. */
type Ground = {
  /** The coast the selection refines along, once the field arrives. */
  readonly coast: CoastDistance | undefined;
  readonly groundAt: GroundAt;
};

type TileViewParams = {
  readonly materials: { readonly land: Material; readonly sea: Material };
  readonly ground: () => Ground;
  /** Asks for the `missing` tiles, nearest `at` first. */
  readonly want: (missing: CubeCell[], at: Vec3) => void;
};

export type TileView = HeldTiles & {
  /**
   * The tiles `eye` selects on a screen of `aspect`, reselected once it has
   * moved enough or the view has turned toward the edge of the frustum's
   * margin; asks for every one not in hand.
   */
  readonly selected: (eye: Eye, aspect: number) => CubeCell[];
  /** Whether every tile `eye` selects is in hand. */
  readonly complete: (eye: Eye, aspect: number) => boolean;
  /** Takes a tile in, letting the least recently drawn go past capacity. */
  readonly add: (tile: FilledTile, eye: Eye | null, aspect: number) => void;
  /** Shows what `eye` selects, stood in for by what is in hand. */
  readonly draw: (eye: Eye, aspect: number) => void;
  /** Forgets the selection, so the next one is made afresh. */
  readonly reselect: () => void;
  /** Forgets what was last shown whole, which says nothing of a new place. */
  readonly forgetShown: () => void;
  /** Levels of the tiles last drawn over direction `at`, and of every one drawn. */
  readonly levels: (at: Vec3) => Where['tiles'];
};

/**
 * The tiles under `group`: which ones the eye selects, which are in hand, and
 * the last selection wholly in hand, drawn while a newer one loads.
 */
export function tileView(
  group: Group,
  { materials, ground, want }: TileViewParams,
): TileView {
  const held = tileMeshes(group, materials);
  let selection: {
    at: Vec3;
    scale: number;
    forward: Vec3;
    aspect: number;
    keys: CubeCell[];
  } | null = null;
  /** The last selection wholly in hand, drawn while a newer one loads. */
  let shown: CubeCell[] | null = null;
  let drawn: readonly CubeCell[] = [];

  function selected(eye: Eye, aspect: number): CubeCell[] {
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
    const { coast, groundAt } = ground();
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
    want(missing, at);
    return keys;
  }

  const inHand = (keys: readonly CubeCell[]) =>
    keys.every((key) => held.has(cubeTileId(key)));

  const showIfComplete = (keys: CubeCell[]) => {
    if (keys.length > 0 && inHand(keys)) shown = keys;
  };

  return {
    selected,
    complete: (eye, aspect) => inHand(selected(eye, aspect)),
    add: (tile, eye, aspect) => {
      held.add(tile);
      const keys = eye === null ? [] : selected(eye, aspect);
      held.evict(
        new Set([...keys, ...(shown ?? [])].map((key) => cubeTileId(key))),
      );
      showIfComplete(keys);
    },
    draw: (eye, aspect) => {
      const keys = selected(eye, aspect);
      showIfComplete(keys);
      drawn =
        shown === null
          ? coverOf(keys, held.has)
          : coverAround(keys, shown, held.has);
      held.draw(drawn, poseOf(eye, aspect).position);
    },
    levels: (at) => {
      const point = sphereToFace(at);
      return {
        under: drawn.filter((key) => tileHolds(key, point)).map((k) => k.level),
        drawn: drawn.map((key) => key.level),
      };
    },
    reselect: () => {
      selection = null;
    },
    forgetShown: () => {
      shown = null;
    },
    clear: () => {
      held.clear();
      selection = null;
      // Its tiles went with the clear; kept, it would bar their stand-ins.
      shown = null;
      drawn = [];
    },
    dispose: () => {
      held.dispose();
    },
  };
}
