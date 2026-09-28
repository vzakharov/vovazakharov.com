/**
 * A domed head — a fly agaric's, a porcini's, a russula's — painted over its
 * stem: what shows under the cap, then the cap, each species' own marks on
 * it, and its light.
 */

import { sample } from '../../model/geometry';
import type {
  DomeGenes,
  PorciniGenes,
  RussulaGenes,
} from '../../model/mushroom-genes';
import { domeArc, headOutlines } from '../../model/mushroom-outline';
import { capSurface, CURVE_STEPS } from '../../model/mushroom-profile';
import { capLight } from './mushroom-light';
import { type MushroomBrush, paintCapLight } from './mushroom-paint';
import { porciniMargin, russulaCentre } from './mushroom-tints';
import { crescent, fillShape, inkedFill } from './shapes';

const SHADE_ALPHA = 0.26;
/** How deep each crescent of a dome's light reaches in from its arc, in the cap's height. */
const DEPTHS = { shade: 0.34, rim: 0.06, 'dip-shade': 0.2, 'dip-light': 0.06 };
/** A porcini's pale margin: how far round the rim it climbs, in radians from it, and how deep it reaches in, in the cap's height. */
const MARGIN_CLIMB = 0.55;
const MARGIN_DEPTH = 0.2;
/** A russula's pale middle: its half-width, in the cap's, and its height, in the cap's. */
const CENTRE = [0.24, 0.16] as const;

export function paintDome(brush: MushroomBrush & { genes: DomeGenes }): void {
  const { graphics, genes, tints, toMushroom, ink, lighting, tone, size } =
    brush;
  const [top, under] = headOutlines(genes);
  graphics.fillStyle(tone(tints.under));
  fillShape(
    graphics,
    under.map((point) => toMushroom(point)),
  );
  const dome = top.map((point) => toMushroom(point));
  inkedFill(graphics, dome, tints.cap, ink, lighting, tone);

  if (genes.species === 'porcini') paintMargin(brush, genes);
  if (genes.species === 'russula') paintCentre(brush, genes);

  const capHeight = genes.capHeight * size;
  paintCapLight(
    brush,
    capLight(genes, lighting.toward),
    toMushroom({ x: 0, y: genes.capHeight * 0.3 }),
    (kind) => capHeight * DEPTHS[kind],
    SHADE_ALPHA,
  );
}

/**
 * A porcini's paler band along its cap's margin: up each side from near the
 * rim, round it and along the underside, reaching into the cap from there.
 */
function paintMargin(brush: MushroomBrush, genes: PorciniGenes): void {
  const { graphics, toMushroom, tone, size } = brush;
  const half = genes.capWidth / 2;
  const arc = [
    ...domeArc(genes, half, [-Math.PI / 2 + MARGIN_CLIMB, -Math.PI / 2]),
    ...sample(-half, half, CURVE_STEPS, (x) => ({ x, y: 0 })).slice(1, -1),
    ...domeArc(genes, half, [Math.PI / 2, Math.PI / 2 - MARGIN_CLIMB]),
  ].map((point) => toMushroom(point));
  graphics.fillStyle(tone(porciniMargin(genes)));
  fillShape(
    graphics,
    crescent(
      arc,
      toMushroom({ x: 0, y: genes.capHeight * 0.6 }),
      genes.capHeight * size * MARGIN_DEPTH,
    ),
  );
}

/** A russula's paler middle, in its dip at the top of the cap. */
function paintCentre(brush: MushroomBrush, genes: RussulaGenes): void {
  const { graphics, toMushroom, tone, size } = brush;
  const [across, tall] = CENTRE;
  const top = capSurface(genes, 0);
  // Its top just under the dip, so it stays inside the cap.
  const centre = toMushroom({ x: 0, y: top - genes.capHeight * tall * 1.15 });
  graphics.fillStyle(tone(russulaCentre(genes)));
  graphics.fillEllipse(
    centre.x,
    centre.y,
    genes.capWidth * across * size * 2,
    genes.capHeight * tall * size * 2,
  );
}
