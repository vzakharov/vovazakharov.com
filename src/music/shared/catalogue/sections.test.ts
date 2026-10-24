import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  localePrelude,
  localeProse,
  splitStanzas,
  storyOrder,
} from './sections.ts';

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
    assert.deepEqual(localePrelude(body, 'en'), {
      kind: 'universe',
      text: 'World',
      follows: false,
    });
  });

  it('reads a section of nothing but comments as absent', () => {
    assert.equal(localePrelude(body, 'ru'), undefined);
  });

  it('leaves the story to the lang section alone', () => {
    assert.equal(localeProse(body, 'en'), 'Shared\n\nMaking of');
  });

  it('cuts a source section the same way', () => {
    assert.deepEqual(
      localePrelude(
        '<!-- source:en -->\nThe source\n<!-- lang:en -->\nMine',
        'en',
      ),
      { kind: 'source', text: 'The source', follows: false },
    );
  });

  it('follows the story where the file tells it after', () => {
    assert.equal(
      localePrelude(
        '<!-- lang:en -->\nMine\n<!-- source:en -->\nThe source',
        'en',
      )?.follows,
      true,
    );
  });

  it('refuses a file telling both a universe and a source', () => {
    assert.throws(() =>
      localePrelude(
        '<!-- universe:en -->\nWorld\n<!-- source:en -->\nSource',
        'en',
      ),
    );
  });
});

describe('storyOrder', () => {
  const headings = {
    behindTheScenes: 'Behind',
    preludeHeadings: { universe: 'World', source: 'Source' },
  };

  it('titles the story when the prelude leads', () => {
    assert.deepEqual(
      storyOrder({ kind: 'source', follows: false }, {}, headings).map(
        ({ heading }) => heading,
      ),
      [undefined, 'Behind'],
    );
  });

  it('titles the prelude by its kind when it follows', () => {
    assert.deepEqual(
      storyOrder({ kind: 'source', follows: true }, {}, headings).map(
        ({ heading }) => heading,
      ),
      [undefined, 'Source'],
    );
  });

  it('leaves a part standing alone untitled', () => {
    assert.deepEqual(storyOrder(undefined, {}, headings), [{ part: {} }]);
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
