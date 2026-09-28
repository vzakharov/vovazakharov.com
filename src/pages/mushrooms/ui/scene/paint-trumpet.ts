/**
 * A chanterelle, painted as one trumpet: the stem running up into the
 * funnel with no ink across the joint, the ridges over the funnel and on
 * down the stem, and the lip over them, its mouth open under the far rim and
 * lit as a concave hollow is.
 */

import {
  MOUTH_LINE,
  mouthEdges,
  ridgeLines,
} from '../../model/chanterelle-outline';
import type { Point } from '../../model/geometry';
import type { ChanterelleGenes } from '../../model/mushroom-genes';
import { headOutlines } from '../../model/mushroom-outline';
import { CURVE_STEPS } from '../../model/mushroom-profile';
import { inkFor } from './ink';
import { type CapLight, capLight, sideways } from './mushroom-light';
import {
  bySun,
  inkStem,
  lightWith,
  type MushroomBrush,
  paintCapLight,
  paintStem,
  shadeWith,
} from './mushroom-paint';
import { PALETTE } from './palette';
import { crescent, fillShape, inkUnder, strokeTapered } from './shapes';

/** Kept light on a chanterelle, so its cool shade deepens its orange rather than browning it. */
const SHADE_ALPHA = 0.22;
/** How deep each crescent of the lip's light reaches in from its arc, in the lip's thickness. */
const DEPTHS = { shade: 0.7, rim: 0.3, 'dip-shade': 0.4, 'dip-light': 0.28 };
/** The shade over the whole mouth, deeper than the lip round it. */
const MOUTH_SHADE = 0.12;
/** The funnel's shade on the side turned from the sun and in under the lip, each one's depth in the cap's width, and alpha. */
const FUNNEL_SIDE = { depth: 0.16, alpha: 0.15 };
const UNDER_LIP = { depth: 0.1, alpha: 0.2 };
/** The warm light up the funnel's sun side. */
const FUNNEL_LIT = { depth: 0.08, alpha: 0.35 };
/** A ridge's width at the rim and at its end down the stem, in the ink line's. */
const RIDGE = [0.85, 0.25] as const;

/** Whether a layer of a chanterelle's light lies inside its mouth. */
const inMouth = (kind: CapLight['kind']) =>
  kind === 'dip-shade' || kind === 'dip-light' || kind === 'shine';

/** The middle point of a mouth's `edge`. */
const midpoint = (edge: readonly Point[]) =>
  edge[Math.floor(edge.length / 2)] ?? { x: 0, y: 0 };

export function paintTrumpet(
  brush: MushroomBrush & { genes: ChanterelleGenes },
  stem: readonly Point[],
): void {
  const { graphics, genes, tints, toMushroom, ink, lighting, tone, size } =
    brush;
  const [lip, funnel] = headOutlines(genes).map((outline) =>
    outline.map((point) => toMushroom(point)),
  );
  if (!lip || !funnel) return;
  // Both inks first, so each fill covers the other's line across the joint.
  inkUnder(graphics, funnel, inkFor(tone(tints.under)), ink, lighting);
  inkStem(brush, stem);
  paintStem(brush, stem, { inkLaid: true });
  graphics.fillStyle(tone(tints.under));
  fillShape(graphics, funnel);
  paintFunnelLight(brush, funnel);

  graphics.fillStyle(tone(PALETTE.chanterelle.ridge));
  for (const ridge of ridgeLines(genes)) {
    strokeTapered(
      graphics,
      ridge.map((point) => brush.canvas(point)),
      [ink * RIDGE[0], ink * RIDGE[1]],
      lighting,
    );
  }

  inkUnder(graphics, lip, inkFor(tone(tints.cap)), ink, lighting);
  graphics.fillStyle(tone(tints.cap));
  fillShape(graphics, lip);
  const thick = genes.lip * size;
  const layers = capLight(genes, lighting.toward);
  paintCapLight(
    brush,
    layers.filter(({ kind }) => !inMouth(kind)),
    toMushroom({ x: 0, y: genes.capHeight + genes.lip * 0.2 }),
    (kind) => thick * DEPTHS[kind],
    SHADE_ALPHA,
  );
  paintMouth(
    brush,
    thick,
    layers.filter(({ kind }) => inMouth(kind)),
  );
}

/**
 * The funnel's mouth over the lip: the far inner wall under the far rim,
 * deeper than the lip round it, lit and shaded inside as `layers` say, with
 * a fine line along each edge — the near one, the curled rim's edge, the
 * heavier.
 */
function paintMouth(
  brush: MushroomBrush & { genes: ChanterelleGenes },
  thick: number,
  layers: readonly CapLight[],
): void {
  const { graphics, genes, tints, toMushroom, ink, lighting, tone } = brush;
  const { far, near } = mouthEdges(genes);
  const [farEdge, nearEdge] = [far, near].map((edge) =>
    edge.map((point) => toMushroom(point)),
  );
  if (!farEdge || !nearEdge) return;
  const mouth = [...farEdge, ...nearEdge];
  graphics.fillStyle(tone(tints.cap));
  fillShape(graphics, mouth);
  shadeWith(brush, MOUTH_SHADE);
  fillShape(graphics, mouth);
  const [top, bottom] = [midpoint(far), midpoint(near)];
  paintCapLight(
    brush,
    layers,
    toMushroom({ x: 0, y: (top.y + bottom.y) / 2 }),
    (kind) => thick * DEPTHS[kind],
    SHADE_ALPHA,
  );
  graphics.fillStyle(inkFor(tone(tints.cap)));
  for (const [edge, width] of [
    [nearEdge, MOUTH_LINE.near],
    [farEdge, MOUTH_LINE.far],
  ] as const) {
    strokeTapered(graphics, edge, [ink * width, ink * width], lighting);
  }
}

/**
 * The funnel's light, as a stem's: shade down the side turned from the sun,
 * warm light up the other, and the lip's shade along its rim.
 */
function paintFunnelLight(
  brush: MushroomBrush & { genes: ChanterelleGenes },
  funnel: readonly Point[],
): void {
  const { graphics, genes, lighting, tints, size, toMushroom } = brush;
  const side = CURVE_STEPS + 1;
  // Up from the rim to the stem's top on the left, then out to the rim on the right, then the front rim.
  const [left, right, rim] = [
    funnel.slice(0, side),
    funnel.slice(side, side * 2),
    funnel.slice(side * 2),
  ];
  const [sunSide, shadeSide] = bySun(lighting.toward, [left, right]);
  const middle = toMushroom({ x: 0, y: genes.capHeight * 0.6 });
  const across = genes.capWidth * size;
  const strength = sideways(lighting.toward);
  shadeWith(brush, FUNNEL_SIDE.alpha * strength);
  fillShape(graphics, crescent(shadeSide, middle, across * FUNNEL_SIDE.depth));
  lightWith(brush, tints.capLit, FUNNEL_LIT.alpha * strength);
  fillShape(graphics, crescent(sunSide, middle, across * FUNNEL_LIT.depth));
  shadeWith(brush, UNDER_LIP.alpha);
  fillShape(
    graphics,
    crescent(rim, toMushroom({ x: 0, y: 0 }), across * UNDER_LIP.depth),
  );
}
