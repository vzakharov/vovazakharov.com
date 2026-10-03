import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { FLOWER_RANGES } from '../../model/flower-genes';
import { OPENING_EYE } from '../../model/ground';
import { INSECT_KINDS } from '../../model/insect-genes';
import type { Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { anchoredStand } from './anchored-stand';
import { flowersOf } from './flower-plots';
import {
  coversOn,
  flowerLift,
  flowerLiftAt,
  type HeadReach,
  roomFor,
  screenSides,
  type SeatZooms,
  sightingOf,
  type Stand,
} from './flower-sight';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** How near two lifts in CSS px stand to count as one. */
const SAME_PX = 1e-9;

/**
 * Flower heads as the genes grow them, at a flower's size laid out small and
 * large, smallest and largest petals and centre each: the small ones sit
 * under a large insect, so a bee's face floor holds there.
 */
const REACHES: readonly HeadReach[] = [12, 40, 90].flatMap((size) =>
  FLOWER_RANGES.petalLength.flatMap((petal) =>
    FLOWER_RANGES.centre.map((centre) => ({
      r: petal * size,
      disc: centre * size,
    })),
  ),
);

/** Insect sizes, in CSS px to their unit. */
const SIZES = [14, 32];

/** Zooms a flower and the insect on it are drawn at: equal, and either one larger. */
const ZOOMS: readonly SeatZooms[] = [
  { host: 1, insect: 1 },
  { host: 0.4, insect: 0.4 },
  { host: 2.5, insect: 2.5 },
  { host: 0.6, insect: 0.61 },
  { host: 1.3, insect: 0.9 },
  { host: 0.8, insect: 2.1 },
];

/** Every head, insect size and kind the lift is read for. */
const CASES = REACHES.flatMap((reach) =>
  SIZES.flatMap((size) => INSECT_KINDS.map((kind) => ({ reach, size, kind }))),
);

/** `reach` drawn at `zoom`, in CSS px. */
function scaled({ r, disc }: HeadReach, zoom: number): HeadReach {
  return { r: r * zoom, disc: disc * zoom };
}

describe('flowerLiftAt', () => {
  it('is the layout lift scaled by one zoom when flower and insect share it', () => {
    for (const { reach, size, kind } of CASES) {
      for (const zoom of [0.4, 1, 2.5]) {
        const drawn = flowerLiftAt(reach, size, kind, {
          host: zoom,
          insect: zoom,
        });
        const laid = flowerLift(reach, size, kind);
        assert.ok(
          Math.abs(drawn - zoom * laid) < SAME_PX,
          `${kind} on ${JSON.stringify(reach)} at ${String(zoom)}`,
        );
      }
    }
  });

  it('is the layout lift of the head drawn at the flower’s zoom, read in the insect’s units', () => {
    for (const { reach, size, kind } of CASES) {
      for (const zoom of ZOOMS) {
        const drawn = flowerLiftAt(reach, size, kind, zoom);
        const ownUnits = flowerLift(
          scaled(reach, zoom.host / zoom.insect),
          size,
          kind,
        );
        assert.ok(
          Math.abs(drawn - zoom.insect * ownUnits) < SAME_PX,
          `${kind} on ${JSON.stringify(reach)} at ${JSON.stringify(zoom)}`,
        );
      }
    }
  });

  it('keeps a butterfly and a fly above the head’s middle and a bee below it, at every zoom', () => {
    for (const { reach, size, kind } of CASES) {
      for (const zoom of ZOOMS) {
        const lift = flowerLiftAt(reach, size, kind, zoom);
        const where = `${kind} on ${JSON.stringify(reach)} at ${JSON.stringify(zoom)}`;
        if (kind === 'bee') assert.ok(lift < 0, where);
        else assert.ok(lift > 0, where);
      }
    }
  });

  it('moves a butterfly with the drawn centre’s rim as the flower alone grows', () => {
    for (const reach of REACHES) {
      for (const size of SIZES) {
        const at = (host: number) =>
          flowerLiftAt(reach, size, 'butterfly', { host, insect: 1 });
        assert.ok(Math.abs(at(1.7) - at(0.7) - reach.disc) < SAME_PX);
      }
    }
  });

  it('keeps a fly on the centre at its own zoom, whatever the flower’s', () => {
    for (const reach of REACHES) {
      for (const size of SIZES) {
        const at = (host: number) =>
          flowerLiftAt(reach, size, 'fly', { host, insect: 1.4 });
        assert.ok(Math.abs(at(0.5) - at(2)) < SAME_PX);
        assert.ok(
          Math.abs(at(1) - 1.4 * flowerLift(reach, size, 'fly')) < SAME_PX,
        );
      }
    }
  });

  it('keeps a bee as far past the drawn rim as the insect’s zoom alone says', () => {
    for (const reach of REACHES) {
      for (const size of SIZES) {
        for (const zoom of ZOOMS) {
          const lift = flowerLiftAt(reach, size, 'bee', zoom);
          // Below the rim as drawn by its gap past a rim, read off a head
          // large enough for the rim to set it, and no nearer the middle
          // than its face floor, read off a head with no rim: both at the
          // insect's own zoom.
          const wide = { ...reach, r: 1e3 };
          const rimGap = -flowerLift(wide, size, 'bee') - wide.r;
          const gap = -flowerLift({ ...reach, r: 0 }, size, 'bee');
          const expected = Math.max(
            reach.r * zoom.host + rimGap * zoom.insect,
            gap * zoom.insect,
          );
          assert.ok(Math.abs(-lift - expected) < 1e-6);
        }
      }
    }
  });

  it('differs from the layout lift at the flower’s zoom where the two zooms differ', () => {
    for (const { reach, size, kind } of CASES) {
      for (const zoom of ZOOMS) {
        if (zoom.host === zoom.insect) continue;
        const drawn = flowerLiftAt(reach, size, kind, zoom);
        const atHost = zoom.host * flowerLift(reach, size, kind);
        // Every kind's lift has an insect part, so it never follows the
        // flower's zoom alone.
        assert.ok(
          Math.abs(drawn - atHost) > 1e-6,
          `${kind} on ${JSON.stringify(reach)} at ${JSON.stringify(zoom)}`,
        );
      }
    }
  });
});

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
