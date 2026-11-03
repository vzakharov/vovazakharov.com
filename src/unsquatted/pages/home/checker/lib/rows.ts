/** The domains shown for what a visitor typed: its name, in which zones. */

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
export function host(input: string): string {
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

/** `label` as the field would hold it, `zone` after it where one was typed. */
export const asTyped = (label: string, zone: string | undefined) =>
  zone === undefined ? label : `${label}.${zone}`;

/** The name before its zone: `foxedpage` of `foxedpage.co.uk`. */
export function labelOf(domain: string): string {
  return domain.slice(0, domain.indexOf('.'));
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
