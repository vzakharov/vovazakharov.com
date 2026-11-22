/**
 * What `shoot-island` is asked for: a still is a `Spot`, named, at a place and
 * height, with the heading, look and hour optional. The command line writes
 * degrees (and the hook's hours); the hook takes radians, converted in
 * `aimOf`.
 */

import type { Elevated } from '@/island/shared/globe';

import { afternoonAt, type Still } from './shot-sets';

/**
 * A still from `height` metres above the ground, every angle in degrees; an
 * unset hour keeps the clock.
 */
export type Spot = Still &
  Elevated & {
    readonly latDeg: number;
    readonly lonDeg: number;
    /** Degrees clockwise from north; unset is north. */
    readonly headingDeg?: number;
    /** Degrees above the pitch the height gives; unset is none. */
    readonly lookDeg?: number;
  };

const RADIANS_PER_DEGREE = Math.PI / 180;

/** The heading and look of `spot` in the radians the hook takes. */
export const aimOf = ({
  headingDeg = 0,
  lookDeg = 0,
}: Spot): { heading: number; look: number } => ({
  heading: headingDeg * RADIANS_PER_DEGREE,
  look: lookDeg * RADIANS_PER_DEGREE,
});

function numbers(text: string, spec: string): number[] {
  return text.split(',').map((part) => {
    const value = Number(part);
    if (part.trim() === '' || !Number.isFinite(value)) {
      throw new Error(`--shot ${spec}: ${JSON.stringify(part)} is no number`);
    }
    return value;
  });
}

/** Parses `name:lat,lon,height[,headingDeg[,lookDeg[,hours]]]`. */
export function parseShot(spec: string): Spot {
  const colon = spec.indexOf(':');
  const name = colon === -1 ? '' : spec.slice(0, colon);
  if (!/^[\w-]+$/.test(name)) {
    throw new Error(
      `--shot ${spec}: expected name:lat,lon,height[,headingDeg[,lookDeg[,hours]]]`,
    );
  }
  const [lat, lon, height, headingDeg, lookDeg, hours, ...extra] = numbers(
    spec.slice(colon + 1),
    spec,
  );
  if (lat === undefined || lon === undefined || height === undefined) {
    throw new Error(`--shot ${spec}: needs lat, lon and height`);
  }
  if (extra.length > 0) throw new Error(`--shot ${spec}: too many values`);
  return {
    name,
    latDeg: lat,
    lonDeg: lon,
    height,
    ...(headingDeg === undefined ? {} : { headingDeg }),
    ...(lookDeg === undefined ? {} : { lookDeg }),
    ...(hours === undefined ? {} : { hours }),
  };
}

/** Parses `WxH`. */
export function parseSize(text: string): { width: number; height: number } {
  const match = /^(\d+)x(\d+)$/.exec(text);
  const [, width, height] = match ?? [];
  if (width === undefined || height === undefined) {
    throw new Error(`--size ${text}: expected WxH, like 1600x1000`);
  }
  return { width: Number(width), height: Number(height) };
}

/** The value of every `--shot` on `argv`. */
export function shotSpecs(argv: readonly string[]): string[] {
  return argv.flatMap((arg, at) => {
    const value = argv[at + 1];
    return arg === '--shot' && value !== undefined ? [value] : [];
  });
}

const EARTH = '0';
const NORTHERN_ITALY = { latDeg: 44, lonDeg: 10 };
const OCEAN = { latDeg: 0, lonDeg: -140 };
/** The sun's hours before the opening's low afternoon: higher than it, short of the disc's night side. */
const AFTERNOON_EARLIER = 1.5;
/** As `afternoonAt` takes them for a frame from orbit, which lights all but the rim. */
const ORBIT_EARLIER = 2.5;
const ORBIT_FROM = 2_000_000;
/** Low views look this far up so the horizon and the sky are in frame. */
const LOW_LOOK = 15;
const LOW_FROM = 34_000;

const KM = 1000;

const overCoast = (name: string, height: number): Spot => ({
  name,
  ...NORTHERN_ITALY,
  height,
  ...(height <= LOW_FROM ? { lookDeg: LOW_LOOK } : {}),
  hours: afternoonAt(
    EARTH,
    NORTHERN_ITALY.lonDeg,
    height >= ORBIT_FROM ? ORBIT_EARLIER : AFTERNOON_EARLIER,
  ),
});

const overOcean = (name: string, height: number): Spot => ({
  name,
  ...OCEAN,
  height,
  hours: afternoonAt(EARTH, OCEAN.lonDeg, ORBIT_EARLIER),
});

/** The named lists `--set` takes, each for one world. */
export const SHOT_SETS: Readonly<Record<string, readonly Spot[]>> = {
  beauty: [
    overCoast('coast-20000km', 20_000 * KM),
    overCoast('coast-2300km', 2300 * KM),
    overCoast('coast-820km', 820 * KM),
    overCoast('coast-34km', 34 * KM),
    overCoast('coast-10600m', 10_600),
    overCoast('coast-4400m', 4400),
    overCoast('coast-560m', 560),
    overCoast('coast-2m', 2),
    overOcean('ocean-20000km', 20_000 * KM),
    overOcean('ocean-2300km', 2300 * KM),
    { ...overCoast('sky-2m', 2), lookDeg: 40 },
  ],
};
