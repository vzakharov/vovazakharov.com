import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseIdeas } from './parse-ideas';

describe('parseIdeas', () => {
  it('keeps the first three of a bare array', () => {
    assert.deepEqual(
      parseIdeas('["trendle","datavane","statsy","qwerty"]', 'datatrend'),
      ['trendle', 'datavane', 'statsy'],
    );
  });

  it('finds the array inside prose or a fence', () => {
    assert.deepEqual(
      parseIdeas('Sure!\n```json\n["trendle", "datavane"]\n```', 'datatrend'),
      ['trendle', 'datavane'],
    );
  });

  it('cleans each name as the field would', () => {
    assert.deepEqual(parseIdeas('["Trendle.com", "data vane"]', 'x'), [
      'trendle',
      'datavane',
    ]);
  });

  it('drops the name itself, duplicates and odd lengths', () => {
    assert.deepEqual(
      parseIdeas(
        '["datatrend", "ab", "trendle", "trendle", "averyveryverylongname"]',
        'datatrend',
      ),
      ['trendle'],
    );
  });

  it('throws on an answer with no array of names', () => {
    assert.throws(() => parseIdeas('no ideas, sorry', 'datatrend'));
    assert.throws(() => parseIdeas('[1, 2]', 'datatrend'));
  });
});
