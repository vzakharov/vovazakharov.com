/**
 * What a registrar will actually sell a name for, which RDAP cannot say: a
 * registry's premium and its reserved words both answer RDAP as unregistered.
 * Porkbun's keyed `checkDomain` reads the registry's own answer, so it is
 * asked about every name RDAP calls free before the name is picked.
 *
 * Needs `PORKBUN_API_KEY` and `PORKBUN_SECRET_API_KEY` in the environment.
 * Porkbun allows ten checks in ten seconds, so calls are spaced a second apart.
 */

import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import { errorClass, withCause } from '@/kernel/shared/lib/error-class';

const RegistrarError = errorClass('RegistrarError');

const CHECK_URL = 'https://api.porkbun.com/api/json/v3/domain/checkDomain/';

const SPACING_MS = 1000;

const responseSchema = z.object({
  status: z.literal('SUCCESS'),
  response: z.object({
    avail: z.enum(['yes', 'no']),
    premium: z.enum(['yes', 'no']),
    price: z.string(),
  }),
});

export type Offer =
  | { state: 'regular' }
  | { state: 'premium'; price: string }
  | { state: 'unavailable' };

function keys() {
  const apikey = process.env['PORKBUN_API_KEY'];
  const secretapikey = process.env['PORKBUN_SECRET_API_KEY'];

  if (apikey === undefined || secretapikey === undefined) {
    throw new RegistrarError(
      'PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY must be set',
    );
  }

  return { apikey, secretapikey };
}

export async function registrarOffer(domain: string): Promise<Offer> {
  await sleep(SPACING_MS);

  const response = await fetch(`${CHECK_URL}${domain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keys()),
  });
  const body: unknown = await response.json();

  try {
    const { avail, premium, price } = responseSchema.parse(body).response;

    if (avail === 'no') return { state: 'unavailable' };

    return premium === 'yes'
      ? { state: 'premium', price }
      : { state: 'regular' };
  } catch (error) {
    throw new RegistrarError(
      `${domain}: unexpected answer ${JSON.stringify(body)}`,
      withCause(error),
    );
  }
}
