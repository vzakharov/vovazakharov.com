import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  behindHills,
  gaitHeight,
  ofGround,
  OPENING_EYE,
  sunk,
  sunkAway,
  viewAt,
} from '@/mushrooms/shared/world';
import {
  FAR_FLOWERS,
  flowersOf,
  NEAR_FLOWERS,
} from '@/mushrooms/entities/flower/index.node-safe';
import { HEAD_REACH } from '@/mushrooms/entities/flower/index.test-only';
import { VISITS } from '@/mushrooms/entities/mushroom/index.node-safe';
import { EITHER_WAY } from '@/mushrooms/entities/mushroom/index.test-only';

import { opened } from './visit-play';

/** How many visits each screen is judged over. */
const JUDGED = 40;

describe('the far band', () => {
  for (const [name, width, height] of EITHER_WAY) {
    it(`stands every far flower sunk away behind the walking brow, and on flight's ground, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, JUDGED)) {
        const stand = opened(seed, width, height, false);
        const { camera } = stand.layout;
        const walking = viewAt(camera, OPENING_EYE);
        const flight = viewAt(camera, OPENING_EYE, gaitHeight('flight'));
        const far = new Set(
          stand.flowers.slice(NEAR_FLOWERS).map(({ id }) => id),
        );
        const standing = flowersOf(stand).filter(({ id }) => far.has(id));
        const at = `visit ${String(seed)}`;
        assert.equal(standing.length, FAR_FLOWERS, at);
        for (const { id, foot, place } of standing) {
          const tall = place.size * (1 + HEAD_REACH);
          const shown = sunk(walking, ofGround(walking, foot));
          assert.ok(
            sunkAway(walking, shown, tall * shown.zoom),
            `${at}: ${id} shows over the walking brow`,
          );
          // The band lies at its depth down the screen, and the brow is a
          // circle round the eye, so the band's ends, out where the brow bends
          // down, lie past it on the widest screens and sink as anything does.
          const lifted = ofGround(flight, foot);
          if (Math.abs(lifted.x - width / 2) > width / 4) continue;
          assert.ok(
            !behindHills(flight, lifted),
            `${at}: ${id} stands past flight's brow mid-screen`,
          );
        }
      }
    });
  }
});
