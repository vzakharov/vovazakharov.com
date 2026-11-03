/** The visitor's liked domains: how they group into chips, and their text form. */

import { host } from './rows';

/** One chip: a name and its liked domains, the one it shows first. */
export type Group = {
  /** What a press on the chip puts in the checker. */
  name: string;
  /** The domain the chip shows: the first liked one spelling `name` itself. */
  shown: string;
  /** Every liked domain in the group, `shown` among them, in liked order. */
  domains: string[];
};

const labelOf = (domain: string) => domain.slice(0, domain.indexOf('.'));

/** The names `domain` is a split of: `foxed.page` of `foxedpage`, `tips.design` of `designtips`. */
function joined(domain: string): string[] {
  const label = labelOf(domain);
  const zone = domain.slice(label.length + 1);

  return zone.includes('.') ? [] : [`${label}${zone}`, `${zone}${label}`];
}

/**
 * The liked domains as chips, in the order each chip's first domain was
 * liked. A domain joins the chip of a name it splits, where a domain of that
 * name is liked too, and otherwise the chip of its own label — so
 * `foxedpage.com`, `foxedpage.org` and `foxed.page` are one chip.
 */
export function grouped(liked: readonly string[]): Group[] {
  const labels = new Set(liked.map((domain) => labelOf(domain)));
  const groups = new Map<string, Group>();

  for (const domain of liked) {
    const name =
      joined(domain).find((each) => labels.has(each)) ?? labelOf(domain);
    const group = groups.get(name) ?? { name, shown: domain, domains: [] };

    group.domains.push(domain);
    if (labelOf(group.shown) !== name && labelOf(domain) === name) {
      group.shown = domain;
    }
    groups.set(name, group);
  }

  return [...groups.values()];
}

const DOMAIN = /^(?:[\da-z](?:[\da-z-]*[\da-z])?\.)+[a-z][\da-z-]*[\da-z]$/;

/** What a pasted list holds, and the lines in it that are no domain. */
export type ParsedLikes = { liked: string[]; invalid: string[] };

/**
 * A liked list from text, one domain per line, each cleaned as the field
 * cleans what is typed. Blank lines and repeats go; a line that is no domain
 * is named in `invalid`, not dropped.
 */
export function parseLiked(text: string): ParsedLikes {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const cleaned = lines.map((line) => ({ line, domain: host(line) }));

  return {
    liked: [
      ...new Set(
        cleaned
          .filter(({ domain }) => DOMAIN.test(domain))
          .map(({ domain }) => domain),
      ),
    ],
    invalid: cleaned
      .filter(({ domain }) => !DOMAIN.test(domain))
      .map(({ line }) => line),
  };
}
