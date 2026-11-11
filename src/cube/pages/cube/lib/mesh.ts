import { SURFACES } from '@/cube/shared/lib/surface';
import type { Quad, Room, Vec3 } from '@/cube/entities/world';

import { offsetOf, VERTEX_WORDS } from './vertex';

/**
 * What a face takes from the room it faces into: where that room stands in
 * the eye's frame, and the room's own word, flags and place on its floor as
 * the shader reads them.
 */
export type RoomLook = {
  origin: Vec3;
  side: number;
  seed: number;
  flags: number;
  cell: number;
};

/** One floor's run of vertices in a buffer: `count` of them from `first`. */
export type FloorRange = { n: number; first: number; count: number };

/** A vertex buffer, and which run of it belongs to which floor. */
export type Scenery = { data: ArrayBuffer; ranges: readonly FloorRange[] };

/**
 * Each corner's place across its face: a facet's corners start at the bottom
 * left of what is drawn on it, and a texture's rows run top down.
 */
const TEX = [
  [0, 1],
  [1, 1],
  [1, 0],
  [0, 0],
] as const;

/** Each quad's corners in the order of its two triangles. */
const FAN = [0, 1, 2, 0, 2, 3] as const;

const AT = {
  position: offsetOf('position'),
  normal: offsetOf('normal'),
  local: offsetOf('local'),
  tex: offsetOf('tex'),
  kind: offsetOf('kind'),
  seed: offsetOf('seed'),
  flags: offsetOf('flags'),
  paint: offsetOf('paint'),
  cell: offsetOf('cell'),
};

/**
 * The vertex buffer for `quads`, two triangles each, floor by floor from the
 * top: a floor is drawn by its own shader, so its quads are one run, in the
 * order they were given. The one place the world's doubles narrow to float32.
 */
export function pack(
  quads: readonly Quad[],
  lookOf: (room: Room) => RoomLook,
): Scenery {
  const sorted = quads.toSorted((a, b) => a.room.n - b.room.n);
  const data = new ArrayBuffer(sorted.length * FAN.length * VERTEX_WORDS * 4);
  const floats = new Float32Array(data);
  const words = new Uint32Array(data);
  const ranges: FloorRange[] = [];
  let at = 0;
  for (const { corners, normal, room, surface, paint } of sorted) {
    const { origin, side, seed, flags, cell } = lookOf(room);
    const kind = SURFACES.indexOf(surface);
    const range = ranges.at(-1);
    if (range?.n === room.n) range.count += FAN.length;
    else {
      ranges.push({ n: room.n, first: at / VERTEX_WORDS, count: FAN.length });
    }
    for (const corner of FAN) {
      const [x, y, z] = corners[corner];
      floats.set([x, y, z], at + AT.position);
      floats.set(normal, at + AT.normal);
      floats.set(
        [
          (x - origin[0]) / side,
          (y - origin[1]) / side,
          (z - origin[2]) / side,
        ],
        at + AT.local,
      );
      floats.set(TEX[corner], at + AT.tex);
      words[at + AT.kind] = kind;
      words[at + AT.seed] = seed;
      words[at + AT.flags] = flags;
      words[at + AT.paint] = paint ?? 0;
      words[at + AT.cell] = cell;
      at += VERTEX_WORDS;
    }
  }
  return { data, ranges };
}
