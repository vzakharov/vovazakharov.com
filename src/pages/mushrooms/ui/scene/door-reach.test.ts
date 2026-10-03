import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mouseHead } from './door-reach';

describe('mouseHead', () => {
  for (const door of [8, 20, 60]) {
    it(`draws the head 0.6 of a door ${String(door)} px wide`, () => {
      assert.ok(Math.abs(mouseHead(door) - 0.6 * door) < 1e-9);
    });
  }
});
