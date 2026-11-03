import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deduped, likeOf, parseLiked, preferredOf, withLike } from './liked';

describe('likeOf', () => {
  it('carries the zone typed with the name', () => {
    assert.equal(likeOf('foxedpage', 'com'), 'foxedpage.com');
    assert.equal(likeOf('foxedpage', undefined), 'foxedpage');
  });
});

describe('preferredOf', () => {
  it('is the like itself where it names a zone', () => {
    assert.equal(preferredOf('foxed.co.uk'), 'foxed.co.uk');
    assert.equal(preferredOf('foxedpage'), undefined);
  });
});

describe('withLike', () => {
  it('replaces the like of the same name in its place', () => {
    assert.deepEqual(withLike(['foxedpage', 'thawdate.com'], 'foxedpage.org'), [
      'foxedpage.org',
      'thawdate.com',
    ]);
  });

  it('adds a new name ahead of the rest', () => {
    assert.deepEqual(withLike(['thawdate.com'], 'foxedpage'), [
      'foxedpage',
      'thawdate.com',
    ]);
  });
});

describe('deduped', () => {
  it('keeps each name’s first like', () => {
    assert.deepEqual(
      deduped(['foxedpage.com', 'thawdate', 'foxedpage.org', 'foxedpage']),
      ['foxedpage.com', 'thawdate'],
    );
  });
});

describe('parseLiked', () => {
  it('cleans each line as the field does, keeping the order', () => {
    assert.deepEqual(
      parseLiked(' https://www.FoxedPage.com/about \nfoxed.page\nthawdate'),
      { liked: ['foxedpage.com', 'foxed.page', 'thawdate'], invalid: [] },
    );
  });

  it('drops blank lines and a name’s later lines', () => {
    assert.deepEqual(parseLiked('a.com\n\n  \nA.io\nb\n'), {
      liked: ['a.com', 'b'],
      invalid: [],
    });
  });

  it('names every line that is no name or domain', () => {
    assert.deepEqual(parseLiked('a.com\n-bad-.com\nb.c0m!\nfoxed page'), {
      liked: ['a.com'],
      invalid: ['-bad-.com', 'b.c0m!', 'foxed page'],
    });
  });
});
