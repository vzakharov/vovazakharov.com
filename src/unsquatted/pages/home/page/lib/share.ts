/** What a shared domain hands on: its link, and the rows its image card lists. */

import type { Verdict } from '../../verdict';
import type { Price, Prices } from './price';
import { type WithDomain, zoneOf } from './rows';

/** The rows an image card has room for. */
const CARD_ROWS = 3;

/** The page at `here`, opening on `domain` with its zone first. */
export const domainLink = (domain: string, here: URL) =>
  `${here.origin}${here.pathname}#${domain}`;

/** What a lookup said of a domain a visitor can register. */
type Available = 'free' | 'maybe';

export type CardRow = WithDomain & {
  state: Available;
  liked: boolean;
  price: Price | undefined;
};

type CardSource = {
  /** The domain being shared, the card's first row. */
  shared: string;
  /** The rest of the name's domains, in the order the checker shows them. */
  siblings: readonly string[];
  liked: ReadonlySet<string>;
  verdicts: ReadonlyMap<string, Verdict>;
  prices: Prices;
};

/** `verdict`'s state where it says the domain can be registered. */
export function availability(
  verdict: Verdict | undefined,
): Available | undefined {
  return verdict?.state === 'free' || verdict?.state === 'maybe'
    ? verdict.state
    : undefined;
}

/**
 * The card's rows: the shared domain, then the sharer's liked siblings, then
 * the others — each only once its lookup said it is free or may be, so the
 * card never says “checking…” and never lists a taken name. None at all
 * until the shared domain's own lookup says so.
 */
export function cardRows({
  shared,
  siblings,
  liked,
  verdicts,
  prices,
}: CardSource): CardRow[] {
  if (availability(verdicts.get(shared)) === undefined) return [];
  const available = siblings.filter(
    (domain) =>
      domain !== shared && availability(verdicts.get(domain)) !== undefined,
  );
  const ordered = [
    shared,
    ...available.filter((domain) => liked.has(domain)),
    ...available.filter((domain) => !liked.has(domain)),
  ];

  return ordered.slice(0, CARD_ROWS).flatMap((domain) => {
    const state = availability(verdicts.get(domain));

    return state === undefined
      ? []
      : [
          {
            domain,
            state,
            liked: liked.has(domain),
            price: prices[zoneOf(domain)],
          },
        ];
  });
}
