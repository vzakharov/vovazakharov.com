import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { localeAside, localeProse, splitStanzas } from './sections';

describe('localeAside', () => {
  const body = [
    'Shared',
    '<!-- universe:en -->',
    'World',
    '<!-- lang:en -->',
    'Making of',
    '<!-- hook:en -->',
    '<!-- a note -->',
  ].join('\n');

  it('cuts its own section, without the preamble', () => {
    assert.equal(localeAside(body, 'universe', 'en'), 'World');
  });

  it('reads a section of nothing but comments as absent', () => {
    assert.equal(localeAside(body, 'hook', 'en'), undefined);
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
