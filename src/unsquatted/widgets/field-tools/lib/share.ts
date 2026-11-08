/** What a shared name hands on: its link, and the rows its image card lists. */

import { pick } from '@/kernel/shared/lib/collections';
import type { WithDomain } from '@/kernel/shared/typings';

import {
  registrable,
  type Verdict,
  type WithPrice,
  type WithPrices,
  type WithVerdicts,
  zoneOf,
} from '@/unsquatted/entities/domain/index.node-safe';

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
  /** The domain the field holds with its zone, if it does: the card's field. */
  typed: string | undefined;
  /** The domain being shared, the card's first row unless it is the typed one. */
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

export const offersNothing = (rows: readonly CardRow[]) =>
  rows.every(({ state }) => state === 'taken');

/**
 * Whether lookups still out could change the card for `rows`: none can once
 * the card is full and every domain ahead of its last row in `order` — the
 * leads, then the siblings, as `cardLead` and `cardRows` walk them — has an
 * answer. A card offering nothing waits for every domain on screen too, since
 * any of them free would lead instead.
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
  const waited = offersNothing(rows) ? [...ahead, ...shown] : ahead;

  return waited.every((domain) => verdicts.has(domain));
}

/**
 * The typed domain as the card's field holds it, its verdict beside it
 * whatever the lookup said; none until that lookup is in.
 */
export function fieldRow(
  typed: string | undefined,
  liked: string | undefined,
  { verdicts, prices }: Lookups,
): CardRow | undefined {
  if (typed === undefined) return undefined;
  const verdict = verdicts.get(typed);

  return isListed(verdict) ? row(typed, verdict, liked, { prices }) : undefined;
}

/**
 * The card's rows under the field: the shared domain, then the liked one, then
 * the others — the typed one left to the field, and each only once its lookup
 * said it is of the shared domain's kind, so the card never says “checking…”
 * and never mixes a taken name in with free ones. None at all until the shared
 * domain's own lookup is in.
 */
export function cardRows({
  typed,
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
  ].filter((domain) => domain !== typed);

  return ordered.slice(0, CARD_ROWS).flatMap((domain) => {
    const verdict = verdicts.get(domain);

    return isListed(verdict) ? [row(domain, verdict, liked, { prices })] : [];
  });
}
