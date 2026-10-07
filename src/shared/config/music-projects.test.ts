import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { billing } from './music-projects.ts';

describe('billing', () => {
  it('puts the artist first and the features after it', () => {
    assert.equal(
      billing(['GENERATED', 'Полуживые'], 'en'),
      'GENERATED feat. Полуживые',
    );
  });

  it('bills a project under its name in the page language', () => {
    assert.equal(billing(['Yoohie'], 'en'), 'Yoohie');
    assert.equal(billing(['Yoohie'], 'ru'), 'Йухи');
    assert.equal(
      billing(['GENERATED', 'Yoohie'], 'ru'),
      'GENERATED feat. Йухи',
    );
  });

  it('bills nobody as an empty string', () => {
    assert.equal(billing([], 'ru'), '');
  });
});
