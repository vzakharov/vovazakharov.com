import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COPY, ledeParts } from './i18n';

describe('ledeParts', () => {
  it('drops the star and stops the marked part at the starred word', () => {
    assert.deepEqual(
      ledeParts({ copy: { ...COPY, lede: 'Names nobody grabbed* yet.' } }),
      { plain: 'Names nobody grabbed yet.', marked: 'Names nobody grabbed' },
    );
  });

  it('marks the whole lede where nothing is starred', () => {
    assert.deepEqual(ledeParts({ copy: { ...COPY, lede: 'Plain words.' } }), {
      plain: 'Plain words.',
      marked: 'Plain words.',
    });
  });
});
