import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cleanLabel, dohVerdict, parseBootstrap, rdapVerdict } from './lookup';

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

describe('rdapVerdict', () => {
  it('reads 404 as free', () => {
    assert.deepEqual(rdapVerdict(404, undefined), { state: 'free' });
  });

  it('reads a record as taken since its registration year', () => {
    assert.deepEqual(
      rdapVerdict(200, {
        events: [
          { eventAction: 'expiration', eventDate: '2027-07-29T00:00:00Z' },
          { eventAction: 'registration', eventDate: '2026-07-29T00:00:00Z' },
        ],
      }),
      { state: 'taken', since: '2026' },
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
