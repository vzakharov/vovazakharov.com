import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble } from '@/gpu/shared/shader';

import { ISLAND_SEA } from './island-sea.shader.generated';

describe("the sea's listing", () => {
  it('reads no island height, frame, uniform or binding', () => {
    const listing = assemble([ISLAND_SEA]);
    for (const banned of [/islandHeight/, /\bframe\b/, /@group/, /@binding/]) {
      assert.doesNotMatch(listing, banned);
    }
  });
});
