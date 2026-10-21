import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { localeProse, localePrelude, splitStanzas } from './sections';

describe('localePrelude', () => {
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
    assert.equal(localePrelude(body, 'en'), 'World');
  });

  it('reads a section of nothing but comments as absent', () => {
    assert.equal(localePrelude(body, 'ru'), undefined);
  });

  it('leaves the story to the lang section alone', () => {
    assert.equal(localeProse(body, 'en'), 'Shared\n\nMaking of');
  });

  it('cuts a poem section the same way', () => {
    assert.equal(
      localePrelude('<!-- poem:en -->\nThe poem\n<!-- lang:en -->\nMine', 'en'),
      'The poem',
    );
  });

  it('refuses a file telling both a universe and a poem', () => {
    assert.throws(() =>
      localePrelude('<!-- universe:en -->\nWorld\n<!-- poem:en -->\nPoem', 'en'),
    );
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
