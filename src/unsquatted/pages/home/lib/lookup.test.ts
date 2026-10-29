import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cleanLabel,
  dohVerdict,
  domainHacks,
  expiringIn,
  parseBootstrap,
  rdapVerdict,
  rowsFor,
  typedZone,
  ZONES,
} from './lookup';

describe('cleanLabel', () => {
  it('keeps a plain name', () => {
    assert.equal(cleanLabel('foxedpage'), 'foxedpage');
  });

  it('reads the label out of a pasted URL', () => {
    assert.equal(cleanLabel(' https://www.FoxedPage.com/about '), 'foxedpage');
  });

  it('drops what no label may hold, and hyphens at either end', () => {
    assert.equal(cleanLabel('-foxed page!-'), 'foxedpage');
  });

  it('stops at DNS’s 63 characters', () => {
    assert.equal(cleanLabel('a'.repeat(70)).length, 63);
  });
});

describe('typedZone', () => {
  it('reads the zone after the name, however many labels it has', () => {
    assert.equal(typedZone('https://www.FoxedPage.co.uk/about'), 'co.uk');
  });

  it('is undefined for a bare name or a trailing dot', () => {
    assert.equal(typedZone('foxedpage'), undefined);
    assert.equal(typedZone('foxedpage.'), undefined);
  });
});

describe('domainHacks', () => {
  it('splits a name that ends in a zone, longest zone first', () => {
    assert.deepEqual(domainHacks('fuckapp'), ['fuck.app']);
    assert.deepEqual(domainHacks('nordeco'), ['norde.co']);
  });

  it('leaves a name that is only the zone, or ends in none', () => {
    assert.deepEqual(domainHacks('app'), []);
    assert.deepEqual(domainHacks('foxedpage'), []);
  });

  it('skips a split that would leave a hyphen at the dot', () => {
    assert.deepEqual(domainHacks('fox-io'), []);
  });
});

describe('rowsFor', () => {
  it('puts a split name before the zones, after a typed one', () => {
    const rows = rowsFor('fuckapp', 'de');

    assert.deepEqual(
      rows.slice(0, 3).map(({ domain }) => domain),
      ['fuckapp.de', 'fuck.app', 'fuckapp.com'],
    );
  });

  it('shows every zone when none was typed', () => {
    assert.equal(rowsFor('fox', undefined).length, ZONES.length);
  });

  it('leads with a typed zone it checks, without repeating it', () => {
    const rows = rowsFor('fox', 'dev');

    assert.deepEqual(rows[0], { domain: 'fox.dev', checkable: true });
    assert.equal(rows.length, ZONES.length);
  });

  it('leads with a typed zone it cannot check, marked so', () => {
    const rows = rowsFor('fox', 'ru');

    assert.deepEqual(rows[0], { domain: 'fox.ru', checkable: false });
    assert.equal(rows.length, ZONES.length + 1);
  });
});

describe('parseBootstrap', () => {
  it('maps every zone of a service to its first base, slash-terminated', () => {
    const servers = parseBootstrap({
      services: [
        [['com', 'net'], ['https://rdap.verisign.com/com/v1']],
        [['dev'], ['https://pubapi.registry.google/rdap/', 'https://other/']],
      ],
    });

    assert.equal(servers.get('net'), 'https://rdap.verisign.com/com/v1/');
    assert.equal(servers.get('dev'), 'https://pubapi.registry.google/rdap/');
  });

  it('refuses a file of another shape', () => {
    assert.throws(() => parseBootstrap({ services: 'none' }));
  });
});

describe('expiringIn', () => {
  const expires = '2027-07-29T00:00:00Z';
  const before = (ms: number) => Date.parse(expires) - ms;

  it('counts in the largest whole unit, rounding up', () => {
    assert.equal(
      expiringIn(expires, before(36 * 3_600_000)),
      'expires in 2 days',
    );
    assert.equal(
      expiringIn(expires, before(3_600_000)),
      'expires in 1 hour',
    );
    assert.equal(
      expiringIn(expires, before(90_000)),
      'expires in 2 minutes',
    );
  });

  it('stays quiet over a week out', () => {
    assert.equal(
      expiringIn(expires, before(8 * 86_400_000)),
      undefined,
    );
  });

  it('says a lapsed one has expired', () => {
    assert.equal(
      expiringIn(expires, before(-60_000)),
      'expired',
    );
  });
});

describe('rdapVerdict', () => {
  it('reads 404 as free', () => {
    assert.deepEqual(rdapVerdict(404, undefined), { state: 'free' });
  });

  const events = [
    { eventAction: 'expiration', eventDate: '2027-07-29T00:00:00Z' },
    { eventAction: 'registration', eventDate: '2026-07-29T00:00:00Z' },
  ];

  it('reads a record as taken since its registration year', () => {
    assert.deepEqual(
      rdapVerdict(200, { events }, Date.parse('2026-10-29T00:00:00Z')),
      { state: 'taken', since: '2026' },
    );
  });

  it('says when a first-year registration is about to lapse', () => {
    assert.deepEqual(
      rdapVerdict(200, { events }, Date.parse('2027-07-26T00:00:00Z')),
      { state: 'taken', since: '2026', expiring: 'expires in 3 days' },
    );
  });

  it('reads a record without events as taken, year unknown', () => {
    assert.deepEqual(rdapVerdict(200, {}), {
      state: 'taken',
      since: undefined,
    });
  });

  it('reads a rate limit as no answer', () => {
    assert.deepEqual(rdapVerdict(429, undefined), { state: 'unknown' });
  });
});

describe('dohVerdict', () => {
  it('reads NXDOMAIN as maybe free', () => {
    assert.deepEqual(dohVerdict({ Status: 3 }), { state: 'maybe' });
  });

  it('reads NOERROR as taken', () => {
    assert.deepEqual(dohVerdict({ Status: 0 }), {
      state: 'taken',
      since: undefined,
    });
  });

  it('reads SERVFAIL as no answer', () => {
    assert.deepEqual(dohVerdict({ Status: 2 }), { state: 'unknown' });
  });
});
