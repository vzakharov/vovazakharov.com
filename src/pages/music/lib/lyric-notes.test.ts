import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { readVerse, withoutNotes } from './lyric-notes';

const FILE = 'song.md';

describe('readVerse', () => {
  it('hangs a note off a phrase, and off a whole line', () => {
    const verse = [
      'Go [down][^down], Moses',
      'Let my people go[^go]',
      '',
      '[^down]: To Egypt.',
      '[^go]: Exodus 5:1.',
    ].join('\n');

    assert.deepEqual(readVerse(verse, FILE), [
      [
        [
          { text: 'Go ' },
          { text: 'down', note: 'To Egypt.' },
          { text: ', Moses' },
        ],
        [{ text: 'Let my people go', note: 'Exodus 5:1.' }],
      ],
    ]);
  });

  it('joins consecutive lines ending in one label into one noted block', () => {
    const verse = [
      'Before',
      'One[^three]',
      'Two[^three]',
      'Three[^three]',
      'After',
      '',
      '[^three]: All three.',
    ].join('\n');

    assert.deepEqual(readVerse(verse, FILE), [
      [
        [{ text: 'Before' }],
        [{ text: 'One\nTwo\nThree', note: 'All three.' }],
        [{ text: 'After' }],
      ],
    ]);
  });

  it('keeps a label reused apart, or across a stanza, as separate notes', () => {
    const verse = [
      'Chorus[^chorus]',
      'Verse',
      'Chorus[^chorus]',
      '',
      'Chorus[^chorus]',
      '',
      '[^chorus]: The refrain.',
    ].join('\n');
    const noted = { text: 'Chorus', note: 'The refrain.' };

    assert.deepEqual(readVerse(verse, FILE), [
      [[noted], [{ text: 'Verse' }], [noted]],
      [[noted]],
    ]);
  });

  it('does not join a whole-line note to the same label on a phrase', () => {
    const verse = ['One[^n]', 'and [two][^n]', '', '[^n]: A note.'].join('\n');

    assert.deepEqual(readVerse(verse, FILE), [
      [
        [{ text: 'One', note: 'A note.' }],
        [{ text: 'and ' }, { text: 'two', note: 'A note.' }],
      ],
    ]);
  });

  it('fails on a marker with no definition, and a definition nothing carries', () => {
    assert.throws(() => readVerse('Line[^missing]', FILE), /no definition/);
    assert.throws(
      () => readVerse('Line\n\n[^spare]: Unused.', FILE),
      /nothing carries/,
    );
  });
});

describe('withoutNotes', () => {
  it('keeps a joined block’s line breaks', () => {
    const verse = 'One[^n]\nTwo[^n]\n\n[^n]: A note.';

    assert.deepEqual(withoutNotes(readVerse(verse, FILE)), [
      [[{ text: 'One\nTwo' }]],
    ]);
  });
});
