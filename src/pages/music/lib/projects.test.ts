import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bill, billing, MUSIC_PROJECT_SLUGS } from './projects.ts';

describe('MUSIC_PROJECT_SLUGS', () => {
  const slugs = Object.values(MUSIC_PROJECT_SLUGS);

  it('gives every project an address of its own', () => {
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it('spells every address in lowercase ASCII', () => {
    for (const slug of slugs) assert.match(slug, /^[\da-z]+(?:-[\da-z]+)*$/);
  });
});

describe('bill', () => {
  it('renders each name and keeps the separators between them', () => {
    assert.deepEqual(
      bill(['GENERATED', 'Yoohie', 'Полуживые'], (project) => [project]),
      [['GENERATED'], ' feat. ', ['Yoohie'], ', ', ['Полуживые']],
    );
  });
});

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
