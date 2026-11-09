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
import { indicesOutside } from '../model/piece-indices';
import type { Cut } from '../model/tile-cover';
import { HEIGHT_ATTRIBUTE } from './ground-lighting';

/** Tile variants held before the least recently drawn are let go. */
const CAPACITY = 900;

/** `centre` is the tile's world position, float64. */
type Held = TileKeyed<CubeCell> &
  Readonly<Centred<Vec3>> & {
    readonly meshes: readonly Surface[];
    /** The meshes drawing all of the tile but `cut`, the last such piece drawn. */
    partial: { readonly cut: string; readonly meshes: readonly Mesh[] } | null;
    lastDrawn: number;
  };

/** A surface's mesh and what it was built from, whose arrays it shares. */
type Surface = {
  readonly whole: Mesh;
  readonly built: TileMesh<CubeCell>;
};

/** A held variant to draw, all of it but the finer tiles `except`. */
export type DrawnPiece = Cut & { readonly id: string };

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
   * Shows exactly `pieces`, each placed at its centre less `eye` — the camera
   * sits at the origin, so the subtraction is float64 and only the small
   * remainder reaches the GPU.
   */
  readonly draw: (pieces: readonly DrawnPiece[], eye: Vec3) => void;
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

  /** Disposes `entry`'s partial meshes, never the attributes they share. */
  const dropPartial = (entry: Held) => {
    for (const mesh of entry.partial?.meshes ?? []) {
      group.remove(mesh);
      for (const name of Object.keys(mesh.geometry.attributes)) {
        mesh.geometry.deleteAttribute(name);
      }
      mesh.geometry.dispose();
    }
    entry.partial = null;
  };

  /** `entry`'s meshes cut to all but `except`, built once per cut. */
  const partialOf = (entry: Held, except: readonly CubeCell[]) => {
    const cut = except
      .map((key) => cubeTileId(key))
      .toSorted()
      .join(' ');
    if (entry.partial?.cut === cut) return entry.partial.meshes;
    dropPartial(entry);
    const meshes = entry.meshes.map(({ whole, built: { grid, indices } }) => {
      const geometry = new BufferGeometry();
      for (const [name, attribute] of Object.entries(
        whole.geometry.attributes,
      )) {
        geometry.setAttribute(name, attribute);
      }
      geometry.setIndex(
        new BufferAttribute(
          indicesOutside(indices, grid, entry.key, except),
          1,
        ),
      );
      geometry.boundingSphere = whole.geometry.boundingSphere;
      const cutMesh = new Mesh(geometry, whole.material);
      cutMesh.visible = false;
      group.add(cutMesh);
      return cutMesh;
    });
    entry.partial = { cut, meshes };
    return meshes;
  };

  const release = (id: string, entry: Held) => {
    dropPartial(entry);
    for (const { whole: mesh } of entry.meshes) {
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
      const meshes: Surface[] = [];
      const surface = (
        built: TileMesh<CubeCell>,
        colourBy: Float32Array,
        material: Material,
      ): Surface => {
        return {
          whole: new Mesh(geometryOf(built, colourBy), material),
          built,
        };
      };
      if (land !== null) {
        const colourBy = colourHeights(land.heights, land.grid);
        meshes.push(surface(land, colourBy, materials.land));
      }
      if (sea !== null) {
        if (floor === null)
          throw new Error(`tile ${cubeTileId(key)}: no floor`);
        const colourBy = colourHeights(floor, sea.grid);
        meshes.push(surface(sea, colourBy, materials.sea));
      }
      const source = land ?? sea;
      if (source === null)
        throw new Error(`tile ${cubeTileId(key)}: no surface`);
      const [cx = 0, cy = 0, cz = 0] = source.centre;
      for (const { whole: mesh } of meshes) {
        mesh.visible = false;
        group.add(mesh);
      }
      held.set(id, {
        key,
        meshes,
        partial: null,
        centre: [cx, cy, cz],
        lastDrawn: -1,
      });
      variants.set(cubeTileId(key), [
        ...(variants.get(cubeTileId(key)) ?? []),
        id,
      ]);
    },
    draw: (pieces, eye) => {
      frame += 1;
      for (const entry of held.values()) {
        for (const { whole: mesh } of entry.meshes) mesh.visible = false;
        for (const mesh of entry.partial?.meshes ?? []) mesh.visible = false;
      }
      for (const { id, except } of pieces) {
        const entry = held.get(id);
        if (entry === undefined) continue;
        entry.lastDrawn = frame;
        const [x, y, z] = entry.centre;
        const meshes =
          except.length === 0
            ? entry.meshes.map(({ whole }) => whole)
            : partialOf(entry, except);
        for (const mesh of meshes) {
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
