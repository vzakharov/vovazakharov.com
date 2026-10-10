import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { splitStanzas } from './sections';

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
