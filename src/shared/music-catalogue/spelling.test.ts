import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { needsLatin, spell } from './spelling';

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

  it('carries keepsScript only where it is set', () => {
    assert.deepEqual(
      spell(
        {
          text: 'مِثْقَال',
          language: 'ar',
          latin: 'Mithqāl',
          keepsScript: true,
        },
        'ru',
      ),
      { original: 'مِثْقَال', latin: 'Mithqāl', keepsScript: true },
    );
  });

  it('fails on a script nothing romanizes', () => {
    assert.throws(
      () => spell({ text: 'Минем бабай', language: 'tt' }, 'en'),
      /no rule romanizes/,
    );
  });
});
