import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cleanLabel,
  dohVerdict,
  domainHacks,
  freesIn,
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

/** `ZONES` and a few of the zones Porkbun sells besides. */
const SOLD = [...ZONES, 'bible', 'design', 'tips', 'page', 'fo', 'desi'];

describe('domainHacks', () => {
  it('splits a name that ends in a zone, longest zone first', () => {
    assert.deepEqual(domainHacks('fuckapp', SOLD), ['fuck.app']);
    assert.deepEqual(domainHacks('nordeco', SOLD), ['norde.co']);
    assert.deepEqual(domainHacks('agenticbible', SOLD), ['agentic.bible']);
  });

  it('splits a name that starts with a zone of three letters or more', () => {
    assert.deepEqual(domainHacks('designtips', SOLD), [
      'tips.design',
      'design.tips',
      'gntips.desi',
    ]);
    assert.deepEqual(domainHacks('foxedpage', SOLD), ['foxed.page']);
  });

  it('leaves a name that is only the zone, or spells none', () => {
    assert.deepEqual(domainHacks('app', SOLD), []);
    assert.deepEqual(domainHacks('timberfare', SOLD), []);
  });

  it('skips a split that would leave a hyphen at the dot', () => {
    assert.deepEqual(domainHacks('fox-io', SOLD), []);
  });

  it('keeps three at most', () => {
    assert.equal(
      domainHacks('appdevxyz', ['app', 'dev', 'xyz', 'devxyz', 'appdev'])
        .length,
      3,
    );
  });
});

describe('rowsFor', () => {
  it('puts a split name before the zones, after a typed one', () => {
    const rows = rowsFor('fuckapp', 'de', SOLD);

    assert.deepEqual(
      rows.slice(0, 3).map(({ domain }) => domain),
      ['fuckapp.de', 'fuck.app', 'fuckapp.com'],
    );
  });

  it('shows every zone when none was typed', () => {
    assert.equal(rowsFor('fox', undefined, SOLD).length, ZONES.length);
  });

  it('leads with a typed zone it checks, without repeating it', () => {
    const rows = rowsFor('fox', 'dev', SOLD);

    assert.deepEqual(rows[0], { domain: 'fox.dev', checkable: true });
    assert.equal(rows.length, ZONES.length);
  });

  it('checks a typed zone Porkbun sells outside the shown ones', () => {
    assert.deepEqual(rowsFor('fox', 'design', SOLD)[0], {
      domain: 'fox.design',
      checkable: true,
    });
  });

  it('leads with a typed zone it cannot check, marked so', () => {
    const rows = rowsFor('fox', 'ru', SOLD);

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

  it('reads a record as taken since its registration year', () => {
    assert.deepEqual(
      rdapVerdict(200, { events }, Date.parse('2026-10-29T00:00:00Z')),
      { state: 'taken', since: '2026' },
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
      { state: 'taken', since: '2026', frees: { left: 3, unit: 'day' } },
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
