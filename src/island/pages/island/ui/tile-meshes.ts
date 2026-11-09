import {
  BufferAttribute,
  BufferGeometry,
  type Group,
  type Material,
  Mesh,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import type { Centred } from '@/scene/shared/lib/plane';

import type { CubeCell, Vec3 } from '@/island/shared/globe';
import {
  CUBE_MIN_LEVEL,
  cubeTileId,
  type TileKeyed,
  type TileMesh,
} from '@/island/entities/terrain';

import { colourHeights } from '../lib/colour-heights';
import { type FilledTile, orderId } from '../lib/tile-protocol';
import { HEIGHT_ATTRIBUTE } from './ground-lighting';

/** Tile variants held before the least recently drawn are let go. */
const CAPACITY = 900;

/** `centre` is the tile's world position, float64. */
type Held = TileKeyed<CubeCell> &
  Readonly<Centred<Vec3>> & {
    readonly meshes: readonly Mesh[];
    lastDrawn: number;
  };

/** Tiles held until disposed, which can all be let go at once. */
export type HeldTiles = CanDispose & {
  /** Lets every tile go, root tiles included, for a world rebuilt from scratch. */
  readonly clear: () => void;
};

/**
 * Held tiles by variant, an `orderId`: one cell can be held under several
 * neighbour levels at once.
 */
export type TileMeshes = HeldTiles & {
  readonly has: (id: string) => boolean;
  /** Whether some variant of the tile `cubeTileId` names is held. */
  readonly hasTile: (tileId: string) => boolean;
  /**
   * The first of `preferred` (variant ids of `key`) held, else the variant of
   * `key` added last, if any.
   */
  readonly variantOf: (
    key: CubeCell,
    preferred: readonly string[],
  ) => string | undefined;
  readonly add: (tile: FilledTile) => void;
  /**
   * Shows exactly the variants `ids`, each placed at its centre less `eye` —
   * the camera sits at the origin, so the subtraction is float64 and only the
   * small remainder reaches the GPU.
   */
  readonly draw: (ids: readonly string[], eye: Vec3) => void;
  /** Lets the least recently drawn go past `CAPACITY`, never one in `keep` nor a root tile. */
  readonly evict: (keep: ReadonlySet<string>) => void;
  readonly size: () => number;
};

/** A tile's geometry, carrying `colourBy` as the heights its material colours by. */
function geometryOf(
  mesh: TileMesh<CubeCell>,
  colourBy: Float32Array,
): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(mesh.positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(mesh.normals, 3));
  geometry.setAttribute(HEIGHT_ATTRIBUTE, new BufferAttribute(colourBy, 1));
  geometry.setIndex(new BufferAttribute(mesh.indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

type TileMeshesMaterials = { readonly land: Material; readonly sea: Material };

/** The tiles in hand as meshes under `group`, land in `land`, sea in `sea`. */
export function tileMeshes(
  group: Group,
  materials: TileMeshesMaterials,
): TileMeshes {
  const held = new Map<string, Held>();
  /** Each held tile's variant ids, in the order they were added. */
  const variants = new Map<string, string[]>();
  let frame = 0;

  const release = (id: string, entry: Held) => {
    for (const mesh of entry.meshes) {
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    held.delete(id);
    const tileId = cubeTileId(entry.key);
    const left = (variants.get(tileId) ?? []).filter((other) => other !== id);
    if (left.length === 0) variants.delete(tileId);
    else variants.set(tileId, left);
  };

  const clear = () => {
    for (const [id, entry] of held) release(id, entry);
  };

  return {
    has: (id) => held.has(id),
    hasTile: (tileId) => variants.has(tileId),
    variantOf: (key, preferred) =>
      preferred.find((id) => held.has(id)) ??
      variants.get(cubeTileId(key))?.at(-1),
    add: (tile) => {
      const { key, land, sea, floor } = tile;
      const id = orderId(tile);
      const known = held.get(id);
      if (known !== undefined) release(id, known);
      const meshes: Mesh[] = [];
      if (land !== null) {
        const colourBy = colourHeights(land.heights, land.grid);
        meshes.push(new Mesh(geometryOf(land, colourBy), materials.land));
      }
      if (sea !== null) {
        if (floor === null)
          throw new Error(`tile ${cubeTileId(key)}: no floor`);
        const colourBy = colourHeights(floor, sea.grid);
        meshes.push(new Mesh(geometryOf(sea, colourBy), materials.sea));
      }
      const source = land ?? sea;
      if (source === null)
        throw new Error(`tile ${cubeTileId(key)}: no surface`);
      const [cx = 0, cy = 0, cz = 0] = source.centre;
      for (const mesh of meshes) {
        mesh.visible = false;
        group.add(mesh);
      }
      held.set(id, { key, meshes, centre: [cx, cy, cz], lastDrawn: -1 });
      variants.set(cubeTileId(key), [
        ...(variants.get(cubeTileId(key)) ?? []),
        id,
      ]);
    },
    draw: (ids, eye) => {
      frame += 1;
      for (const entry of held.values()) {
        for (const mesh of entry.meshes) mesh.visible = false;
      }
      for (const id of ids) {
        const entry = held.get(id);
        if (entry === undefined) continue;
        entry.lastDrawn = frame;
        const [x, y, z] = entry.centre;
        for (const mesh of entry.meshes) {
          mesh.position.set(x - eye[0], y - eye[1], z - eye[2]);
          mesh.visible = true;
        }
      }
    },
    evict: (keep) => {
      if (held.size <= CAPACITY) return;
      const candidates = [...held.entries()]
        .filter(([id, { key }]) => !keep.has(id) && key.level > CUBE_MIN_LEVEL)
        .toSorted(([, a], [, b]) => a.lastDrawn - b.lastDrawn);
      for (const [id, entry] of candidates.slice(0, held.size - CAPACITY)) {
        release(id, entry);
      }
    },
    clear,
    size: () => held.size,
    dispose: clear,
  };
}
