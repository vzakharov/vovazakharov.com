import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { THINGS } from '@/cube/shared/lib/thing';

import { floorSource } from '../kit';
import * as EDGE from '.';

const themes = Object.values(EDGE);

describe('the edge band', () => {
  it('every floor is a place of its own', () => {
    assert.equal(new Set(themes.map(({ name }) => name)).size, themes.length);
    assert.equal(
      new Set(themes.map(({ shader }) => shader.id)).size,
      themes.length,
    );
  });

  it('every pillar hides the edges of the walls it stands on', () => {
    for (const { name, pillar } of themes) {
      assert.ok(pillar >= 0.015, `${name}'s pillar is ${String(pillar)}`);
    }
  });

  it('every floor is furnished from the things there are', () => {
    for (const { name, decor } of themes) {
      assert.ok(decor.length > 0, `${name} holds nothing`);
      for (const { thing, perRoom } of decor) {
        assert.ok(THINGS.includes(thing), `${name} holds a ${thing}`);
        assert.ok(perRoom > 0, `${name} holds no ${thing}`);
      }
    }
  });

  it("every floor's shader assembles and answers with the three functions", () => {
    for (const theme of themes) {
      const source = floorSource(theme);
      for (const answer of ['themeMaterial', 'themeLight', 'themeLens']) {
        assert.equal(
          source.split(`fn ${answer}(`).length,
          2,
          `${theme.name} defines ${answer} other than once`,
        );
      }
    }
  });
});
