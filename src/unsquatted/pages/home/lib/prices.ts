/**
 * Porkbun's price list: one price per zone, premium names aside, which only a
 * keyed availability call would reveal. It takes Porkbun some ten seconds to
 * answer, so it is read when the page is built rather than when it is
 * visited, and goes stale only between deploys.
 */

import { z } from 'zod';

import { ZONES } from './lookup';

const PRICING_URL = 'https://api.porkbun.com/api/json/v3/pricing/get';

const pricingSchema = z.object({
  pricing: z.record(
    z.string(),
    z.object({ registration: z.string(), renewal: z.string() }),
  ),
});

export type Price = { registration: number; renewal: number };

/** Dollars per zone of `ZONES` that Porkbun sells. */
export type Prices = Partial<Record<string, Price>>;

/** The price list, cut down to the zones the checker shows. */
export function parsePricing(body: unknown): Prices {
  const { pricing } = pricingSchema.parse(body);

  return Object.fromEntries(
    ZONES.flatMap((zone) => {
      const price = pricing[zone];

      return price === undefined
        ? []
        : [
            [
              zone,
              {
                registration: Number(price.registration),
                renewal: Number(price.renewal),
              },
            ],
          ];
    }),
  );
}

/** Rounded to the dollar: the cents would only clutter a hint. */
export function priceText({ registration, renewal }: Price): string {
  const first = Math.round(registration);
  const then = Math.round(renewal);

  return first === then ? `~$${first}/yr` : `~$${first}, then ~$${then}/yr`;
}

/** Fetched at build; a failure fails the build rather than drop the prices. */
export async function fetchPrices(): Promise<Prices> {
  const response = await fetch(PRICING_URL, { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Porkbun pricing answered ${response.status}`);
  }

  return parsePricing(await response.json());
}
