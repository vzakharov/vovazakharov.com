import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { domainsList, nameAcross } from './widget-attributes';

const placeholder = (
  name: string,
  attributes: Record<string, string>,
  items: string[] = [],
) => ({ name, attributes, items, source: 'singles-day.md' });

describe('domainsList', () => {
  it('anchors on its label', () => {
    assert.deepEqual(
      domainsList(
        placeholder('domains', { label: 'A party of one' }, ['monachal.com']),
      ),
      {
        label: 'A party of one',
        domains: ['monachal.com'],
        anchor: 'a-party-of-one',
      },
    );
  });

  it('throws on an item that is no domain, naming the file', () => {
    assert.throws(
      () =>
        domainsList(placeholder('domains', { label: 'x' }, ['monachal com'])),
      /singles-day\.md.*monachal com/,
    );
  });

  it('throws on an empty list and on an unknown attribute', () => {
    assert.throws(() => domainsList(placeholder('domains', { label: 'x' })));
    assert.throws(() =>
      domainsList(
        placeholder('domains', { label: 'x', lable: 'y' }, ['a.com']),
      ),
    );
  });
});

describe('nameAcross', () => {
  it('spreads the word over the zones it names', () => {
    assert.deepEqual(
      nameAcross(
        placeholder('name', { word: 'single', zones: 'com,shop', note: 'no' }),
      ),
      {
        word: 'single',
        domains: ['single.com', 'single.shop'],
        note: 'no',
        anchor: 'single',
      },
    );
  });

  it('falls back to the common zones', () => {
    assert.deepEqual(
      nameAcross(placeholder('name', { word: 'solo' })).domains,
      ['solo.com', 'solo.net', 'solo.org'],
    );
  });

  it('throws on a word no label may be', () => {
    assert.throws(
      () => nameAcross(placeholder('name', { word: 'Solo!' })),
      /singles-day\.md/,
    );
  });
});
