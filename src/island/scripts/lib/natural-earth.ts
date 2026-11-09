/**
 * Natural Earth's 1:50m land, lakes and Antarctic ice shelves, fetched at one
 * pinned commit, checked against their sha256 and cached under gitignored
 * `tmp/`; never committed.
 *
 * Natural Earth — public domain (naturalearthdata.com/about/terms-of-use).
 * Made with Natural Earth.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19';

const LAYERS = {
  land: {
    file: 'ne_50m_land.geojson',
    sha256: 'e874b27a51d146452be360cafb3cc50c86001074a67d534113e6534682f9826b',
  },
  lakes: {
    file: 'ne_50m_lakes.geojson',
    sha256: 'd350b75978b26fe839b797c2c529b2fb8f47fb3983c03f4964e36d5df9378a52',
  },
  shelves: {
    file: 'ne_50m_antarctic_ice_shelves_polys.geojson',
    sha256: 'fedf866d20e20e37d037fa19968b6d3022fbe5323fd8728527b0f0ddb547e790',
  },
} as const;

export type LayerName = keyof typeof LAYERS;

const CACHE = path.join(REPO_ROOT, 'tmp', 'island', 'natural-earth', COMMIT);

/** `[lon, lat]` in degrees; any further ordinate is ignored. */
const Position = z
  .array(z.number())
  .min(2)
  .transform(([lon = 0, lat = 0]) => [lon, lat] as const)
  .refine(([lon, lat]) => Math.abs(lon) <= 180 && Math.abs(lat) <= 90);

/** A closed ring: its last position repeats its first. */
const LinearRing = z
  .array(Position)
  .min(4)
  .refine((ring) => {
    const [x0, y0] = ring[0] ?? [];
    const [x1, y1] = ring.at(-1) ?? [];
    return x0 === x1 && y0 === y1;
  }, 'ring not closed');

/** An exterior ring, then its holes. */
const PolygonRings = z.array(LinearRing).min(1);

const Geometry = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Polygon'), coordinates: PolygonRings }),
  z.object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(PolygonRings),
  }),
]);

const FeatureCollection = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.literal('Feature'),
      properties: z.record(z.string(), z.unknown()).nullable(),
      geometry: Geometry,
    }),
  ),
});

/** One polygon: its exterior ring, then its holes, `[lon, lat]` in degrees. */
export type GeoPolygon = z.infer<typeof PolygonRings>;

type Feature = z.infer<typeof FeatureCollection>['features'][number];

const featurePolygons = ({ geometry }: Feature): GeoPolygon[] =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

/** A layer's polygons, each feature's MultiPolygon flattened. */
export function layerPolygons(json: unknown): GeoPolygon[] {
  return FeatureCollection.parse(json).features.flatMap((feature) =>
    featurePolygons(feature),
  );
}

/** The polygons of each feature whose `name` property is one of `names`, by name. */
export function namedPolygons(
  json: unknown,
  names: readonly string[],
): Map<string, GeoPolygon[]> {
  const found = new Map<string, GeoPolygon[]>();
  for (const feature of FeatureCollection.parse(json).features) {
    const name = feature.properties?.name;
    if (typeof name !== 'string' || !names.includes(name)) continue;
    found.set(name, [...(found.get(name) ?? []), ...featurePolygons(feature)]);
  }
  return found;
}

const sha256 = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex');

/** A layer's bytes, from the cache or else fetched; either way hash-checked. */
async function layerBytes(name: LayerName): Promise<Buffer> {
  const { file, sha256: expected } = LAYERS[name];
  const cached = path.join(CACHE, file);
  const bytes = await readFile(cached).catch((error: unknown) => {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  });
  if (bytes) {
    const actual = sha256(bytes);
    if (actual !== expected) {
      throw new Error(`${cached}: sha256 ${actual}, expected ${expected}`);
    }
    return bytes;
  }
  const url = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson/${file}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const fetched = Buffer.from(await response.arrayBuffer());
  const actual = sha256(fetched);
  if (actual !== expected) {
    throw new Error(`${url}: sha256 ${actual}, expected ${expected}`);
  }
  await mkdir(CACHE, { recursive: true });
  const partial = `${cached}.partial`;
  await writeFile(partial, fetched);
  await rename(partial, cached);
  return fetched;
}

/** A Natural Earth layer's GeoJSON at the pinned commit, unparsed. */
export const naturalEarthJson = async (name: LayerName): Promise<unknown> =>
  JSON.parse((await layerBytes(name)).toString('utf8'));

/** A Natural Earth layer's polygons at the pinned commit. */
export async function naturalEarth(name: LayerName): Promise<GeoPolygon[]> {
  return layerPolygons(await naturalEarthJson(name));
}
