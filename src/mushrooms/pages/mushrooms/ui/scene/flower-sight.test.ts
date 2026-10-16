import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { OPENING_EYE } from '../../model/ground';
import type { Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { anchoredStand } from './anchored-stand';
import { flowersOf } from './flower-plots';
import {
  coversOn,
  roomFor,
  screenSides,
  sightingOf,
  type Stand,
} from './flower-sight';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** The phones a bee's planting is held to the screen on: the narrowest, and one held upright. */
const PHONES = VIEWPORTS.filter(
  ([name]) => name === 'small phone' || name === 'phone',
);

/** The opening eye, and eyes walked off it, turned either way. */
const ANCHORS = [
  OPENING_EYE,
  ...[
    { x: 0.7, y: 1.3, heading: 0.2 },
    { x: -1.5, y: 2, heading: -0.6 },
  ].map((eye) => anchorOf(eye)),
];

/** How many flowers a bee plants out at the most in one visit, judged from one anchor. */
const PLANTINGS = 15;

/**
 * `stand` as judged from `anchor`, planted out by bees on every flower
 * standing in it, seen or not, each planting in the first slot `roomFor`
 * offers, until `PLANTINGS` or no slot is left.
 */
function plantedFrom(stand: Stand, seed: number): Stand {
  const random = mulberry32(seed ^ 0x50_1d);
  const planted: Sown[] = [];
  let judged = { ...stand, planted };
  while (planted.length < PLANTINGS) {
    const ids = flowersOf(judged).map(({ id }) => id);
    const [slot] = roomFor(
      judged,
      ids,
      coversOn(judged.layout, judged.mushrooms),
    );
    if (!slot) break;
    planted.push({
      id: `planted-${String(planted.length + 1)}`,
      seed: nextSeed(random),
      parent: slot.flower,
      ...pick(slot, 'ring'),
    });
    judged = { ...judged, planted: [...planted] };
  }
  return judged;
}

describe('a bee’s planting', () => {
  for (const [name, width, height] of PHONES) {
    it(`puts every head it plants wholly between the screen’s sides as the anchor sees them, on a ${name} screen`, () => {
      let heads = 0;
      for (const seed of VISITS.slice(0, 12)) {
        const visit = opened(seed, width, height, false);
        for (const anchor of ANCHORS) {
          const judged = anchoredStand(
            {
              ...visit,
              ...pick(visit.meadow, 'mushrooms'),
              planted: [],
              pulled: [],
            },
            anchor,
          );
          const out = plantedFrom(judged, seed);
          const { left, right } = screenSides(out.layout.camera);
          const own = new Set(out.planted.map(({ id }) => id));
          for (const flower of flowersOf(out)) {
            if (!own.has(flower.id)) continue;
            heads += 1;
            const { head } = sightingOf(flower, out.layout);
            assert.ok(
              head.x - head.r >= left && head.x + head.r <= right,
              `visit ${String(seed)}, anchor ${JSON.stringify(anchor)}: ${flower.id} at ${String(head.x)}±${String(head.r)} past ${String(left)}–${String(right)}`,
            );
          }
        }
      }
      assert.ok(heads > 0, 'no bee planted a flower');
    });
  }
});
