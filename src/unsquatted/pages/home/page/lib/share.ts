/** What a shared domain hands on: its link, and the rows its image card lists. */

import type { Verdict } from '../../verdict';
import type { Price, Prices } from './price';
import { type WithDomain, zoneOf } from './rows';

/** The rows an image card has room for. */
const CARD_ROWS = 3;

/** The page at `here`, opening on `domain` with its zone first. */
export const domainLink = (domain: string, here: URL) =>
  `${here.origin}${here.pathname}#${domain}`;

export type CardRow = WithDomain & {
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

const isAvailable = (verdict: Verdict | undefined) =>
  verdict?.state === 'free' || verdict?.state === 'maybe';

/**
 * The card's rows: the shared domain, then the sharer's liked siblings, then
 * the others — each only once its lookup said it is free or may be, so the
 * card never says "checking…" and never lists a taken name.
 */
export function cardRows({
  shared,
  siblings,
  liked,
  verdicts,
  prices,
}: CardSource): CardRow[] {
  const available = siblings.filter(
    (domain) => domain !== shared && isAvailable(verdicts.get(domain)),
  );
  const ordered = [
    shared,
    ...available.filter((domain) => liked.has(domain)),
    ...available.filter((domain) => !liked.has(domain)),
  ];

  return ordered.slice(0, CARD_ROWS).map((domain) => ({
    domain,
    liked: liked.has(domain),
    price: prices[zoneOf(domain)],
  }));
}
