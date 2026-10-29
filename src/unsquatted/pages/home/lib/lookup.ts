/**
 * Whether a domain is registered, read off the registry's own RDAP service,
 * or — for a zone whose RDAP a browser cannot read — off DNS, which only
 * hints. Pure: `check-domain.ts` does the fetching and hands the bodies here.
 */

import { errorClass } from '@/kernel/shared/lib/error-class';

const MalformedAnswerError = errorClass('MalformedAnswerError');

const TIME_UNITS = ['day', 'hour', 'minute'] as const;

export type TimeUnit = (typeof TIME_UNITS)[number];

/**
 * When a name in pending delete is released: a count of the largest whole
 * unit left, `soon` where the registry gives nothing to count from, `now`
 * where the count has run out.
 */
export type Release = { left: number; unit: TimeUnit } | 'soon' | 'now';

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
      /** The registration's expiry, as the registry dates it. */
      expires?: string;
      /** Set only for a name the registry is about to release. */
      frees?: Release;
    }
  | { state: 'unknown' };

export type WithDomain = { domain: string };

/**
 * The zones every name is checked in, in the order they are shown. Any other
 * zone Porkbun sells is shown only where the name spells it (`domainHacks`).
 */
export const ZONES = [
  'com',
  'net',
  'org',
  'io',
  'ai',
  'si',
  'co',
  'app',
  'dev',
  'me',
  'xyz',
  'sh',
  'gg',
  'to',
  'tv',
  'cc',
  'page',
  'fyi',
  'link',
  'site',
  'website',
  'blog',
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

/** Everything after the name: `co.uk` of `foxedpage.co.uk`. */
export function zoneOf(domain: string): string {
  return domain.slice(domain.indexOf('.') + 1);
}

export type Row = WithDomain & { checkable: boolean };

/** As many splits as follow `.com`, so the common zones stay in the first rows. */
const HACKS_SHOWN = 3;

/** Whether `text` reads as dictionary words run together. */
export function splitsIntoWords(
  text: string,
  words: ReadonlySet<string>,
): boolean {
  const reached = [true];

  for (let end = 1; end <= text.length; end++) {
    reached[end] = reached.some(
      (start, index) =>
        index < end && start && words.has(text.slice(index, end)),
    );
  }

  return reached[text.length] === true;
}

/**
 * The name split where it ends in one of `zones` — `fuckapp` as `fuck.app` —
 * or starts with one — `designtips` as `tips.design` — longest zone first. A
 * zone at the start counts only where it is a word of `words` and the rest
 * runs words together, since the start of a name spells some zone far more
 * often than it means one — `bibleical` is no `ical.bible`. Until `words` is
 * at hand, none does.
 */
export function domainHacks(
  label: string,
  zones: readonly string[],
  words: ReadonlySet<string> | undefined,
): string[] {
  const leads = (zone: string) =>
    words !== undefined &&
    label.startsWith(zone) &&
    words.has(zone) &&
    splitsIntoWords(label.slice(zone.length), words);
  const splits = zones
    .filter((zone) => label.length > zone.length)
    .toSorted((a, b) => b.length - a.length)
    .flatMap((zone) => [
      ...(label.endsWith(zone)
        ? [`${label.slice(0, -zone.length)}.${zone}`]
        : []),
      ...(leads(zone) ? [`${label.slice(zone.length)}.${zone}`] : []),
    ])
    .filter((domain) => !domain.startsWith('-') && !domain.includes('-.'));

  return [...new Set(splits)].slice(0, HACKS_SHOWN);
}

/**
 * The domains a lookup shows for `label`: every zone of `ZONES`, led by the
 * zone typed with it — shown even where Porkbun does not sell it, and so
 * cannot be checked — then `.com`, then the name split on a zone it spells.
 * `sold` is every zone Porkbun sells, `ZONES` among them; `words` is
 * `domainHacks`'s.
 */
export function rowsFor(
  label: string,
  zone: string | undefined,
  sold: readonly string[],
  words: ReadonlySet<string> | undefined,
): Row[] {
  const typed =
    zone === undefined
      ? []
      : [{ domain: `${label}.${zone}`, checkable: sold.includes(zone) }];
  const hacks = domainHacks(label, sold, words).map((domain) => ({
    domain,
    checkable: true,
  }));
  const inZone = (each: string): Row => ({
    domain: `${label}.${each}`,
    checkable: true,
  });
  const shown = new Set<string>();

  return [
    ...typed,
    inZone(ZONES[0]),
    ...hacks,
    ...ZONES.map((each) => inZone(each)),
  ].filter(({ domain }) => {
    if (shown.has(domain)) return false;
    shown.add(domain);

    return true;
  });
}

// The answers below are checked by hand rather than by a schema library:
// this module runs in the browser, and zod would ship with it.

type Bootstrap = { services: Array<[string[], string[]]> };

type RdapEvent = { eventAction: string; eventDate: string };

type RdapDomain = { status?: string[]; events?: RdapEvent[] };

type DohAnswer = { Status: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isArrayOf =
  <T>(holds: (each: unknown) => each is T) =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every((each: unknown) => holds(each));

const isStrings = isArrayOf((each): each is string => typeof each === 'string');

const isBootstrap = (value: unknown): value is Bootstrap =>
  isRecord(value) &&
  isArrayOf(
    (service): service is [string[], string[]] =>
      Array.isArray(service) &&
      service.length === 2 &&
      isStrings(service[0]) &&
      isStrings(service[1]),
  )(value['services']);

const isRdapEvent = (value: unknown): value is RdapEvent =>
  isRecord(value) &&
  typeof value['eventAction'] === 'string' &&
  typeof value['eventDate'] === 'string';

const isRdapDomain = (value: unknown): value is RdapDomain =>
  isRecord(value) &&
  (value['status'] === undefined || isStrings(value['status'])) &&
  (value['events'] === undefined || isArrayOf(isRdapEvent)(value['events']));

const isDohAnswer = (value: unknown): value is DohAnswer =>
  isRecord(value) && typeof value['Status'] === 'number';

/** `body` as the shape `holds` vouches for; any other shape throws, naming `what`. */
function shaped<T>(
  body: unknown,
  holds: (value: unknown) => value is T,
  what: string,
): T {
  if (!holds(body)) {
    throw new MalformedAnswerError(`${what} came back in an unknown shape`);
  }

  return body;
}

/**
 * IANA's RDAP bootstrap file as a zone → base URL map, each base ending in a
 * slash so a path joins onto it.
 */
export function parseBootstrap(body: unknown): ReadonlyMap<string, string> {
  const { services } = shaped(body, isBootstrap, 'The RDAP bootstrap file');

  return new Map(
    services.flatMap(([zones, [base]]) =>
      base === undefined
        ? []
        : zones.map((zone) => [zone, base.replace(/\/?$/, '/')] as const),
    ),
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** How long a gTLD name sits in "pending delete" before it is released. */
const PENDING_DELETE = 5 * DAY;

const UNIT_MS: Record<TimeUnit, number> = {
  day: DAY,
  hour: HOUR,
  minute: MINUTE,
};

/**
 * When a taken name becomes registrable again. Only a name in "pending delete"
 * has a date: nobody can renew or restore it, and the registry releases it
 * five days after it entered the status (its "deletion" event where given,
 * else its last change). Before that the owner can still renew it for a month
 * or more, so there is no date to promise.
 */
export function freesIn(
  status: readonly string[],
  dated: (action: string) => string | undefined,
  now: number,
): Release | undefined {
  if (!status.includes('pending delete')) return undefined;

  const changed = dated('last changed');
  const release =
    dated('deletion') ??
    (changed === undefined
      ? undefined
      : new Date(Date.parse(changed) + PENDING_DELETE).toISOString());

  if (release === undefined) return 'soon';

  const left = Date.parse(release) - now;

  if (left <= 0) return 'now';

  const unit = TIME_UNITS.find((each) => left >= UNIT_MS[each]) ?? 'minute';

  return { left: Math.ceil(left / UNIT_MS[unit]), unit };
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

  const { status: statuses = [], events = [] } = shaped(
    body,
    isRdapDomain,
    'An RDAP record',
  );
  const dated = (action: string) =>
    events.find(({ eventAction }) => eventAction === action)?.eventDate;
  const frees = freesIn(statuses, dated, now);
  const expires = dated('expiration');

  return {
    state: 'taken',
    since: dated('registration')?.slice(0, 4),
    ...(expires === undefined ? {} : { expires }),
    ...(frees === undefined ? {} : { frees }),
  };
}

/** DNS response codes a DoH resolver reports in `Status`. */
const NOERROR = 0;
const NXDOMAIN = 3;

/** A DNS-over-HTTPS answer: a name that resolves is taken, one that does not may be free. */
export function dohVerdict(body: unknown): Verdict {
  const { Status } = shaped(body, isDohAnswer, 'A DoH answer');

  if (Status === NXDOMAIN) return { state: 'maybe' };
  if (Status === NOERROR) return { state: 'taken', since: undefined };

  return { state: 'unknown' };
}
