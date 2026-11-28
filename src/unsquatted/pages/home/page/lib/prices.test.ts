import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parsePricing, parseRootZones } from './prices';

const price = (amount: string) => ({
  registration: amount,
  renewal: amount,
  transfer: amount,
});

describe('parseRootZones', () => {
  it('reads the zones lower-case, past the header', () => {
    assert.deepEqual(
      parseRootZones('# Version 2026102900\nCOM\nXN--P1AI\nXYZ\n'),
      new Set(['com', 'xn--p1ai', 'xyz']),
    );
  });
});

describe('parsePricing', () => {
  it('reads the prices as numbers, of the root’s zones spelled in letters', () => {
    const prices = parsePricing(
      {
        status: 'SUCCESS',
        pricing: {
          xyz: { registration: '2.04', renewal: '14.21', transfer: '14.21' },
          // A Handshake name, outside the root.
          catgirl: price('5.00'),
          'xn--p1ai': price('9.00'),
          'co.uk': price('6.00'),
        },
      },
      new Set(['xyz', 'xn--p1ai', 'uk']),
    );

    assert.deepEqual(prices, { xyz: { registration: 2.04, renewal: 14.21 } });
  });

  it('refuses a list of another shape', () => {
    assert.throws(() => parsePricing({ pricing: 'none' }, new Set()));
  });
});
