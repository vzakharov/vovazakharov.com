/**
 * A zone's price as the browser shows it. Apart from `prices.ts`, which reads
 * the list at build with `zod`, so a client component reaching for the shape
 * or the rounding pulls in neither.
 */

import type { WithCopy } from '@/unsquatted/shared/i18n';

export type Price = { registration: number; renewal: number };

/** Dollars per zone Porkbun sells. */
export type Prices = Partial<Record<string, Price>>;

/** What registering costs, once known. */
export type WithPrice = { price: Price | undefined };

export type WithPrices = { prices: Prices };

/** The page's wording and every zone's price. */
export type CopiedPrices = WithCopy & WithPrices;

/**
 * The yearly price rounded to the dollar — the cents would only clutter a
 * hint — with the renewal only where it differs from the first year's.
 */
export function priceParts({ registration, renewal }: Price): {
  first: number;
  after: number | undefined;
} {
  const first = Math.round(registration);
  const after = Math.round(renewal);

  return { first, after: first === after ? undefined : after };
}
