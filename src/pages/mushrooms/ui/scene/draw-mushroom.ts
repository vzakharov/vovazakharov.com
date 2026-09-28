import type * as Phaser from 'phaser';

import { ellipse, placedAt, type Point, sample } from '../../model/geometry';
import type { Light } from '../../model/light';
import type { MushroomGenes, PorciniGenes } from '../../model/mushroom-genes';
import { footWidth, type TapArea } from '../../model/mushroom-outline';
import { stemAt } from '../../model/mushroom-pose';
import { stemHalfWidth } from '../../model/mushroom-profile';
import type { Lighting } from './ink';
import { mushroomShadow } from './mushroom-light';
import {
  type MushroomBrush,
  mushroomBrush,
  paintStem,
  stemPoints,
} from './mushroom-paint';
import { paintDome } from './paint-dome';
import { paintTrumpet } from './paint-trumpet';
import { PALETTE } from './palette';
import { paintShadow, strokeLine, strokeShape } from './shapes';

/**
 * The selection band's width outside a mushroom's own ink, per unit of its
 * size and at the least in pixels, and its ink edge's.
 */
const SELECTION_BAND = 0.05;
const SELECTION_BAND_LEAST = 5;
const SELECTION_EDGE = 2.5;

/** Centred on `graphics`' own position, the mushroom's foot (`mushroomShadow`). */
export function drawMushroomShadow(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  light: Light,
  turn = 0,
): void {
  paintShadow(graphics, mushroomShadow(genes, size, light, turn));
}

/**
 * Paints one mushroom into `graphics`, whose own position is the foot and
 * whose rotation is the lean, `turn` — so the scene squashes and rocks it from
 * the ground, the foot kept level with it — lit from where `lighting`, in
 * that turned frame, says (`mushroomLights`). `haze`, from 0 to 1, takes
 * every colour toward the air's, as distance does. A chanterelle is one
 * trumpet (`paintTrumpet`); every other species a stem under a dome
 * (`paintDome`).
 */
export function drawMushroom(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  lighting: Lighting,
  { haze = 0, turn = 0 } = {},
): void {
  const brush = mushroomBrush(graphics, genes, size, lighting, haze);
  const stem = stemPoints(brush, turn);
  if (genes.species === 'chanterelle') {
    paintTrumpet({ ...brush, genes }, stem);
    return;
  }
  paintStem(brush, stem);
  if (genes.species === 'porcini') paintNet({ ...brush, genes });
  paintDome({ ...brush, genes });
}

/** How far down a porcini's stem its net reaches, from the top, and how many rows of mesh it has. */
const NET = { from: 0.72, rows: 4 };
const NET_ALPHA = 0.5;

/**
 * The faint net near the top of a porcini's stem: rows of small arcs across
 * its front, each row between the last one's, as a mesh reads from afar.
 */
function paintNet(brush: MushroomBrush & { genes: PorciniGenes }): void {
  const { graphics, genes, canvas, tone, ink, haze, lighting } = brush;
  graphics.lineStyle(
    Math.max(lighting.hairline, ink * 0.4),
    tone(PALETTE.porcini.net),
    NET_ALPHA * (1 - haze),
  );
  for (let row = 0; row < NET.rows; row++) {
    const t = NET.from + ((1 - NET.from) * (row + 0.5)) / NET.rows;
    const station = stemAt(genes, t);
    const half = stemHalfWidth(genes, t) * 0.8;
    const cells = 3 + (row % 2);
    const width = (2 * half) / cells;
    for (let cell = 0; cell < cells; cell++) {
      const from = -half + width * cell;
      // A cell's arc bows up over its width, and the rows' arcs stagger.
      const arc = sample(-1, 1, 4, (u) => {
        const x = from + (width * (u + 1)) / 2;
        const y = genes.stemHeight * 0.025 * (1 - u * u);
        const { tilt } = station;
        return canvas({
          x: station.x + x * Math.cos(tilt) + y * Math.sin(tilt),
          y: station.y - x * Math.sin(tilt) + y * Math.cos(tilt),
        });
      });
      strokeLine(graphics, arc);
    }
  }
}

/**
 * The selection band round `outlines`, in the mushroom's graphics' frame.
 * Painted into a graphics just behind the mushroom, so only the half outside
 * its own ink line shows.
 */
export function drawSelection(
  graphics: Phaser.GameObjects.Graphics,
  outlines: TapArea,
  size: number,
): void {
  const parts = Object.values(outlines);
  strokeSelection(graphics, graphics, selectionBand(size) * 2, () => {
    for (const part of parts) strokeShape(graphics, part);
  });
}

/**
 * The ground ring's two graphics, both centred on the mushroom's foot: its
 * ink edge, under the band round the mushroom, and its yellow, over that
 * band, so where the two meet at the foot they run into one another as the
 * band's own strokes do.
 */
export type RingGraphics = Record<'edge' | 'band', Phaser.GameObjects.Graphics>;

/**
 * How far below the foot the ring's front arc runs, in its own width. The
 * band reaches one width below the foot, its ink edge just past that, and
 * the ring's yellow straddles that edge and covers it.
 */
const RING_DEPTH = 1.25;

/**
 * The selected mushroom's ring of light on the ground: as wide as its foot
 * stands turned `turn` (`footWidth`), so its ends meet the band at the
 * foot's corners, and deep enough that its front arc shows below the band
 * under `stem`, the stem's outline in the mushroom's graphics' frame.
 */
export function drawSelectionRing(
  { edge, band }: RingGraphics,
  genes: MushroomGenes,
  size: number,
  turn: number,
  stem: readonly Point[],
): void {
  const half = (footWidth(genes, turn) * size) / 2;
  const width = selectionBand(size);
  // The foot's lowest point on screen, where the ring's graphics stands unturned.
  const sag = Math.max(
    0,
    ...stem.map((point) => placedAt({ x: 0, y: 0 }, turn, point).y),
  );
  const ring = ellipse({ x: 0, y: 0 }, half, sag + width * RING_DEPTH);
  strokeSelection(edge, band, width, (graphics) => {
    strokeShape(graphics, ring);
  });
}

function selectionBand(size: number): number {
  return Math.max(SELECTION_BAND_LEAST, size * SELECTION_BAND);
}

/**
 * What `stroke` draws, as a `band`-wide stroke in `PALETTE.selection` into
 * `inBand`, edged in ink into `inEdge`. Every edge goes down before any band,
 * so where two strokes meet — the stem under the cap — the bands run into
 * one another and no ink crosses them.
 */
function strokeSelection(
  inEdge: Phaser.GameObjects.Graphics,
  inBand: Phaser.GameObjects.Graphics,
  band: number,
  stroke: (graphics: Phaser.GameObjects.Graphics) => void,
): void {
  inEdge.lineStyle(band + SELECTION_EDGE * 2, PALETTE.ink);
  stroke(inEdge);
  inBand.lineStyle(band, PALETTE.selection);
  stroke(inBand);
}
