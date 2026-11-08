import {
  BufferAttribute,
  BufferGeometry,
  type Group,
  type Material,
  Mesh,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import type { Centred } from '@/scene/shared/lib/plane';

import type { Vec3 } from '@/island/shared/globe';
import {
  MIN_LEVEL,
  tileId,
  type TileKey,
  type TileKeyed,
  type TileMesh,
} from '@/island/entities/terrain';

import { colourHeights } from '../lib/colour-heights';
import type { FilledTile } from '../lib/tile-protocol';
import { HEIGHT_ATTRIBUTE } from './ground-lighting';

/** Tiles held before the least recently drawn are let go. */
const CAPACITY = 900;

/** `centre` is the tile's world position, float64. */
type Held = TileKeyed &
  Readonly<Centred<Vec3>> & {
    readonly meshes: readonly Mesh[];
    lastDrawn: number;
  };

export type TileMeshes = CanDispose & {
  readonly has: (id: string) => boolean;
  readonly add: (tile: FilledTile) => void;
  /**
   * Shows exactly `keys`, each placed at its centre less `eye` — the camera
   * sits at the origin, so the subtraction is float64 and only the small
   * remainder reaches the GPU.
   */
  readonly draw: (keys: readonly TileKey[], eye: Vec3) => void;
  /** Lets the least recently drawn go past `CAPACITY`, never one in `keep` nor a root tile. */
  readonly evict: (keep: ReadonlySet<string>) => void;
  /** Lets every tile go, root tiles included, for a world rebuilt from scratch. */
  readonly clear: () => void;
  readonly size: () => number;
};

/** A tile's geometry, carrying `colourBy` as the heights its material colours by. */
function geometryOf(mesh: TileMesh, colourBy: Float32Array): BufferGeometry {
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
  let frame = 0;

  const release = (id: string, entry: Held) => {
    for (const mesh of entry.meshes) {
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    held.delete(id);
  };

  const clear = () => {
    for (const [id, entry] of held) release(id, entry);
  };

  return {
    has: (id) => held.has(id),
    add: ({ key, land, sea, floor }) => {
      const meshes: Mesh[] = [];
      if (land !== null) {
        const colourBy = colourHeights(land.heights, land.grid);
        meshes.push(new Mesh(geometryOf(land, colourBy), materials.land));
      }
      if (sea !== null) {
        if (floor === null) throw new Error(`tile ${tileId(key)}: no floor`);
        const colourBy = colourHeights(floor, sea.grid);
        meshes.push(new Mesh(geometryOf(sea, colourBy), materials.sea));
      }
      const source = land ?? sea;
      if (source === null) throw new Error(`tile ${tileId(key)}: no surface`);
      const [cx = 0, cy = 0, cz = 0] = source.centre;
      for (const mesh of meshes) {
        mesh.visible = false;
        group.add(mesh);
      }
      held.set(tileId(key), {
        key,
        meshes,
        centre: [cx, cy, cz],
        lastDrawn: -1,
      });
    },
    draw: (keys, eye) => {
      frame += 1;
      for (const entry of held.values()) {
        for (const mesh of entry.meshes) mesh.visible = false;
      }
      for (const key of keys) {
        const entry = held.get(tileId(key));
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
        .filter(([id, { key }]) => !keep.has(id) && key.level > MIN_LEVEL)
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
