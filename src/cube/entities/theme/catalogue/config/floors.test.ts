import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { themeOf } from './floors';

const FLOORS = Array.from({ length: 66 }, (_, i) => i + 1);

describe('the floors’ themes', () => {
  it('every floor of the building has one, and no other floor does', () => {
    for (const n of FLOORS) assert.doesNotThrow(() => themeOf(n));
    for (const n of [0, 67]) assert.throws(() => themeOf(n), RangeError);
  });

  it('every theme stands on exactly one floor', () => {
    const names = FLOORS.map((n) => themeOf(n).name);
    assert.equal(new Set(names).size, names.length);
  });

  it('keeps the pinned floors and the magnets where they were chosen', () => {
    const pinned: ReadonlyArray<readonly [number, string]> = [
      [1, 'Reception'],
      [2, 'Open plan'],
      [3, 'School corridor'],
      [6, 'Service corridor'],
      [7, 'Garage'],
      [13, 'Attic'],
      [66, 'Hallway'],
    ];
    for (const [n, name] of pinned) assert.equal(themeOf(n).name, name);
  });
});
