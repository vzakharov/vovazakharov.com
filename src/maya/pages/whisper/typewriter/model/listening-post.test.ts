import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hush, overhear } from './hush';
import { fileBySound, readSounds } from './listening-post';

describe('hush', () => {
  it('gives a common letter and a rare one the same sound', () => {
    assert.equal(hush('о'), hush('ы'));
    assert.equal(hush('e'), hush('g'));
    assert.notEqual(hush('о'), hush('е'));
  });

  it('hears ё as е and capitals as their lower case', () => {
    assert.equal(hush('Ёлка'), hush('елка'));
  });

  it('refuses a letter it has no sound for', () => {
    assert.throws(() => hush('ü'), /ü/);
  });
});

describe('overhear', () => {
  it('splits words from what lies between them, losing nothing typed', () => {
    const text = 'Привет, Moscow!';
    const stretches = overhear(text);

    assert.deepEqual(
      stretches.map(({ typed, word }) => [typed, word]),
      [
        ['Привет', true],
        [', ', false],
        ['Moscow', true],
        ['!', false],
      ],
    );
    assert.equal(stretches.map(({ typed }) => typed).join(''), text);
  });
});

describe('readSounds', () => {
  const lexicon = fileBySound([
    ['мыл', 2],
    ['мол', 5],
    ['рама', 3],
  ]);

  it('guesses the commonest of the words that sound alike', () => {
    assert.deepEqual(readSounds(hush('мыл'), lexicon), {
      guess: 'мол',
      passedOver: ['мыл'],
    });
  });

  it('has no guess for a sound no word makes', () => {
    assert.deepEqual(readSounds(hush('мама'), lexicon), { guess: undefined });
  });
});
