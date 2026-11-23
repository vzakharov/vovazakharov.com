import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble } from '@/gpu/shared/shader';

import { SEA_DAMP } from './sea-damp.shader.generated';
import { SEA_LIES } from './sea-lies.shader.generated';
import { SEA_LIFT } from './sea-lift.shader.generated';
import { SEA_SHADING } from './sea-shading.shader.generated';

describe("the sea's listing", () => {
  it('reads no island height, frame, uniform or binding', () => {
    const listing = assemble([SEA_LIFT, SEA_LIES, SEA_DAMP, SEA_SHADING]);
    for (const banned of [/islandHeight/, /\bframe\b/, /@group/, /@binding/]) {
      assert.doesNotMatch(listing, banned);
    }
  });
});
