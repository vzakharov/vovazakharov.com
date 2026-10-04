import type * as Phaser from 'phaser';

import type { Circle } from '../../model/geometry';
import { moonFace } from './moon-face';
import { PALETTE } from './palette';
import { fillShape } from './shapes';

/** The halo's soft rings, outermost first: each its reach in radii and its alpha. */
const RINGS = [
  [1.78, 0.1],
  [1.56, 0.14],
  [1.3, 0.22],
] as const;
/** The ring of beads round the disc: how many, how far out, and how large, large and small by turns, in radii. */
const BEADS = { count: 24, reach: 1.56, r: [0.075, 0.04] } as const;
/** Laid once on a sea's rim and again on its core, so the core shows deeper. */
const SEA_ALPHA = 0.3;
const FEATURE_ALPHA = 0.8;
const CHEEK_ALPHA = 0.5;

/**
 * The moon: a full, round disc in `moon`, outlined in `inkCool` and wearing
 * the kind, sleeping face of its own seas (`moonFace`), in a halo of soft
 * `moonHalo` rings strung with a ring of beads, as the stars' rosettes are,
 * that reaches no further than the sun's rays. `ink` is the outline's width,
 * so the meadow's moon and the map's compass share one picture at their own
 * sizes.
 */
export function drawMoon(
  graphics: Phaser.GameObjects.Graphics,
  moon: Circle,
  ink: number,
): void {
  const { x, y, r } = moon;
  for (const [reach, alpha] of RINGS) {
    graphics.fillStyle(PALETTE.moonHalo, alpha).fillCircle(x, y, reach * r);
  }
  for (let index = 0; index < BEADS.count; index++) {
    const angle = (index / BEADS.count) * Math.PI * 2;
    const bead = {
      x: x + Math.cos(angle) * BEADS.reach * r,
      y: y + Math.sin(angle) * BEADS.reach * r,
      r: (index % 2 ? BEADS.r[1] : BEADS.r[0]) * r,
    };
    graphics
      .fillStyle(PALETTE.moonHalo)
      .fillCircle(bead.x, bead.y, bead.r)
      .lineStyle(ink, PALETTE.inkCool)
      .strokeCircle(bead.x, bead.y, bead.r);
  }
  graphics.fillStyle(PALETTE.moon).fillCircle(x, y, r);
  const { seas, features, cheeks } = moonFace(moon);
  graphics.fillStyle(PALETTE.moonSea, SEA_ALPHA);
  for (const sea of seas) fillShape(graphics, sea);
  graphics.fillStyle(PALETTE.moonCheek, CHEEK_ALPHA);
  for (const cheek of cheeks) graphics.fillCircle(cheek.x, cheek.y, cheek.r);
  graphics.fillStyle(PALETTE.moonSea, FEATURE_ALPHA);
  for (const feature of features) fillShape(graphics, feature);
  graphics.lineStyle(ink, PALETTE.inkCool).strokeCircle(x, y, r);
}
