import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseIdeas, typedIdeas } from './parse-ideas';

describe('parseIdeas', () => {
  it('keeps the first three lines', () => {
    assert.deepEqual(
      parseIdeas('trendle\ndatavane\nstatsy\nqwerty', 'datatrend'),
      ['trendle', 'datavane', 'statsy'],
    );
  });

  it('strips list marks, numbers and an empty thought', () => {
    assert.deepEqual(
      parseIdeas(
        '<think>\n\n</think>\n\n- trendle\n2. datavane\n"statsy"',
        'x',
      ),
      ['trendle', 'datavane', 'statsy'],
    );
  });

  it('cleans each name as the field would', () => {
    assert.deepEqual(parseIdeas('Trendle.com\ndata vane', 'x'), [
      'trendle',
      'datavane',
    ]);
  });

  it('drops the name itself, duplicates, odd lengths and blank lines', () => {
    assert.deepEqual(
      parseIdeas(
        'datatrend\n\nab\nTrendle\ntrendle\naveryveryverylongname',
        'datatrend',
      ),
      ['trendle'],
    );
  });

  it('answers with nothing when no line is a name', () => {
    assert.deepEqual(parseIdeas('Sorry, I cannot help with that!', 'x'), []);
  });
});

describe('typedIdeas', () => {
  it('shows the line being written before it is long enough to judge', () => {
    assert.deepEqual(typedIdeas('trendle\n2. da', 'x'), ['trendle', 'da']);
  });

  it('judges the finished lines as parseIdeas does', () => {
    assert.deepEqual(typedIdeas('datatrend\nab\nTrendle\nsta', 'datatrend'), [
      'trendle',
      'sta',
    ]);
  });

  it('shows nothing of a thought still open', () => {
    assert.deepEqual(typedIdeas('<think>\nhmm', 'x'), []);
  });

  it('stops at as many names as are shown', () => {
    assert.deepEqual(typedIdeas('trendle\ndatavane\nstatsy\nqwe', 'x'), [
      'trendle',
      'datavane',
      'statsy',
    ]);
  });
});
