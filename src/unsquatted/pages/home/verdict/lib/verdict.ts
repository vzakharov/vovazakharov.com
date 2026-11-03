/**
 * Whether a domain is registered, read off the registry's own RDAP service,
 * or — for a zone whose RDAP a browser cannot read — off DNS, which only
 * hints. Pure: `check-domain.ts` does the fetching and hands the bodies here.
 */

import { errorClass } from '@/kernel/shared/lib/error-class';

const MalformedAnswerError = errorClass('MalformedAnswerError');

const TIME_UNITS = ['day', 'hour', 'minute'] as const;

type TimeUnit = (typeof TIME_UNITS)[number];

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

/** `verdict` is `undefined` while the lookup runs. */
export type WithVerdict = { verdict: Verdict | undefined };

/** The lookups in hand, by domain. */
export type WithVerdicts = { verdicts: ReadonlyMap<string, Verdict> };

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
