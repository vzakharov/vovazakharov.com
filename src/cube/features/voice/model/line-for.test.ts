import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { worded } from './lexicon';
import type { Uttered } from './line';
import { lineFor, spoken } from './line-for';
import { isVowel } from './phone';
import { type Moment, MOMENTS, SCRIPT } from './script';
import { COINED_FROM, PLAIN_TO, tongueOf } from './tongue';

const FLOORS = Array.from({ length: 67 }, (_, n) => n + 1);

const texts = (moment: Moment, n: number): Set<string> =>
  new Set(
    Array.from({ length: 60 }, (_, grain) => lineFor(moment, n, grain).text),
  );

const beatsOf = (sounds: readonly Uttered[]): number => {
  let sum = 0;
  for (const { beats = 0 } of sounds) sum += beats;
  return sum;
};

const pauses = (text: string) =>
  spoken(text).phones.filter(({ phone }) => phone === 'pau').length;

const said = (text: string, n: number) => spoken(text, n).text;

const vowels = (sounds: readonly Uttered[]) =>
  sounds.filter(({ phone }) => isVowel(phone)).length;

describe('lineFor', () => {
  it('says something at every moment on every floor', () => {
    for (const n of FLOORS) {
      for (const moment of MOMENTS) {
        const line = lineFor(moment, n, 99);
        assert.ok(line.text.length > 0, `${moment} on ${n}`);
        assert.ok(line.phones.length > 0, `${moment} on ${n}`);
      }
    }
  });

  it('says the same for the same moment, floor and grain', () => {
    for (const moment of MOMENTS) {
      assert.deepEqual(lineFor(moment, 31, 5), lineFor(moment, 31, 5));
    }
  });

  it('gives the visitor sounds and no words, the same on every floor', () => {
    for (const n of [1, 30, 66]) {
      assert.equal(lineFor('first-shrink', n, 1).text, 'huh? huh?!');
      assert.equal(lineFor('second-shrink', n, 8).text, 'ugh…');
      assert.equal(lineFor('wonder', n, 3).text, 'hm?');
    }
    const { phones } = lineFor('first-shrink', 1, 1);
    const asked = phones[1];
    const again = phones[5];
    assert.ok((asked?.slide ?? 0) > (asked?.note ?? 0));
    assert.ok((again?.slide ?? 0) > (asked?.slide ?? 0));
    const groaned = lineFor('second-shrink', 2, 8).phones;
    assert.ok(groaned.every(({ slide = 0, note = 0 }) => slide <= note));
  });

  it('picks among its variants by the grain', () => {
    assert.ok(texts('mutter', 3).size > 5);
    assert.ok(texts('landing', 3).size > 3);
    assert.ok(texts('numbers', 3).size > 30);
    assert.ok(texts('announcement', 3).size > 10);
  });

  it('wearies of shrinking: put out near the top, worn out deep down', () => {
    const early = texts('shrink', 3);
    const late = texts('shrink', 40);
    assert.ok(early.has('hm?'));
    assert.ok(!late.has('hm?'));
    assert.ok(late.has('(exhale)'));
    assert.ok(!early.has('(exhale)'));
  });

  it('rings a chime before an announcement and before nothing else', () => {
    for (const moment of MOMENTS) {
      const { chime } = lineFor(moment, 5, 2);
      assert.equal(chime === true, moment === 'announcement', moment);
    }
    assert.ok(SCRIPT.announcement.includes(lineFor('announcement', 5, 2).text));
    assert.ok(
      !SCRIPT.announcement.includes(lineFor('announcement', 40, 2).text),
    );
  });

  it('reads five digits out flat, a pause after each but the last', () => {
    const { text, phones, tune } = lineFor('numbers', 4, 21);
    assert.equal(text.split(' ').length, 5);
    assert.equal(tune, 'flat');
    assert.equal(phones.filter(({ phone }) => phone === 'pau').length, 4);
  });

  it('laughs in no language, stepping down', () => {
    for (const n of [1, 30, 66]) {
      const { text, phones } = lineFor('laugh', n, 3);
      assert.match(text, /^ha( ha){2,5}$/);
      const notes = phones.flatMap(({ note }) => note ?? []);
      assert.ok((notes[0] ?? 0) > (notes.at(-1) ?? 0));
    }
  });

  it('sings two bars in three, in the tongue of its floor', () => {
    for (const n of [1, 15, 40]) {
      const { phones, tune } = lineFor('lullaby', n, 11);
      const sung = phones.filter(({ phone }) => isVowel(phone));
      assert.equal(tune, 'flat');
      assert.ok(sung.every(({ note }) => note !== undefined));
      assert.equal(beatsOf(sung), 6);
    }
    assert.match(lineFor('lullaby', 1, 11).text, /^(la|loo)( (la|loo))+$/);
  });
});

describe('spoken', () => {
  it('raises a question and lets a statement fall', () => {
    assert.equal(spoken('who built this?').tune, 'rise');
    assert.equal(spoken('nice carpet').tune, 'fall');
    assert.equal(spoken('hello?', 1, 'flat').tune, 'flat');
  });

  it('pauses at punctuation inside a line and not at its end', () => {
    assert.equal(pauses('okay, smaller'), 1);
    assert.equal(pauses('hello? anyone?'), 1);
    assert.equal(pauses('here we go again'), 0);
  });
});

describe('the tongue of a floor', () => {
  const LINE = 'who left the light on?';

  it('is plain English to floor 8', () => {
    for (let n = 1; n <= PLAIN_TO; n += 1) assert.equal(said(LINE, n), LINE);
    assert.equal(tongueOf(PLAIN_TO)(worded('door')).spelling, 'door');
  });

  it('bends more of a line the deeper the floor, until none is left', () => {
    const lines = Object.values(SCRIPT).flat();
    const bent = (n: number) =>
      lines.filter((line) => said(line, n) !== line).length;
    assert.ok(bent(10) > 0);
    assert.ok(bent(10) < bent(19));
    for (const n of [30, 45, 66]) assert.equal(bent(n), lines.length);
  });

  it('keeps a bent word the length it was', () => {
    for (let n = PLAIN_TO + 1; n < COINED_FROM; n += 1) {
      const word = worded('everyone');
      assert.equal(tongueOf(n)(word).sounds.length, word.sounds.length);
    }
  });

  it('gives every deep floor a language of its own', () => {
    const languages = new Set(
      FLOORS.filter((n) => n >= COINED_FROM + 5).map((n) => said(LINE, n)),
    );
    assert.equal(languages.size, 67 - COINED_FROM - 4);
  });

  it('says the same word the same way all over a floor', () => {
    for (const n of [12, 27, 58]) {
      const [first, , third] = spoken('hello, there hello', n).text.split(' ');
      assert.equal(first?.replace(',', ''), third);
    }
  });

  it('keeps as many syllables, and a sung word its notes', () => {
    const word = worded('everyone');
    for (const n of [25, 40, 66]) {
      assert.equal(vowels(tongueOf(n)(word).sounds), vowels(word.sounds));
    }
  });
});
