import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  mostlyNeedsLatin,
  needsLatin,
  scriptSample,
  spell,
} from './spelling.ts';

describe('needsLatin', () => {
  it('asks for Latin by script, not by language', () => {
    assert.equal(needsLatin('Ночной сад', 'en'), true);
    assert.equal(needsLatin('Ночной сад', 'ru'), false);
    assert.equal(needsLatin('Άγιος ο σκοπός', 'ru'), true);
    assert.equal(needsLatin('Ágios o skopós', 'en'), false);
  });

  it('reads letters only, so digits and punctuation never ask', () => {
    assert.equal(needsLatin('8849 — …', 'en'), false);
  });
});

describe('mostlyNeedsLatin', () => {
  it('goes by most of the letters, not a phrase in a third script', () => {
    const farewell = 'Сойди с коня, выпей вина\n下马饮君酒';

    assert.equal(mostlyNeedsLatin(farewell, 'ru'), false);
    assert.equal(mostlyNeedsLatin(farewell, 'en'), true);
  });
});

describe('scriptSample', () => {
  it('names the script most unreadable letters are in', () => {
    assert.equal(scriptSample(['Ночной сад', 'Άγιος'], 'en'), 'Абв');
    assert.equal(scriptSample(['Ночной сад', 'Άγιος ο σκοπός'], 'en'), 'Αβγ');
    assert.equal(scriptSample(['Ночной сад', 'مِثْقَال'], 'ru'), 'أبج');
  });

  it('is undefined where the locale reads every letter', () => {
    assert.equal(scriptSample(['Ночной сад', 'Breathe'], 'ru'), undefined);
    assert.equal(scriptSample([], 'en'), undefined);
  });

  it('passes over a script with no sample beside one that has it', () => {
    assert.equal(scriptSample(['Сойди с коня\n下马饮君酒'], 'en'), 'Абв');
  });

  it('fails when only scripts with no sample need Latin', () => {
    assert.throws(() => scriptSample(['下马饮君酒'], 'en'), /no sample/);
  });
});

describe('spell', () => {
  it('leaves a text the locale reads as it is', () => {
    assert.deepEqual(spell({ text: 'Ночной сад', language: 'ru' }, 'ru'), {
      original: 'Ночной сад',
    });
  });

  it('romanizes Russian by rule', () => {
    assert.deepEqual(spell({ text: 'Ночной сад', language: 'ru' }, 'en'), {
      original: 'Ночной сад',
      latin: 'Nochnoy sad',
    });
  });

  it('takes a hand-written spelling over the rule', () => {
    assert.equal(
      spell({ text: 'Минем бабай', language: 'tt', latin: 'Minem babay' }, 'en')
        .latin,
      'Minem babay',
    );
  });

  it('fails on a script nothing romanizes', () => {
    assert.throws(
      () => spell({ text: 'Минем бабай', language: 'tt' }, 'en'),
      /no rule romanizes/,
    );
  });
});
