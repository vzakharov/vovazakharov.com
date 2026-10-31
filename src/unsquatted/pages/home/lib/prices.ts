/**
 * Porkbun's price list: one price per zone, premium names aside, which only a
 * keyed availability call would reveal. It takes Porkbun some ten seconds to
 * answer, so it is read when the page is built rather than when it is
 * visited, and goes stale only between deploys.
 */

import { z } from 'zod';

import { errorClass } from '@/kernel/shared/lib/error-class';
import { fetchOk } from '@/kernel/shared/lib/fetch-ok';

import type { Prices } from './price';

const PRICING_URL = 'https://api.porkbun.com/api/json/v3/pricing/get';

const ROOT_ZONES_URL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';

const PricingError = errorClass('PricingError');

const RootZonesError = errorClass('RootZonesError');

const pricingSchema = z.object({
  pricing: z.record(
    z.string(),
    z.object({ registration: z.string(), renewal: z.string() }),
  ),
});

/** IANA's list of the root zone's TLDs: upper-case, one a line, under a `#` header. */
export function parseRootZones(text: string): ReadonlySet<string> {
  return new Set(
    text
      .split('\n')
      .filter((line) => line !== '' && !line.startsWith('#'))
      .map((line) => line.trim().toLowerCase()),
  );
}

/**
 * The price list, cut down to the zones a typed name can end in: in the DNS
 * root — Porkbun also sells Handshake names, which no ordinary resolver
 * answers — and spelled in letters, since a typed name holds no `xn--`.
 */
export function parsePricing(body: unknown, root: ReadonlySet<string>): Prices {
  const { pricing } = pricingSchema.parse(body);

  return Object.fromEntries(
    Object.entries(pricing)
      .filter(([zone]) => /^[a-z]+$/.test(zone) && root.has(zone))
      .map(([zone, { registration, renewal }]) => [
        zone,
        { registration: Number(registration), renewal: Number(renewal) },
      ]),
  );
}

/** Fetched at build; a failure fails the build rather than drop the prices. */
export async function fetchPrices(): Promise<Prices> {
  const [pricing, root] = await Promise.all([
    fetchOk(PRICING_URL, PricingError, { method: 'POST' }),
    fetchOk(ROOT_ZONES_URL, RootZonesError),
  ]);

  return parsePricing(await pricing.json(), parseRootZones(await root.text()));
}
