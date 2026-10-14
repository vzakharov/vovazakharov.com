import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { musicProjectSchema } from '@/shared/music-catalogue/index.node-safe';

import { bill } from './projects.ts';

describe('bill', () => {
  it('renders each name and keeps the separators between them', () => {
    const billed = ['GENERATED', 'Yoohie', 'Полуживые'].map((name) =>
      musicProjectSchema.parse(name),
    );

    assert.deepEqual(
      bill(billed, (project) => [project]),
      [['GENERATED'], ' feat. ', ['Yoohie'], ', ', ['Полуживые']],
    );
  });
});
