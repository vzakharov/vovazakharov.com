import type { Locale } from '@/shared/i18n';

/**
 * `m:ss`, as a track length is written everywhere, and `h:mm:ss` from an hour
 * up. Its own module because both the track list and the player bar want it,
 * and the bar is a client component that must not reach the build-time modules
 * beside it.
 */
export function formatDuration(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = String(whole % 60).padStart(2, '0');

  return hours === 0
    ? `${minutes}:${rest}`
    : `${hours}:${String(minutes).padStart(2, '0')}:${rest}`;
}

/**
 * A count's wording per CLDR plural category, `#` standing for the count as in
 * an ICU message; `other` is the fallback every language has.
 */
type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

/** What a size line can count ahead of its songs, outermost first. */
type CountedAhead = 'artists' | 'albums';

export type CatalogueSizeForms = Record<
  CountedAhead | 'songs' | 'hours' | 'minutes',
  PluralForms
>;

export type CatalogueSize = Partial<Record<CountedAhead, number>> & {
  seconds: readonly number[];
};

/**
 * A catalogue's or a release's size — `7 songs`, `25 minutes`, `1 hour 12
 * minutes` from an hour up — to the nearest minute, in the locale's plural
 * rules, led by the artist and album counts it is handed, a zero one left out;
 * one part per fact, for a facts line to space out.
 */
export function catalogueSize(
  { artists, albums, seconds }: CatalogueSize,
  locale: Locale,
  forms: CatalogueSizeForms,
): string[] {
  const rules = new Intl.PluralRules(locale);
  const count = (n: number, wording: PluralForms) =>
    (wording[rules.select(n)] ?? wording.other).replace('#', String(n));
  const ahead = (n: number | undefined, wording: PluralForms) =>
    n === undefined || n === 0 ? [] : [count(n, wording)];

  const total = Math.round(seconds.reduce((sum, track) => sum + track, 0) / 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const time = [
    ...(hours > 0 ? [count(hours, forms.hours)] : []),
    ...(hours === 0 || minutes > 0 ? [count(minutes, forms.minutes)] : []),
  ];

  return [
    ...ahead(artists, forms.artists),
    ...ahead(albums, forms.albums),
    count(seconds.length, forms.songs),
    time.join(' '),
  ];
}
