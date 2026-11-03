import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { grouped, parseLiked } from './liked';

describe('grouped', () => {
  it('folds a name’s other zones into the chip of its first', () => {
    assert.deepEqual(
      grouped(['foxedpage.com', 'thawdate.com', 'foxedpage.org']),
      [
        {
          name: 'foxedpage',
          shown: 'foxedpage.com',
          domains: ['foxedpage.com', 'foxedpage.org'],
        },
        { name: 'thawdate', shown: 'thawdate.com', domains: ['thawdate.com'] },
      ],
    );
  });

  it('folds a split at the end into the name it spells', () => {
    assert.deepEqual(grouped(['foxed.page', 'foxedpage.com']), [
      {
        name: 'foxedpage',
        shown: 'foxedpage.com',
        domains: ['foxed.page', 'foxedpage.com'],
      },
    ]);
  });

  it('folds a split at the start into the name it spells', () => {
    assert.deepEqual(grouped(['designtips.com', 'tips.design']), [
      {
        name: 'designtips',
        shown: 'designtips.com',
        domains: ['designtips.com', 'tips.design'],
      },
    ]);
  });

  it('leaves a split alone where nothing of the name it spells is liked', () => {
    assert.deepEqual(grouped(['foxed.page']), [
      { name: 'foxed', shown: 'foxed.page', domains: ['foxed.page'] },
    ]);
  });

  it('joins no split across a zone of several labels', () => {
    assert.deepEqual(
      grouped(['foxed.co.uk', 'foxedco.com']).map(({ name }) => name),
      ['foxed', 'foxedco'],
    );
  });
});

describe('parseLiked', () => {
  it('cleans each line as the field does, keeping the order', () => {
    assert.deepEqual(
      parseLiked(' https://www.FoxedPage.com/about \nfoxed.page'),
      { liked: ['foxedpage.com', 'foxed.page'], invalid: [] },
    );
  });

  it('drops blank lines and repeats', () => {
    assert.deepEqual(parseLiked('a.com\n\n  \nA.com\nb.io\n'), {
      liked: ['a.com', 'b.io'],
      invalid: [],
    });
  });

  it('names every line that is no domain', () => {
    assert.deepEqual(parseLiked('a.com\nfoxedpage\n-bad-.com\nb.c0m!'), {
      liked: ['a.com'],
      invalid: ['foxedpage', '-bad-.com', 'b.c0m!'],
    });
  });
});
