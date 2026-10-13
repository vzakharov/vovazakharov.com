import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bill } from './projects.ts';

describe('bill', () => {
  it('renders each name and keeps the separators between them', () => {
    assert.deepEqual(
      bill(['GENERATED', 'Yoohie', 'Полуживые'], (project) => [project]),
      [['GENERATED'], ' feat. ', ['Yoohie'], ', ', ['Полуживые']],
    );
  });
});
