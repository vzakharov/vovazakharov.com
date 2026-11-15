import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NATURE_LISTING } from './nature-listing';

describe("nature's listing", () => {
  it('declares the swell, the shore level, the wetness and the cusps', () => {
    for (const name of [
      'turnsAt',
      'crestOf',
      'setsAt',
      'swellLevel',
      'brokenAt',
      'sheetDepth',
      'drySince',
      'dampAfter',
      'filmAfter',
      'cusped',
    ]) {
      assert.match(NATURE_LISTING, new RegExp(String.raw`\bfn ${name}\(`));
    }
  });

  it('reads no island height, frame, uniform or binding', () => {
    for (const banned of [/islandHeight/, /\bframe\b/, /@group/, /@binding/]) {
      assert.doesNotMatch(NATURE_LISTING, banned);
    }
  });
});
