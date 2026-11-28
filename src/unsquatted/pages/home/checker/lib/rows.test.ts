import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cleanLabel,
  domainHacks,
  rowsFor,
  splitsIntoWords,
  typedZone,
  ZONES,
} from './rows';

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
const SOLD = [...ZONES, 'de', 'bible', 'design', 'tips', 'fo', 'desi'];

/** A dictionary just big enough for the names below. */
const WORDS = new Set([
  'bible',
  'love',
  'lovers',
  'design',
  'tips',
  'fox',
  'foxed',
  'page',
  'cal',
]);

describe('splitsIntoWords', () => {
  it('reads words run together', () => {
    assert.equal(splitsIntoWords('foxedpage', WORDS), true);
    assert.equal(splitsIntoWords('lovers', WORDS), true);
  });

  it('refuses anything left over', () => {
    assert.equal(splitsIntoWords('ical', WORDS), false);
    assert.equal(splitsIntoWords('xedpage', WORDS), false);
  });
});

describe('domainHacks', () => {
  it('splits a name that ends in a zone, longest zone first', () => {
    assert.deepEqual(domainHacks('fuckapp', SOLD, WORDS), ['fuck.app']);
    assert.deepEqual(domainHacks('nordeco', SOLD, WORDS), ['norde.co']);
    assert.deepEqual(domainHacks('agenticbible', SOLD, WORDS), [
      'agentic.bible',
    ]);
  });

  it('splits a name that starts with a word-zone and runs on in words', () => {
    assert.deepEqual(domainHacks('biblelovers', SOLD, WORDS), ['lovers.bible']);
    assert.deepEqual(domainHacks('designtips', SOLD, WORDS), [
      'tips.design',
      'design.tips',
    ]);
  });

  it('leaves the start alone where the zone or the rest is no word', () => {
    assert.deepEqual(domainHacks('bibleical', SOLD, WORDS), []);
    assert.deepEqual(domainHacks('foxedpage', SOLD, WORDS), ['foxed.page']);
  });

  it('leaves the start alone until the dictionary arrives', () => {
    assert.deepEqual(domainHacks('biblelovers', SOLD, undefined), []);
  });

  it('leaves a name that is only the zone, or spells none', () => {
    assert.deepEqual(domainHacks('app', SOLD, WORDS), []);
    assert.deepEqual(domainHacks('timberfare', SOLD, WORDS), []);
  });

  it('skips a split that would leave a hyphen at the dot', () => {
    assert.deepEqual(domainHacks('fox-io', SOLD, WORDS), []);
  });

  it('keeps three at most', () => {
    const zones = ['app', 'dev', 'xyz', 'devxyz', 'appdev'];

    assert.equal(
      domainHacks('appdevxyz', zones, new Set(['app', 'dev', 'xyz', 'appdev']))
        .length,
      3,
    );
  });
});

describe('rowsFor', () => {
  it('puts a split name right after .com, behind a typed zone', () => {
    const rows = rowsFor('fuckapp', 'de', SOLD, WORDS);

    assert.deepEqual(
      rows.slice(0, 4).map(({ domain }) => domain),
      ['fuckapp.de', 'fuckapp.com', 'fuck.app', 'fuckapp.net'],
    );
  });

  it('shows .com once where it was typed', () => {
    const rows = rowsFor('fuckapp', 'com', SOLD, WORDS);

    assert.deepEqual(
      rows.slice(0, 3).map(({ domain }) => domain),
      ['fuckapp.com', 'fuck.app', 'fuckapp.net'],
    );
    assert.equal(rows.length, ZONES.length + 1);
  });

  it('shows every zone when none was typed', () => {
    assert.equal(rowsFor('fox', undefined, SOLD, WORDS).length, ZONES.length);
  });

  it('leads with a typed zone it checks, without repeating it', () => {
    const rows = rowsFor('fox', 'dev', SOLD, WORDS);

    assert.deepEqual(rows[0], { domain: 'fox.dev', checkable: true });
    assert.equal(rows.length, ZONES.length);
  });

  it('checks a typed zone Porkbun sells outside the shown ones', () => {
    assert.deepEqual(rowsFor('fox', 'design', SOLD, WORDS)[0], {
      domain: 'fox.design',
      checkable: true,
    });
  });

  it('leads with a typed zone it cannot check, marked so', () => {
    const rows = rowsFor('fox', 'ru', SOLD, WORDS);

    assert.deepEqual(rows[0], { domain: 'fox.ru', checkable: false });
    assert.equal(rows.length, ZONES.length + 1);
  });
});
