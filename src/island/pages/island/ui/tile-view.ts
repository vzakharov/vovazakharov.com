import type { Group } from 'three/webgpu';

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
  type NeighbourLevels,
  neighbourLevels,
  selectCubeTiles,
  tileHolds,
} from '@/island/entities/terrain';
import { type Eye, type GroundAt, poseOf } from '@/island/features/eye';

import { type FilledTile, orderId, type TileOrder } from '../lib/tile-protocol';
import type { Where } from '../lib/where-line';
import { type CoverPiece, finestCover, standInsOf } from '../model/tile-cover';
import type { StandInMaterials } from './ground-lighting';
import { type DrawnPiece, type HeldTiles, tileMeshes } from './tile-meshes';

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

/** Every edge and corner at `level`: the levels of a tile nothing coarser meets. */
const flatLevels = (level: number): NeighbourLevels => ({
  edges: { right: level, left: level, up: level, down: level },
  corners: { sw: level, se: level, nw: level, ne: level },
});

/**
 * Each of `cells` meeting only its own level, by variant id: roots and
 * stand-ins, drawn cut and behind finer tiles, so held unstitched.
 */
const unstitched = (cells: readonly CubeCell[]): Map<string, TileOrder> =>
  new Map(
    cells.map((key) => {
      const order = { key, levels: flatLevels(key.level) };
      return [orderId(order), order] as const;
    }),
  );

/** Each tile of `cover` with the levels it meets there, by tile id. */
function ordersOf(cover: readonly CubeCell[]): Map<string, TileOrder> {
  const levels = neighbourLevels(cover);
  return new Map(
    cover.map((key) => {
      const id = cubeTileId(key);
      return [id, { key, levels: levels.get(id) ?? flatLevels(key.level) }];
    }),
  );
}

/** What the selection reads of the world the scene stands on, now. */
type Ground = {
  /** The coast the selection refines along, once the field arrives. */
  readonly coast: CoastDistance | undefined;
  readonly groundAt: GroundAt;
};

type TileViewParams = {
  readonly materials: StandInMaterials;
  readonly ground: () => Ground;
  /**
   * Asks for the missing tile variants, the stand-ins `first` before the
   * `rest`, each nearest `at` first.
   */
  readonly want: (first: TileOrder[], rest: TileOrder[], at: Vec3) => void;
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
    /** Each selected tile stitched to the selection, by tile id. */
    orders: Map<string, TileOrder>;
    /** The tiles held to stand in for the selection while it loads, by variant id. */
    standIns: Map<string, TileOrder>;
  } | null = null;
  /** The last selection wholly in hand, drawn while a newer one loads. */
  let shown: {
    keys: CubeCell[];
    orders: ReadonlyMap<string, TileOrder>;
  } | null = null;
  let drawn: readonly CoverPiece[] = [];
  /** The last cover drawn, by its ids in order, and its tiles' levels. */
  let coverLevels: {
    ids: string;
    orders: ReadonlyMap<string, TileOrder>;
  } = { ids: '', orders: new Map() };

  /** The variant ids `selection` and `shown` stand on. */
  const standing = () => [
    ...[
      ...(selection?.orders.values() ?? []),
      ...(shown?.orders.values() ?? []),
    ].map((order) => orderId(order)),
    ...(selection?.standIns.keys() ?? []),
  ];

  const missing = (wanted: ReadonlyMap<string, TileOrder>) =>
    [...wanted].flatMap(([id, order]) => (held.has(id) ? [] : [order]));

  function select(eye: Eye, aspect: number) {
    const { position: at, forward, up, fov } = poseOf(eye, aspect);
    if (
      selection !== null &&
      length(sub(at, selection.at)) < RESELECT_SHARE * eye.height &&
      Math.abs(Math.log(eye.height / selection.scale)) < RESELECT_SHARE &&
      dot(forward, selection.forward) > RESELECT_TURN &&
      aspect === selection.aspect
    ) {
      return selection;
    }
    const { coast, groundAt } = ground();
    const keys = selectCubeTiles(at, {
      coast,
      frustum: frustumOf(forward, up, fov, aspect),
      ground: groundAt,
    });
    const orders = ordersOf(keys);
    // The selection repeats a root when it reaches up to one, under the same
    // levels.
    const standIns = unstitched(standInsOf(keys));
    selection = {
      at,
      scale: eye.height,
      forward,
      aspect,
      keys,
      orders,
      standIns,
    };
    const rest = new Map([
      ...unstitched(ROOTS),
      ...[...orders.values()].map((order) => [orderId(order), order] as const),
    ]);
    for (const id of standIns.keys()) rest.delete(id);
    want(missing(standIns), missing(rest), at);
    return selection;
  }

  const inHand = (orders: ReadonlyMap<string, TileOrder>) =>
    [...orders.values()].every((order) => held.has(orderId(order)));

  const showIfComplete = (eye: Eye, aspect: number) => {
    const { keys, orders } = select(eye, aspect);
    if (keys.length > 0 && inHand(orders)) shown = { keys, orders };
    return keys;
  };

  /**
   * The variant to draw of each piece of `cover`: the one stitched to `cover`
   * itself where held, else the one the shown or the current selection
   * stands on, else the one held last. In hand, the selection is its own
   * cover; a cover mixing the shown with new tiles falls back, and the skirt
   * hides the step as it does unstitched.
   */
  const variantsFor = (cover: readonly CoverPiece[]): DrawnPiece[] => {
    const ids = cover.map(({ key }) => cubeTileId(key)).join(' ');
    if (ids !== coverLevels.ids) {
      coverLevels = { ids, orders: ordersOf(cover.map(({ key }) => key)) };
    }
    const own = coverLevels.orders;
    return cover.flatMap(({ key, except }) => {
      const tileId = cubeTileId(key);
      const preferred = [own, shown?.orders, selection?.orders].flatMap(
        (orders) => {
          const order = orders?.get(tileId);
          return order === undefined ? [] : [orderId(order)];
        },
      );
      const id = held.variantOf(key, preferred);
      return id === undefined ? [] : [{ id, except }];
    });
  };

  return {
    selected: (eye, aspect) => select(eye, aspect).keys,
    complete: (eye, aspect) => inHand(select(eye, aspect).orders),
    add: (tile, eye, aspect) => {
      held.add(tile);
      if (eye !== null) showIfComplete(eye, aspect);
      held.evict(new Set(standing()));
    },
    draw: (eye, aspect) => {
      const keys = showIfComplete(eye, aspect);
      drawn = finestCover(keys, shown?.keys ?? [], held.hasTile);
      held.draw(variantsFor(drawn), poseOf(eye, aspect).position);
    },
    levels: (at) => {
      const point = sphereToFace(at);
      return {
        under: drawn
          .filter(
            ({ key, except }) =>
              tileHolds(key, point) &&
              !except.some((cut) => tileHolds(cut, point)),
          )
          .map(({ key }) => key.level),
        drawn: drawn.map(({ key }) => key.level),
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
