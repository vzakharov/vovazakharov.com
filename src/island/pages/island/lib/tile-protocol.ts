import type { Vec3 } from '@/island/shared/globe';
import {
  type CoastField,
  tileBuffers,
  type TileKey,
  type TileKeyed,
  type TileMesh,
} from '@/island/entities/terrain';

/** A world as a worker builds it: its field and its terrain seed, which the main thread's `heightAt` takes too. */
export type WorldField = {
  readonly field: CoastField;
  readonly seed: number;
};

/**
 * One tile as a worker sends it: the ground, and the sea at height zero over
 * the same lattice. A tile wholly under the sea has no land, since the sea
 * hides it; one wholly above it has no sea.
 */
export type FilledTile = TileKeyed & {
  readonly land: TileMesh | null;
  readonly sea: TileMesh | null;
  /** The ground's heights under the sea's vertices, which the sea is coloured by; null with no sea. */
  readonly floor: Float32Array<ArrayBuffer> | null;
  /** The worker's time filling it, ms. */
  readonly fillMs: number;
};

export type WorkerRequest =
  | {
      readonly kind: 'init';
      /** The world number, a decimal string: the worker builds the field from it. */
      readonly world: string;
      readonly sendField: boolean;
    }
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
      readonly seed: WorldField['seed'];
    }
  | { readonly kind: 'tile'; readonly tile: FilledTile };

/** The buffers of a filled tile, for `postMessage`'s transfer list. */
export const filledBuffers = ({
  land,
  sea,
  floor,
}: FilledTile): ArrayBuffer[] => [
  ...(land === null ? [] : tileBuffers(land)),
  ...(sea === null ? [] : tileBuffers(sea)),
  ...(floor === null ? [] : [floor.buffer]),
];
