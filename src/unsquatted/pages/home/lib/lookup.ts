/**
 * Whether a domain is registered, read off the registry's own RDAP service,
 * or — for a zone whose RDAP a browser cannot read — off DNS, which only
 * hints. Pure: `check-domain.ts` does the fetching and hands the bodies here.
 */

import { z } from 'zod';

/**
 * What a lookup can say. `maybe` is DNS's "no such name", which a registered
 * domain without nameservers also answers; `unknown` is no answer at all.
 */
export type Verdict =
  | { state: 'free' }
  | { state: 'maybe' }
  | {
      state: 'taken';
      since: string | undefined;
      /** Set only for a name the registry is about to release. */
      frees?: string;
    }
  | { state: 'unknown' };

export type WithDomain = { domain: string };

/** The zones every name is checked in, in the order they are shown. */
export const ZONES = [
  'com',
  'net',
  'org',
  'io',
  'ai',
  'co',
  'app',
  'dev',
  'me',
  'xyz',
  'si',
  'de',
] as const;

/** The longest label DNS allows. */
const MAX_LABEL = 63;

/** A host as typed or pasted: no scheme, no `www.`, nothing past it. */
function host(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[#/?].*$/, '');
}

/**
 * The name a visitor meant, as one DNS label: a pasted URL or a typed domain
 * loses its scheme and everything from the first dot or slash, and whatever no
 * label may hold is dropped.
 */
export function cleanLabel(input: string): string {
  return host(input)
    .replace(/\..*$/, '')
    .replaceAll(/[^\da-z-]/g, '')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, MAX_LABEL);
}

/** The zone typed after the name — `co.uk` of `foxedpage.co.uk` — if any. */
export function typedZone(input: string): string | undefined {
  const zone = /\.(.+)$/.exec(host(input))?.[1]?.replaceAll(/[^\d.a-z-]/g, '');

  return zone === undefined || zone === '' ? undefined : zone;
}

export type Row = WithDomain & { checkable: boolean };

/**
 * The name split where it ends in a zone of `ZONES` — `fuckapp` as
 * `fuck.app` — longest zone first.
 */
export function domainHacks(label: string): string[] {
  return ZONES.filter(
    (each) => label.length > each.length && label.endsWith(each),
  )
    .toSorted((a, b) => b.length - a.length)
    .map((each) => `${label.slice(0, -each.length)}.${each}`)
    .filter((domain) => !domain.startsWith('-') && !domain.includes('-.'));
}

/**
 * The domains a lookup shows for `label`: every zone of `ZONES`, led by the
 * zone typed with it — shown even where it cannot be checked — and then by
 * the name split where it already ends in a zone.
 */
export function rowsFor(label: string, zone: string | undefined): Row[] {
  const typed =
    zone === undefined
      ? []
      : [
          {
            domain: `${label}.${zone}`,
            checkable: (ZONES as readonly string[]).includes(zone),
          },
        ];
  const hacks = domainHacks(label).map((domain) => ({
    domain,
    checkable: true,
  }));
  const rest = ZONES.filter((each) => each !== zone).map((each) => ({
    domain: `${label}.${each}`,
    checkable: true,
  }));

  return [...typed, ...hacks, ...rest];
}

const bootstrapSchema = z.object({
  services: z.array(z.tuple([z.array(z.string()), z.array(z.string())])),
});

/**
 * IANA's RDAP bootstrap file as a zone → base URL map, each base ending in a
 * slash so a path joins onto it.
 */
export function parseBootstrap(body: unknown): ReadonlyMap<string, string> {
  const { services } = bootstrapSchema.parse(body);

  return new Map(
    services.flatMap(([zones, [base]]) =>
      base === undefined
        ? []
        : zones.map((zone) => [zone, base.replace(/\/?$/, '/')] as const),
    ),
  );
}

const rdapDomainSchema = z.object({
  status: z.array(z.string()).optional(),
  events: z
    .array(z.object({ eventAction: z.string(), eventDate: z.string() }))
    .optional(),
});

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** How long a gTLD name sits in "pending delete" before it is released. */
const PENDING_DELETE = 5 * DAY;

function count(amount: number, unit: string): string {
  return `${amount} ${unit}${amount === 1 ? '' : 's'}`;
}

/**
 * When a taken name becomes registrable again, in the largest whole unit.
 * Only a name in "pending delete" has a date: nobody can renew or restore it,
 * and the registry releases it five days after it entered the status (its
 * "deletion" event where given, else its last change). Before that the owner
 * can still renew it for a month or more, so there is no date to promise.
 */
export function freesIn(
  status: readonly string[],
  dated: (action: string) => string | undefined,
  now: number,
): string | undefined {
  if (!status.includes('pending delete')) return undefined;

  const changed = dated('last changed');
  const release =
    dated('deletion') ??
    (changed === undefined
      ? undefined
      : new Date(Date.parse(changed) + PENDING_DELETE).toISOString());

  if (release === undefined) return 'up for grabs within days';

  const left = Date.parse(release) - now;

  const inUnits = (size: number, unit: string) =>
    `up for grabs in ${count(Math.ceil(left / size), unit)}`;

  if (left <= 0) return 'up for grabs any minute';
  if (left >= DAY) return inUnits(DAY, 'day');
  if (left >= HOUR) return inUnits(HOUR, 'hour');

  return inUnits(MINUTE, 'minute');
}

/**
 * A registry's answer: 404 is free, a record is taken since the year it was
 * registered, and anything else is no answer — a rate limit or an outage
 * says nothing about the name.
 */
export function rdapVerdict(
  status: number,
  body: unknown,
  now = Date.now(),
): Verdict {
  if (status === 404) return { state: 'free' };
  if (status < 200 || status >= 300) return { state: 'unknown' };

  const { status: statuses = [], events = [] } = rdapDomainSchema.parse(body);
  const dated = (action: string) =>
    events.find(({ eventAction }) => eventAction === action)?.eventDate;
  const frees = freesIn(statuses, dated, now);

  return {
    state: 'taken',
    since: dated('registration')?.slice(0, 4),
    ...(frees === undefined ? {} : { frees }),
  };
}

const dohSchema = z.object({ Status: z.number() });

/** DNS response codes a DoH resolver reports in `Status`. */
const NOERROR = 0;
const NXDOMAIN = 3;

/** A DNS-over-HTTPS answer: a name that resolves is taken, one that does not may be free. */
export function dohVerdict(body: unknown): Verdict {
  const { Status } = dohSchema.parse(body);

  if (Status === NXDOMAIN) return { state: 'maybe' };
  if (Status === NOERROR) return { state: 'taken', since: undefined };

  return { state: 'unknown' };
}
