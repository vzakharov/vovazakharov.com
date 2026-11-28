import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dohVerdict, freesIn, parseBootstrap, rdapVerdict } from './verdict';

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

const dates =
  (events: Record<string, string>) =>
  (action: string): string | undefined =>
    events[action];

describe('freesIn', () => {
  const changed = '2027-09-01T00:00:00Z';
  const release = Date.parse(changed) + 5 * 86_400_000;
  const before = (ms: number) => release - ms;
  const pending = ['pending delete'];

  it('counts down five days from entering pending delete', () => {
    const dated = dates({ 'last changed': changed });

    assert.deepEqual(freesIn(pending, dated, before(36 * 3_600_000)), {
      left: 2,
      unit: 'day',
    });
    assert.deepEqual(freesIn(pending, dated, before(3_600_000)), {
      left: 1,
      unit: 'hour',
    });
    assert.deepEqual(freesIn(pending, dated, before(90_000)), {
      left: 2,
      unit: 'minute',
    });
    assert.equal(freesIn(pending, dated, before(-60_000)), 'now');
  });

  it('takes the registry’s own deletion date over the count', () => {
    const dated = dates({
      'last changed': changed,
      deletion: new Date(release + 86_400_000).toISOString(),
    });

    assert.deepEqual(freesIn(pending, dated, before(0)), {
      left: 1,
      unit: 'day',
    });
  });

  it('has nothing to count from without a date', () => {
    assert.equal(freesIn(pending, dates({}), before(0)), 'soon');
  });

  it('promises nothing for a name its owner can still renew', () => {
    assert.equal(
      freesIn(
        ['redemption period'],
        dates({ 'last changed': changed }),
        before(0),
      ),
      undefined,
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

  const expires = '2027-07-29T00:00:00Z';

  it('reads a record as taken since its registration year, until its expiry', () => {
    assert.deepEqual(
      rdapVerdict(200, { events }, Date.parse('2026-10-29T00:00:00Z')),
      { state: 'taken', since: '2026', expires },
    );
  });

  it('says when a name in pending delete is released', () => {
    assert.deepEqual(
      rdapVerdict(
        200,
        {
          status: ['pending delete'],
          events: [
            ...events,
            { eventAction: 'last changed', eventDate: '2027-09-01T00:00:00Z' },
          ],
        },
        Date.parse('2027-09-03T00:00:00Z'),
      ),
      {
        state: 'taken',
        since: '2026',
        expires,
        frees: { left: 3, unit: 'day' },
      },
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

  it('refuses a record of another shape', () => {
    assert.throws(() => rdapVerdict(200, { status: 'active' }));
    assert.throws(() => rdapVerdict(200, { events: [{ eventAction: 1 }] }));
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

  it('refuses an answer without a status', () => {
    assert.throws(() => dohVerdict({}));
  });
});
