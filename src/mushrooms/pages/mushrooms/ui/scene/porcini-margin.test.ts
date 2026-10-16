import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Point, segmentCrossing } from '../../model/geometry';
import { mushroomGenes, type PorciniGenes } from '../../model/mushroom-genes';
import { capOnCanvas } from '../../model/mushroom-outline';
import { CURVE_STEPS, curveSteps } from '../../model/mushroom-profile';
import { crescent } from './crescent';
import { marginBand } from './porcini-margin';

/** The pairs of non-adjacent edges of the closed `outline` that cross. */
function crossings(outline: readonly Point[]): Array<[number, number]> {
  const edge = (index: number) =>
    [outline[index], outline[(index + 1) % outline.length]] as const;
  const found: Array<[number, number]> = [];
  for (let a = 0; a < outline.length; a++) {
    for (let b = a + 2; b < outline.length; b++) {
      if (a === 0 && b === outline.length - 1) continue;
      const [p, q] = edge(a);
      const [r, s] = edge(b);
      if (p && q && r && s && segmentCrossing(p, q, r, s)) found.push([a, b]);
    }
  }
  return found;
}

/**
 * `outline` as Phaser's fill keeps it under `pose`, in device px: each point
 * within 1 px both ways of the one kept before it skipped, as its
 * `pathDetailThreshold` does, the first and last always kept.
 */
function phaserKept(
  outline: readonly Point[],
  pose: (point: Point) => Point,
): Point[] {
  const kept: Point[] = [];
  for (const [index, point] of outline.entries()) {
    const at = pose(point);
    const last = kept.at(-1);
    const inner = index > 0 && index < outline.length - 1;
    if (
      inner &&
      last &&
      Math.abs(at.x - last.x) <= 1 &&
      Math.abs(at.y - last.y) <= 1
    )
      continue;
    kept.push(at);
  }
  return kept;
}

/** A mushroom's idle sway and rock, as the bed sets its graphics' scale and rotation, each frame `frame` of a few seconds. */
function swayed(frame: number): (point: Point) => Point {
  const stretch = 0.04 * Math.sin(frame * 0.37);
  const [sx, sy] = [1 - stretch / 2, 1 + stretch];
  const angle = 0.05 * Math.sin(frame * 0.21);
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return ({ x, y }) => ({
    x: 400.3 + (x * cos - y * sin) * sx,
    y: 300.7 + (x * sin + y * cos) * sy,
  });
}

function porcini(seed: number): PorciniGenes {
  const genes = mushroomGenes({ species: 'porcini', seed });
  if (genes.species !== 'porcini') throw new Error('grew another species');
  return genes;
}

const SEEDS = Array.from({ length: 120 }, (_, index) => index + 1);
/** How big a porcini stands, in px to its unit: from a far one painted with the fewest chords to a near one with every chord. */
const SIZES = [20, 60, 120, 240];

describe('crescent', () => {
  it('cuts the loop its inner edge makes round an arc turning sharper than the reach', () => {
    const corner = [
      ...Array.from({ length: 6 }, (_, index) => ({
        x: 0,
        y: 50 - index * 10,
      })),
      ...Array.from({ length: 5 }, (_, index) => ({
        x: 10 + index * 10,
        y: 0,
      })),
    ];
    const outline = crescent(corner, { x: 30, y: 30 }, 20);
    assert.deepEqual(crossings(outline), []);
  });
});

describe('a porcini’s margin band', () => {
  it('never crosses itself, whatever the porcini and however many chords it is painted with', () => {
    for (const seed of SEEDS) {
      const genes = porcini(seed);
      for (const size of SIZES) {
        const steps = curveSteps(size);
        const band = marginBand(genes, capOnCanvas(genes, size), size, steps);
        assert.deepEqual(crossings(band), [], `seed ${seed}, ${size} px`);
      }
    }
  });

  it('stays uncrossed as Phaser keeps it in every frame of the idle sway', () => {
    for (const seed of SEEDS.slice(0, 30)) {
      const genes = porcini(seed);
      const band = marginBand(genes, capOnCanvas(genes, 100), 100, CURVE_STEPS);
      for (let frame = 0; frame < 60; frame++) {
        const kept = phaserKept(band, swayed(frame));
        assert.deepEqual(crossings(kept), [], `seed ${seed}, frame ${frame}`);
      }
    }
  });
});
