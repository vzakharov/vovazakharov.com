/**
 * The verdict half of `check-font-preloads.ts`: given what each built page
 * preloads and, for a page in a language other than the default, which font
 * files its text actually used, what is wrong with the preload lists.
 */

import type { Routed } from '@/shared/content';
import { DEFAULT_LOCALE, type WithLocale } from '@/shared/i18n/locales';

export type PageFonts = Routed &
  WithLocale & {
    preloaded: ReadonlySet<string>;
    /** Measured for a page outside the default locale only. */
    used?: ReadonlySet<string>;
  };

/** One thing wrong, and every page it is wrong on. */
export type Finding = { problem: string; routes: string[] };

const intersection = (sets: Array<ReadonlySet<string>>): Set<string> =>
  new Set(
    [...(sets[0] ?? [])].filter((file) => sets.every((set) => set.has(file))),
  );

const minus = (set: ReadonlySet<string>, other: ReadonlySet<string>) =>
  [...set].filter((file) => !other.has(file));

/**
 * The root layout's preloads are whatever every page carrying any preload
 * carries — the not-found page renders without them — and the rest of a page's
 * preloads are its locale's. A locale outside the default must preload
 * exactly the files every one of its pages uses — a file only some use is that
 * content's own, a cost the rest would pay — and the default locale preloads
 * none, since pages that render no `LocaleFonts` count as its.
 */
export function fontPreloadFindings(pages: PageFonts[]): Finding[] {
  const shared = intersection(
    pages.map((page) => page.preloaded).filter((set) => set.size > 0),
  );
  const found = new Map<string, string[]>();
  const report = (problem: string, route: string) => {
    found.set(problem, [...(found.get(problem) ?? []), route]);
  };

  const byLocale = Map.groupBy(pages, (page) => page.locale);

  for (const [locale, group] of byLocale) {
    if (locale === DEFAULT_LOCALE) {
      for (const page of group) {
        for (const file of minus(page.preloaded, shared)) {
          report(`preloads ${file} on a ${locale} page`, page.route);
        }
      }
      continue;
    }

    const used = group.map((page) => {
      if (!page.used) throw new Error(`${page.route}: no measured fonts`);
      return new Set(minus(page.used, shared));
    });
    const everywhere = intersection(used);

    for (const [index, page] of group.entries()) {
      const own = new Set(minus(page.preloaded, shared));
      for (const file of minus(everywhere, own)) {
        report(
          `does not preload ${file}, which every ${locale} page uses`,
          page.route,
        );
      }
      for (const file of minus(own, used[index] ?? new Set())) {
        report(`preloads ${file}, which the page never uses`, page.route);
      }
    }
  }

  return [...found].map(([problem, routes]) => ({
    problem,
    routes: routes.toSorted((a, b) => a.localeCompare(b)),
  }));
}
