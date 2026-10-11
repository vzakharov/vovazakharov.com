import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { localeProse, localeUniverse, splitStanzas } from './sections';

describe('localeUniverse', () => {
  const body = [
    'Shared',
    '<!-- universe:en -->',
    'World',
    '<!-- lang:en -->',
    'Making of',
    '<!-- universe:ru -->',
    '<!-- a note -->',
  ].join('\n');

  it('cuts its own section, without the preamble', () => {
    assert.equal(localeUniverse(body, 'en'), 'World');
  });

  it('reads a section of nothing but comments as absent', () => {
    assert.equal(localeUniverse(body, 'ru'), undefined);
  });

  it('leaves the story to the lang section alone', () => {
    assert.equal(localeProse(body, 'en'), 'Shared\n\nMaking of');
  });
});

describe('splitStanzas', () => {
  it('drops comment lines, and a stanza holding nothing else', () => {
    const verse = [
      '<!-- voice: Майя -->',
      'First',
      '',
      '<!-- solo -->',
      '',
      '<!-- voice: Кирилл -->',
      'Second',
    ].join('\n');

    assert.deepEqual(splitStanzas(verse), [['First'], ['Second']]);
  });
});
