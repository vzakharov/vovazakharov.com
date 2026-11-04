import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Verdict } from '../../verdict';
import { cardLead, cardRows, domainLink } from './share';

const PRICES = {
  com: { registration: 12, renewal: 12 },
  net: { registration: 13, renewal: 13 },
};

const verdicts = (states: Record<string, Verdict['state']>) =>
  new Map(
    Object.entries(states).map(([domain, state]): [string, Verdict] => [
      domain,
      state === 'taken' ? { state, since: undefined } : { state },
    ]),
  );

const domains = (rows: ReturnType<typeof cardRows>) =>
  rows.map(({ domain }) => domain);

describe('cardRows', () => {
  it('leads with the shared domain, then the liked one, then the rest', () => {
    const rows = cardRows({
      shared: 'foxedpage.net',
      siblings: [
        'foxedpage.com',
        'foxed.page',
        'foxedpage.net',
        'foxedpage.org',
      ],
      liked: 'foxed.page',
      verdicts: verdicts({
        'foxedpage.com': 'free',
        'foxed.page': 'maybe',
        'foxedpage.net': 'free',
        'foxedpage.org': 'free',
      }),
      prices: PRICES,
    });

    assert.deepEqual(domains(rows), [
      'foxedpage.net',
      'foxed.page',
      'foxedpage.com',
    ]);
    assert.deepEqual(rows[0], {
      domain: 'foxedpage.net',
      state: 'free',
      since: undefined,
      liked: false,
      price: PRICES.net,
    });
    assert.equal(rows[1]?.liked, true);
  });

  it('skips a sibling taken, unanswered or still being looked up', () => {
    const rows = cardRows({
      shared: 'foxedpage.com',
      siblings: [
        'foxedpage.com',
        'foxedpage.net',
        'foxedpage.io',
        'foxedpage.ai',
      ],
      liked: 'foxedpage.net',
      verdicts: verdicts({
        'foxedpage.com': 'free',
        'foxedpage.net': 'taken',
        'foxedpage.io': 'unknown',
      }),
      prices: PRICES,
    });

    assert.deepEqual(domains(rows), ['foxedpage.com']);
  });

  it('lists nothing until the shared domain’s own lookup is in', () => {
    const rows = cardRows({
      shared: 'foxedpage.com',
      siblings: ['foxedpage.com', 'foxedpage.net'],
      liked: undefined,
      verdicts: verdicts({ 'foxedpage.net': 'free' }),
      prices: PRICES,
    });

    assert.deepEqual(rows, []);
  });

  it('marks the shared domain liked where it is the liked one', () => {
    const rows = cardRows({
      shared: 'foxedpage.com',
      siblings: ['foxedpage.com', 'foxedpage.net'],
      liked: 'foxedpage.com',
      verdicts: verdicts({ 'foxedpage.com': 'free', 'foxedpage.net': 'free' }),
      prices: PRICES,
    });

    assert.deepEqual(
      rows.map(({ liked }) => liked),
      [true, false],
    );
  });

  it('lists taken domains with their years where the shared one is taken', () => {
    const rows = cardRows({
      shared: 'foxedpage.net',
      siblings: [
        'foxedpage.com',
        'foxedpage.net',
        'foxedpage.io',
        'foxedpage.ai',
        'foxedpage.org',
      ],
      liked: undefined,
      verdicts: new Map<string, Verdict>([
        ['foxedpage.com', { state: 'taken', since: '2009' }],
        ['foxedpage.net', { state: 'taken', since: '2014' }],
        ['foxedpage.io', { state: 'unknown' }],
        ['foxedpage.ai', { state: 'taken', since: undefined }],
        ['foxedpage.org', { state: 'taken', since: '2001' }],
      ]),
      prices: PRICES,
    });

    assert.deepEqual(rows, [
      {
        domain: 'foxedpage.net',
        state: 'taken',
        since: '2014',
        liked: false,
        price: undefined,
      },
      {
        domain: 'foxedpage.com',
        state: 'taken',
        since: '2009',
        liked: false,
        price: undefined,
      },
      {
        domain: 'foxedpage.ai',
        state: 'taken',
        since: undefined,
        liked: false,
        price: undefined,
      },
    ]);
  });
});

describe('cardLead', () => {
  it('takes the first lead free or may be over an earlier taken one', () => {
    assert.equal(
      cardLead(['foxedpage.com', undefined, 'foxed.page', 'foxedpage.net'], {
        verdicts: verdicts({
          'foxedpage.com': 'taken',
          'foxed.page': 'maybe',
          'foxedpage.net': 'free',
        }),
      }),
      'foxed.page',
    );
  });

  it('falls back to the first taken lead where none is registrable', () => {
    assert.equal(
      cardLead([undefined, 'foxedpage.com', 'foxedpage.net'], {
        verdicts: verdicts({
          'foxedpage.com': 'unknown',
          'foxedpage.net': 'taken',
        }),
      }),
      'foxedpage.net',
    );
  });

  it('has none while no lead has a verdict', () => {
    assert.equal(
      cardLead(['foxedpage.com'], {
        verdicts: verdicts({ 'foxedpage.com': 'unknown' }),
      }),
      undefined,
    );
  });
});

describe('domainLink', () => {
  it('links the page it is on, whatever hash it carries', () => {
    assert.equal(
      domainLink('foxed.page', new URL('https://unsquatted.com/#thawdate')),
      'https://unsquatted.com/#foxed.page',
    );
  });
});
