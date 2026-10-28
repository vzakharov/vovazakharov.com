import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { z } from 'zod';

import type { MusicProject } from './name-brands.ts';
import { bill } from './projects.ts';

describe('bill', () => {
  it('renders each name and keeps the separators between them', () => {
    const billed: MusicProject[] = z
      .array(z.string().brand<'MusicProject'>())
      .parse(['GENERATED', 'Yoohie', 'Полуживые']);

    assert.deepEqual(
      bill(billed, (project) => [project]),
      [['GENERATED'], ' feat. ', ['Yoohie'], ', ', ['Полуживые']],
    );
  });
});
