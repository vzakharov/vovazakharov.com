import type { CubeCell, Vec3 } from '@/island/shared/globe';
import {
  type SphereField,
  tileBuffers,
  type TileKeyed,
  type TileMesh,
} from '@/island/entities/terrain';

/** A world as a worker builds it: its field and its terrain seed, which the main thread's `heightAtSphere` takes too. */
export type WorldField = {
  readonly field: SphereField;
  readonly seed: number;
};

/**
 * One tile as a worker sends it: the ground, and the sea at height zero over
 * the same lattice. A tile wholly under the sea has no land, since the sea
 * hides it; one wholly above it has no sea.
 */
export type FilledTile = TileKeyed<CubeCell> & {
  readonly land: TileMesh<CubeCell> | null;
  readonly sea: TileMesh<CubeCell> | null;
  /** The ground's heights under the sea's vertices, which the sea is coloured by; null with no sea. */
  readonly floor: Float32Array<ArrayBuffer> | null;
  /** The worker's time filling it, ms. */
  readonly fillMs: number;
};

export type WorkerRequest =
  | {
      readonly kind: 'init';
      /** The world number, a decimal string: the worker builds the field from it (its pinned row, if any). */
      readonly world: string;
      readonly sendField: boolean;
    }
  | {
      readonly kind: 'fill';
      readonly key: CubeCell;
      /** The eye (world metres) whose `cubeDetailCut` the tile is filled to. */
      readonly eye: Vec3;
    };

export type WorkerReply =
  | {
      readonly kind: 'built';
      readonly buildMs: number;
      /** A copy of the field (1024 × 2048 doubles, 16 MB), when `init` asked for it. */
      readonly field: SphereField | null;
      readonly seed: WorldField['seed'];
    }
  | { readonly kind: 'tile'; readonly tile: FilledTile }
  /** The build or a fill threw; the worker fills nothing more of what failed. */
  | { readonly kind: 'failed'; readonly message: string };

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
