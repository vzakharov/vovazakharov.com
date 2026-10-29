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
  | { state: 'taken'; since: string | undefined }
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
 * The domains a lookup shows for `label`: every zone of `ZONES`, led by the
 * zone typed with it, which is shown even where it cannot be checked.
 */
export function rowsFor(label: string, zone: string | undefined): Row[] {
  const rest = ZONES.filter((each) => each !== zone).map((each) => ({
    domain: `${label}.${each}`,
    checkable: true,
  }));

  return zone === undefined
    ? rest
    : [
        {
          domain: `${label}.${zone}`,
          checkable: (ZONES as readonly string[]).includes(zone),
        },
        ...rest,
      ];
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
  events: z
    .array(z.object({ eventAction: z.string(), eventDate: z.string() }))
    .optional(),
});

/**
 * A registry's answer: 404 is free, a record is taken since the year it was
 * registered, and anything else is no answer — a rate limit or an outage
 * says nothing about the name.
 */
export function rdapVerdict(status: number, body: unknown): Verdict {
  if (status === 404) return { state: 'free' };
  if (status < 200 || status >= 300) return { state: 'unknown' };

  const registration = rdapDomainSchema
    .parse(body)
    .events?.find(({ eventAction }) => eventAction === 'registration');

  return { state: 'taken', since: registration?.eventDate.slice(0, 4) };
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
