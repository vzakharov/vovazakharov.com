import type { Locale } from '@/kernel/shared/i18n';

/**
 * `m:ss`, as a track length is written everywhere, and `h:mm:ss` from an hour
 * up. The player bar wants it as well as the track list, and the bar is a
 * client component, so this module reaches no build-time one.
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

/**
 * A Russian count takes its case from the sentence around it — `1 минута`
 * alone, `длится 1 минуту` — so each sentence brings its own forms.
 */
export type SpokenLengthForms = Record<'hours' | 'minutes', PluralForms>;

/** What a size line can count ahead of its songs, outermost first. */
type CountedAhead = 'artists' | 'albums';

export type CatalogueSizeForms = SpokenLengthForms &
  Record<CountedAhead | 'songs', PluralForms>;

function counter(locale: Locale) {
  const rules = new Intl.PluralRules(locale);

  return (n: number, wording: PluralForms) =>
    (wording[rules.select(n)] ?? wording.other).replace('#', String(n));
}

export type AheadCounts = Partial<Record<CountedAhead, number>>;

export type CatalogueSize = AheadCounts & {
  seconds: readonly number[];
};

/**
 * A length to the nearest minute — `25 minutes`, `1 hour 12 minutes` from an
 * hour up, `2 hours` with no zero minute count — in the locale's plural rules.
 */
export function spokenLength(
  seconds: number,
  locale: Locale,
  forms: SpokenLengthForms,
): string {
  const count = counter(locale);
  const total = Math.round(seconds / 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return [
    ...(hours > 0 ? [count(hours, forms.hours)] : []),
    ...(hours === 0 || minutes > 0 ? [count(minutes, forms.minutes)] : []),
  ].join(' ');
}

/**
 * A catalogue's or a release's size — `7 songs`, `25 minutes` — led by the
 * artist and album counts it is handed, a zero one left out; one part per
 * fact, for a facts line to space out.
 */
export function catalogueSize(
  { artists, albums, seconds }: CatalogueSize,
  locale: Locale,
  forms: CatalogueSizeForms,
): string[] {
  const count = counter(locale);
  const ahead = (n: number | undefined, wording: PluralForms) =>
    n === undefined || n === 0 ? [] : [count(n, wording)];
  const total = seconds.reduce((sum, track) => sum + track, 0);

  return [
    ...ahead(artists, forms.artists),
    ...ahead(albums, forms.albums),
    count(seconds.length, forms.songs),
    spokenLength(total, locale, forms),
  ];
}
