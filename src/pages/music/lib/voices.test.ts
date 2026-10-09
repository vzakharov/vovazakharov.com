import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { singerSchema } from '@/shared/music-catalogue/index.node-safe';

import { liftVoices, refuseVoices } from './voices';

const FILE = 'song.md';
const MAYA = singerSchema.parse('Майя');

describe('liftVoices', () => {
  it('lifts a marker above a stanza out of the words', () => {
    const verse = [
      'First',
      '',
      '<!-- voice: Кирилл -->',
      'Second',
      '',
      '<!-- voice: Maya, Kirill -->',
      'Third',
    ].join('\n');

    assert.equal(
      liftVoices(verse, FILE, MAYA),
      ['First', '', 'Second', '', 'Third'].join('\n'),
    );
  });

  it('takes a marker on the section’s first stanza', () => {
    assert.equal(liftVoices('<!-- voice: Кирилл -->\nOne', FILE, MAYA), 'One');
  });

  it('refuses a singer the registry lacks', () => {
    assert.throws(
      () => liftVoices('<!-- voice: Кирил -->\nOne', FILE, MAYA),
      /Кирил/,
    );
  });

  it('refuses a marker that opens no stanza', () => {
    for (const verse of [
      'One\n<!-- voice: Кирилл -->\nTwo',
      'One\n\n<!-- voice: Кирилл -->\n\nTwo',
      'One\n\n<!-- voice: Кирилл -->',
      '<!-- voice: Кирилл -->\n[^a]: A note.',
    ]) {
      assert.throws(() => liftVoices(verse, FILE, MAYA), /not on a stanza/);
    }
  });

  it('refuses markers on a song that names no voice for the rest', () => {
    assert.throws(
      () => liftVoices('<!-- voice: Кирилл -->\nOne', FILE, undefined),
      /`voice`/,
    );
  });
});

describe('refuseVoices', () => {
  it('passes a crib with no markers and refuses one with any', () => {
    refuseVoices('One\n\nTwo', FILE);
    assert.throws(
      () => {
        refuseVoices('<!-- voice: Kirill -->\nOne', FILE);
      },
      /outside the sung words/,
    );
  });
});
