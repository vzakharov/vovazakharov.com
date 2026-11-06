import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

<<<<<<< HEAD:src/unsquatted/widgets/field-tools/lib/share.test.ts
import type { Verdict } from '@/unsquatted/entities/domain/index.node-safe';

import { cardRows, domainLink } from './share';
=======
import type { Verdict } from '../../verdict';
import {
  cardLead,
  cardRows,
  cardSettled,
  domainLink,
  fieldRow,
  offersNothing,
} from './share';
>>>>>>> origin/main:src/unsquatted/pages/home/field-tools/lib/share.test.ts

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
      typed: undefined,
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
      typed: undefined,
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
      typed: undefined,
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
      typed: undefined,
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

  it('leaves a taken typed domain to the field, the free ones in rows', () => {
    const lookups = {
      verdicts: new Map<string, Verdict>([
        ['pisem.com', { state: 'taken', since: '2003' }],
        ['pisem.org', { state: 'free' }],
        ['pisem.net', { state: 'taken', since: '2024' }],
        ['pisem.io', { state: 'maybe' }],
        ['pisem.ai', { state: 'free' }],
      ]),
      prices: PRICES,
    };
    const rows = cardRows({
      typed: 'pisem.net',
      shared: 'pisem.org',
      siblings: ['pisem.com', 'pisem.org', 'pisem.net', 'pisem.io', 'pisem.ai'],
      liked: undefined,
      ...lookups,
    });

    assert.deepEqual(domains(rows), ['pisem.org', 'pisem.io', 'pisem.ai']);
    assert.equal(offersNothing(rows), false);
    assert.deepEqual(fieldRow('pisem.net', undefined, lookups), {
      domain: 'pisem.net',
      state: 'taken',
      since: '2024',
      liked: false,
      price: undefined,
    });
  });

  it('leaves a free typed domain to the field, its free siblings in rows', () => {
    const rows = cardRows({
      typed: 'foxedpage.com',
      shared: 'foxedpage.com',
      siblings: ['foxedpage.com', 'foxedpage.net', 'foxedpage.org'],
      liked: undefined,
      verdicts: verdicts({
        'foxedpage.com': 'free',
        'foxedpage.net': 'free',
        'foxedpage.org': 'taken',
      }),
      prices: PRICES,
    });

    assert.deepEqual(domains(rows), ['foxedpage.net']);
  });
});

describe('fieldRow', () => {
  it('has none for a name typed with no zone, or a lookup not in', () => {
    const lookups = {
      verdicts: verdicts({ 'pisem.net': 'unknown' }),
      prices: PRICES,
    };

    assert.equal(fieldRow(undefined, undefined, lookups), undefined);
    assert.equal(fieldRow('pisem.net', undefined, lookups), undefined);
    assert.equal(fieldRow('pisem.org', undefined, lookups), undefined);
  });

  it('lists taken domains with their years where the shared one is taken', () => {
    const rows = cardRows({
      typed: undefined,
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
  const ALL = ['foxedpage.com', 'foxed.page', 'foxedpage.net'];

  it('takes the first lead free or may be over an earlier taken one', () => {
    assert.equal(
      cardLead(
        ['foxedpage.com', undefined, 'foxed.page', 'foxedpage.net'],
        ALL,
        {
          verdicts: verdicts({
            'foxedpage.com': 'taken',
            'foxed.page': 'maybe',
            'foxedpage.net': 'free',
          }),
        },
      ),
      'foxed.page',
    );
  });

  it('falls back to the first taken lead where none is registrable', () => {
    assert.equal(
      cardLead([undefined, 'foxedpage.com', 'foxedpage.net'], ALL, {
        verdicts: verdicts({
          'foxedpage.com': 'unknown',
          'foxedpage.net': 'taken',
        }),
      }),
      'foxedpage.net',
    );
  });

  it('leads with a taken domain where the only free one is off screen', () => {
    assert.equal(
      cardLead(['foxedpage.com', 'foxedpage.fyi'], ['foxedpage.com'], {
        verdicts: verdicts({
          'foxedpage.com': 'taken',
          'foxedpage.fyi': 'maybe',
        }),
      }),
      'foxedpage.com',
    );
  });

  it('has none while no lead has a verdict', () => {
    assert.equal(
      cardLead(['foxedpage.com'], ALL, {
        verdicts: verdicts({ 'foxedpage.com': 'unknown' }),
      }),
      undefined,
    );
  });
});

describe('cardSettled', () => {
  const SIBLINGS = ['a.com', 'a.net', 'a.org', 'a.io'];
  const ORDER = [undefined, undefined, ...SIBLINGS];
  const card = (states: Record<string, Verdict['state']>) => {
    const known = verdicts(states);
    const shared = cardLead(ORDER, ['a.com', 'a.net'], { verdicts: known });

    assert.ok(shared !== undefined);
    const rows = cardRows({
      typed: undefined,
      shared,
      siblings: SIBLINGS,
      liked: undefined,
      verdicts: known,
      prices: PRICES,
    });

    return cardSettled(rows, ORDER, ['a.com', 'a.net'], { verdicts: known });
  };

  it('holds once three free rows lead, the rest unanswered', () => {
    assert.equal(
      card({ 'a.com': 'free', 'a.net': 'free', 'a.org': 'free' }),
      true,
    );
  });

  it('waits while a domain ahead of the last row is unanswered', () => {
    assert.equal(
      card({ 'a.com': 'free', 'a.org': 'free', 'a.io': 'free' }),
      false,
    );
  });

  it('waits while the card is not full', () => {
    assert.equal(card({ 'a.com': 'free', 'a.net': 'free' }), false);
  });

  it('holds free rows under a taken typed domain without the rest of the screen', () => {
    const known = verdicts({
      'a.com': 'taken',
      'a.net': 'free',
      'a.org': 'free',
      'a.io': 'free',
    });
    const order = ['a.com', undefined, ...SIBLINGS];
    const shown = [...SIBLINGS, 'a.dev'];
    const rows = cardRows({
      typed: 'a.com',
      shared: 'a.net',
      siblings: SIBLINGS,
      liked: undefined,
      verdicts: known,
      prices: PRICES,
    });

    assert.deepEqual(domains(rows), ['a.net', 'a.org', 'a.io']);
    assert.equal(cardSettled(rows, order, shown, { verdicts: known }), true);
  });

  it('holds a taken card only once every domain on screen answered', () => {
    assert.equal(
      card({ 'a.com': 'taken', 'a.net': 'taken', 'a.org': 'taken' }),
      true,
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
