import { z } from 'zod';

import { isWorldNumber, OUR_WORLD } from '@/island/entities/terrain';

/** Decimal places each pose field is written to: ~1 m of latitude and longitude. */
export const PLACES = {
  lat: 5,
  lon: 5,
  height: 1,
  heading: 1,
  pitch: 1,
  hours: 3,
} as const;

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

const decimal = (range: z.ZodNumber) =>
  z.string().regex(DECIMAL).transform(Number).pipe(range);

/**
 * The pose after a hash's `@`, comma-separated: latitude and longitude in
 * degrees (east positive), the eye's height in metres, its heading in degrees
 * clockwise from north, its look in degrees above the pitch its height gives,
 * and optionally the clock's hours since the opening.
 */
const POSE = z
  .tuple([
    decimal(z.number().min(-90).max(90)),
    decimal(z.number().min(-180).max(180)),
    decimal(z.number().positive()),
    decimal(z.number()),
    decimal(z.number()),
    decimal(z.number().min(0).lt(24)).optional(),
  ])
  .transform(([lat, lon, height, heading, pitch, hours]) => ({
    lat,
    lon,
    height,
    heading,
    pitch,
    ...(hours === undefined ? {} : { hours }),
  }));

/** Where and how the eye stands, and at what hour, as a hash spells it. */
export type Pose = z.output<typeof POSE>;

/** What a hash opens: a world, and the pose in it when the hash names one. */
export type Place = { readonly world: string; readonly pose?: Pose };

/**
 * The place a URL hash (`location.hash`, `#` included or not) opens:
 * `#<world>` or `#<world>@<lat>,<lon>,<height>,<heading>,<pitch>[,<hours>]`.
 * A world that is no world number opens `OUR_WORLD` with no pose; a pose with
 * any field missing, extra, malformed or out of range is dropped, its world
 * kept. An invalid hash is an expected input with a defined meaning, not a
 * failure.
 */
export function parsePlace(hash: string): Place {
  const body = hash.startsWith('#') ? hash.slice(1) : hash;
  const at = body.indexOf('@');
  const head = at === -1 ? body : body.slice(0, at);
  if (!isWorldNumber(head)) return { world: OUR_WORLD };
  if (at === -1) return { world: head };
  const pose = POSE.safeParse(body.slice(at + 1).split(','));
  return pose.success ? { world: head, pose: pose.data } : { world: head };
}

/** `value` to `places` decimals, never `-0`. */
export const fixed = (value: number, places: number): string => {
  const scale = 10 ** places;
  return (Math.round(value * scale) / scale + 0).toFixed(places);
};

/** The hash, `#` included, that `parsePlace` reads back as `place` to `PLACES`' precision. */
export function formatPlace({ world, pose }: Place): string {
  if (pose === undefined) return `#${world}`;
  const fields = [
    fixed(pose.lat, PLACES.lat),
    fixed(pose.lon, PLACES.lon),
    fixed(pose.height, PLACES.height),
    fixed(pose.heading, PLACES.heading),
    fixed(pose.pitch, PLACES.pitch),
    // An hour that rounds up to the day's end is its start.
    ...(pose.hours === undefined
      ? []
      : [fixed(Number(fixed(pose.hours, PLACES.hours)) % 24, PLACES.hours)]),
  ];
  return `#${world}@${fields.join(',')}`;
}
