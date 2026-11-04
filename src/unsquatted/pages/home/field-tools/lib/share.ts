/** What a shared name hands on: its link, and the rows its image card lists. */

import { pick } from '@/kernel/shared/lib/collections';

import {
  type WithDomain,
  type WithPrice,
  type WithPrices,
  zoneOf,
} from '../../checker';
import { registrable, type Verdict, type WithVerdicts } from '../../verdict';

/** The lookups and prices in hand for a name's domains. */
type Lookups = WithVerdicts & WithPrices;

/** What a card shared from a domain may list besides it. */
export type CardSiblings = Lookups & {
  /** The rest of the name's domains, in the order the checker shows them. */
  siblings: readonly string[];
};

/** The rows an image card has room for. */
const CARD_ROWS = 3;

/** The page at `here`, opening on `typed` as the field would hold it. */
export const domainLink = (typed: string, here: URL) =>
  `${here.origin}${here.pathname}#${typed}`;

type Listed = Extract<Verdict, { state: 'free' | 'maybe' | 'taken' }>;

/**
 * Which rows a card holds: registrable ones (“maybe” included) or, where the
 * name has none, taken ones.
 */
type Kind = 'registrable' | 'taken';

export type CardRow = WithDomain &
  WithPrice & {
    state: Listed['state'];
    /** The year a taken domain was registered, where its registry says. */
    since: string | undefined;
    liked: boolean;
  };

type CardSource = CardSiblings & {
  /** The domain being shared, the card's first row. */
  shared: string;
  /** The domain the sharer's like of the name points at, if they like it. */
  liked: string | undefined;
};

const isListed = (verdict: Verdict | undefined): verdict is Listed =>
  verdict !== undefined && verdict.state !== 'unknown';

const kindOf = (verdict: Verdict | undefined): Kind | undefined => {
  if (!isListed(verdict)) return undefined;

  return registrable(verdict) ? 'registrable' : 'taken';
};

/** A taken domain's row shows its year rather than a price. */
function row(
  domain: string,
  verdict: Listed,
  liked: string | undefined,
  { prices }: WithPrices,
): CardRow {
  const taken = verdict.state === 'taken';

  return {
    domain,
    ...pick(verdict, 'state'),
    since: taken ? verdict.since : undefined,
    liked: domain === liked,
    price: taken ? undefined : prices[zoneOf(domain)],
  };
}

/**
 * The domain a card leads with: the first of `leads` on screen (`shown`) free
 * or may be, else the first taken — so a name taken everywhere the visitor
 * looked still has a card, whatever an unopened row would say. None while no
 * lookup of them has said either.
 */
export function cardLead(
  leads: ReadonlyArray<string | undefined>,
  shown: readonly string[],
  { verdicts }: WithVerdicts,
): string | undefined {
  const known = leads.filter((domain) => domain !== undefined);
  const first = (kind: Kind, among: readonly string[]) =>
    among.find((domain) => kindOf(verdicts.get(domain)) === kind);

  return (
    first(
      'registrable',
      known.filter((domain) => shown.includes(domain)),
    ) ?? first('taken', known)
  );
}

/**
 * Whether lookups still out could change the card for `rows`: none can once
 * the card is full and every domain ahead of its last row in `order` — the
 * leads, then the siblings, as `cardLead` and `cardRows` walk them — has an
 * answer. A taken card waits for every domain on screen too, since any of
 * them free would lead instead.
 */
export function cardSettled(
  rows: readonly CardRow[],
  order: ReadonlyArray<string | undefined>,
  shown: readonly string[],
  { verdicts }: WithVerdicts,
): boolean {
  const last = rows.at(-1)?.domain;

  if (rows.length < CARD_ROWS || last === undefined) return false;
  const known = order.filter((domain) => domain !== undefined);
  const ahead = known.slice(0, known.indexOf(last) + 1);
  const waited = rows[0]?.state === 'taken' ? [...ahead, ...shown] : ahead;

  return waited.every((domain) => verdicts.has(domain));
}

/**
 * The card's rows: the shared domain, then the liked one, then the others —
 * each only once its lookup said it is of the shared domain's kind, so the
 * card never says “checking…” and never mixes a taken name in with free ones.
 * None at all until the shared domain's own lookup is in.
 */
export function cardRows({
  shared,
  siblings,
  liked,
  verdicts,
  prices,
}: CardSource): CardRow[] {
  const kind = kindOf(verdicts.get(shared));

  if (kind === undefined) return [];
  const alike = siblings.filter(
    (domain) => domain !== shared && kindOf(verdicts.get(domain)) === kind,
  );
  const ordered = [
    shared,
    ...alike.filter((domain) => domain === liked),
    ...alike.filter((domain) => domain !== liked),
  ];

  return ordered.slice(0, CARD_ROWS).flatMap((domain) => {
    const verdict = verdicts.get(domain);

    return isListed(verdict) ? [row(domain, verdict, liked, { prices })] : [];
  });
}
