/**
 * What `shoot-island` is asked for: a still is a `Spot`, named, at a place and
 * height, with the heading, look and hour optional. The command line writes
 * degrees (and the hook's hours); the hook takes radians, converted in
 * `aimOf`.
 */

import type { Named } from '@/kernel/shared/typings';

import { afternoonAt } from './shot-sets';

export type Spot = Named & {
  readonly lat: number;
  readonly lon: number;
  /** Metres above the ground. */
  readonly height: number;
  /** Degrees clockwise from north; unset is north. */
  readonly heading?: number;
  /** Degrees above the pitch the height gives; unset is none. */
  readonly look?: number;
  /** Hours past the opening's sun, as the hook's `setTime` takes them; unset keeps the clock. */
  readonly hours?: number;
};

const RADIANS_PER_DEGREE = Math.PI / 180;

/** The heading and look of `spot` in the radians the hook takes. */
export const aimOf = ({
  heading = 0,
  look = 0,
}: Spot): { heading: number; look: number } => ({
  heading: heading * RADIANS_PER_DEGREE,
  look: look * RADIANS_PER_DEGREE,
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
  const [lat, lon, height, heading, look, hours, ...extra] = numbers(
    spec.slice(colon + 1),
    spec,
  );
  if (lat === undefined || lon === undefined || height === undefined) {
    throw new Error(`--shot ${spec}: needs lat, lon and height`);
  }
  if (extra.length > 0) throw new Error(`--shot ${spec}: too many values`);
  return {
    name,
    lat,
    lon,
    height,
    ...(heading === undefined ? {} : { heading }),
    ...(look === undefined ? {} : { look }),
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
const NORTHERN_ITALY = { lat: 44, lon: 10 };
const OCEAN = { lat: 0, lon: -140 };
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
  ...(height <= LOW_FROM ? { look: LOW_LOOK } : {}),
  hours: afternoonAt(
    EARTH,
    NORTHERN_ITALY.lon,
    height >= ORBIT_FROM ? ORBIT_EARLIER : AFTERNOON_EARLIER,
  ),
});

const overOcean = (name: string, height: number): Spot => ({
  name,
  ...OCEAN,
  height,
  hours: afternoonAt(EARTH, OCEAN.lon, ORBIT_EARLIER),
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
    { ...overCoast('sky-2m', 2), look: 40 },
  ],
};
