import type { Vec3 } from '@/island/shared/globe';
import {
  type CoastField,
  tileBuffers,
  type TileKey,
  type TileKeyed,
  type TileMesh,
} from '@/island/entities/terrain';

/** The terrain's seed, the same in every worker and on the main thread. */
export const SEED = 1;

/** The ground, coloured by height. */
export type Land = TileMesh & { readonly colours: Float32Array<ArrayBuffer> };

/**
 * One tile as a worker sends it: the ground, and the sea at height zero over
 * the same lattice. A tile wholly under the sea has no land, since the sea
 * hides it; one wholly above it has no sea.
 */
export type FilledTile = TileKeyed & {
  readonly land: Land | null;
  readonly sea: TileMesh | null;
  /** The worker's time filling it, ms. */
  readonly fillMs: number;
};

export type WorkerRequest =
  | { readonly kind: 'init'; readonly sendField: boolean }
  | {
      readonly kind: 'fill';
      readonly key: TileKey;
      /** The eye (world metres) whose `detailCut` the tile is filled to. */
      readonly eye: Vec3;
    };

export type WorkerReply =
  | {
      readonly kind: 'built';
      readonly buildMs: number;
      /** A copy of the field, when `init` asked for it. */
      readonly field: CoastField | null;
    }
  | { readonly kind: 'tile'; readonly tile: FilledTile };

/** The buffers of a filled tile, for `postMessage`'s transfer list. */
export const filledBuffers = ({ land, sea }: FilledTile): ArrayBuffer[] => [
  ...(land === null ? [] : [...tileBuffers(land), land.colours.buffer]),
  ...(sea === null ? [] : tileBuffers(sea)),
];
