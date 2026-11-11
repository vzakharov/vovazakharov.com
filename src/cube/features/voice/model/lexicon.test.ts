import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sounded, spelt } from './letters';
import { LEXICON, worded } from './lexicon';
import { isVowel, PHONES, SPECS } from './phone';
import { DIGITS, SCRIPT } from './script';

const phonesOf = (word: string) =>
  worded(word)
    .sounds.map(({ phone }) => phone)
    .join(' ');

describe('the phone set', () => {
  it('gives every phone a length and resonances a throat can make', () => {
    for (const phone of PHONES) {
      const { millis, formants, glide } = SPECS[phone];
      assert.ok(millis > 0, phone);
      for (const hertz of [...formants, ...(glide ?? [])]) {
        assert.ok(hertz > 150 && hertz < 3500, phone);
      }
    }
  });
});

describe('worded', () => {
  it('parses every entry of the lexicon', () => {
    for (const word of Object.keys(LEXICON)) {
      assert.ok(worded(word).sounds.length > 0, word);
    }
  });

  it('knows every word of the script by heart', () => {
    const words = [...Object.values(SCRIPT).flat(), ...DIGITS]
      .flatMap((line) => line.split(' '))
      .map((word) => word.replaceAll(/[!,.?]/g, ''));
    for (const word of words) assert.ok(word in LEXICON, word);
  });

  it('says an initialism letter by letter and a phrase word by word', () => {
    assert.equal(phonesOf('wtf'), 'w ah t dh ax f ah k');
    assert.equal(
      ['here', 'we', 'go', 'again'].map((word) => phonesOf(word)).join(' | '),
      'hh iy r | w iy | g ow | ax g eh n',
    );
  });

  it('leans a word on the vowel its entry marks', () => {
    const vowel = worded('again').sounds[2];
    assert.deepEqual(vowel, { phone: 'eh', stress: true });
  });

  it('keeps the spelling it was given and ignores its case', () => {
    assert.deepEqual(worded('Hello').sounds, worded('hello').sounds);
    assert.equal(worded('Hello').spelling, 'Hello');
  });
});

const read = (word: string) =>
  sounded(word)
    .map(({ phone }) => phone)
    .join(' ');

describe('sounded', () => {
  it('reads digraphs, doubled letters and a silent e', () => {
    assert.equal(read('ship'), 'sh ih p');
    assert.equal(read('thing'), 'th ih ng');
    assert.equal(read('bell'), 'b eh l');
    assert.equal(read('late'), 'l ey t');
    assert.equal(read('yes'), 'y eh s');
    assert.equal(read('queen'), 'k w iy n');
  });

  it('leans on the first vowel and no other', () => {
    const stressed = sounded('banana').filter(({ stress }) => stress === true);
    assert.deepEqual(stressed, [{ phone: 'ae', stress: true }]);
  });

  it('reads a word of no letters as nothing', () => {
    assert.deepEqual(sounded('!?'), []);
  });

  it('falls in for a word the lexicon lacks', () => {
    assert.equal(phonesOf('lamp'), 'l ae m p');
  });
});

describe('spelt', () => {
  it('writes a sound down in letters, a vowel for every vowel', () => {
    const sounds = worded('again').sounds;
    assert.equal(spelt(sounds), 'agen');
    assert.equal(spelt([{ phone: 'pau' }]), '');
    for (const phone of PHONES.filter((each) => isVowel(each))) {
      assert.match(spelt([{ phone }]), /^[aeiou][a-z]?$/);
    }
  });
});
