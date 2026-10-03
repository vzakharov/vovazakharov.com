import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { flowerLift } from '../ui/scene/flower-seat';
import { flowerGenes, flowerHead } from './flower-genes';
import { placedAt, type Point } from './geometry';
import { insectGenes } from './insect-genes';
import { REST_LEAN, SIP_DEPTH } from './insect-motion';
import { ABDOMEN, headOf, type Side } from './insect-outline';
import { inBody, PROBOSCIS_STEPS, proboscisLine } from './proboscis';

const SEEDS = Array.from({ length: 60 }, (_, index) => index * 4099 + 11);
const LEANS = [-REST_LEAN, -0.2, 0, 0.2, REST_LEAN];
const SPOTS = [-0.3, 0, 0.3];
const SWAYS = [-0.09, 0, 0.09];
/** A flower's size and a butterfly's, on a phone and on a tablet, in CSS px. */
const SIZES = [
  [36, 60],
  [105, 108],
] as const;
const SIDES: readonly Side[] = [-1, 1];

/**
 * Every butterfly drinking at every flower, as the scene seats it over the
 * head's upper rim, swaying and leaning: the head's middle and its centre's
 * radius, and where the butterfly's middle is drawn, turned how, at what size.
 */
function* drinks() {
  for (const seed of SEEDS) {
    const genes = insectGenes({ seed, kind: 'butterfly' });
    const flower = flowerGenes({ seed: seed ^ 0x5f });
    for (const [flowerSize, size] of SIZES) {
      const head = flowerHead(flower, flowerSize);
      const disc = flower.centre * flowerSize;
      const lift = flowerLift({ ...pick(head, 'r'), disc }, size);
      for (const spot of SPOTS) {
        for (const sway of SWAYS) {
          const foot = { x: 400, y: 600 };
          const centre = placedAt(foot, sway, head);
          const middle = placedAt(foot, sway, {
            x: head.x + spot * head.r,
            y: head.y - lift,
          });
          for (const turn of LEANS) {
            yield { genes, centre, disc, middle, turn, size };
          }
        }
      }
    }
  }
}

/** A point in the body's frame, drawn on screen: as `InsectView` sets the container. */
function onScreen(
  point: Point,
  middle: Point,
  turn: number,
  size: number,
): Point {
  return placedAt(middle, turn, { x: point.x * size, y: point.y * size });
}

describe('proboscisLine', () => {
  it('reaches into the flower’s centre from the upper rim, however it sways and leans, through every sip', () => {
    for (const { genes, centre, disc, middle, turn, size } of drinks()) {
      const nectar = inBody(centre, middle, turn, size);
      for (const reach of [1, 1 - SIP_DEPTH / 2, 1 - SIP_DEPTH]) {
        for (const side of SIDES) {
          const line = proboscisLine(genes, reach, nectar, side);
          const tip = onScreen(line.at(-1) ?? middle, middle, turn, size);
          const off = Math.hypot(tip.x - centre.x, tip.y - centre.y);
          assert.ok(
            off <= disc,
            `${String(off)} px off a ${String(disc)} px centre`,
          );
        }
      }
    }
  });

  it('leaves the flower’s centre in sight: the butterfly’s tail stays off it', () => {
    for (const { genes, centre, disc, middle, turn, size } of drinks()) {
      const tail = { x: 0, y: genes.bodyLength * (ABDOMEN.at + ABDOMEN.half) };
      const drawn = onScreen(tail, middle, turn, size);
      assert.ok(Math.hypot(drawn.x - centre.x, drawn.y - centre.y) > disc);
      assert.ok(drawn.y < centre.y);
    }
  });

  it('starts at the head, and goes down to the flower', () => {
    for (const { genes, centre, middle, turn, size } of drinks()) {
      const nectar = inBody(centre, middle, turn, size);
      const [mouth] = proboscisLine(genes, 1, nectar, 1);
      const head = headOf(genes);
      assert.ok(mouth);
      assert.ok(
        Math.hypot(mouth.x - head.x, mouth.y - head.y) <= head.r + 1e-9,
      );
      assert.ok(nectar.y > head.y);
    }
  });

  it('unrolls from a coil at the head without a jump, and has as many points at every reach', () => {
    const genes = insectGenes({ seed: 7, kind: 'butterfly' });
    const nectar = { x: 0.1, y: 0.4 };
    const head = headOf(genes);
    for (const point of proboscisLine(genes, 0, nectar, 1)) {
      assert.ok(Math.hypot(point.x - head.x, point.y - head.y) < 0.25);
    }
    const reaches = Array.from({ length: 201 }, (_, index) => index / 200);
    const lines = reaches.map((reach) =>
      proboscisLine(genes, reach, nectar, 1),
    );
    for (const [index, line] of lines.entries()) {
      assert.equal(line.length, PROBOSCIS_STEPS + 1);
      const last = lines[index - 1] ?? line;
      const moved = Math.max(
        ...line.map((point, at) => {
          const was = last[at] ?? point;
          return Math.hypot(point.x - was.x, point.y - was.y);
        }),
      );
      assert.ok(moved < 0.05, `${String(moved)} at ${String(index)}`);
    }
  });
});

describe('inBody', () => {
  it('undoes the body’s turn and size', () => {
    const middle = { x: 120, y: 80 };
    for (const turn of LEANS) {
      const point = { x: 0.2, y: 0.35 };
      const back = inBody(onScreen(point, middle, turn, 50), middle, turn, 50);
      assert.ok(Math.hypot(back.x - point.x, back.y - point.y) < 1e-9);
    }
  });
});
