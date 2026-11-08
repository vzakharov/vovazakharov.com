import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Raster } from './paper';
import { signedArea, simplify } from './ring';
import { traceCoast, type TraceOptions } from './trace';

const SIZE = 160;
type Rgb = [number, number, number];
const PAPER: Rgb = [236, 236, 240];
const FILL: Rgb = [220, 210, 140];
const PALE: Rgb = [226, 218, 204];
const INK: Rgb = [40, 40, 50];

const OPTIONS: TraceOptions = {
  paperCell: 8,
  paperWindow: 6,
  inkRatio: 0.6,
  inkClosing: 1,
  colourBlur: 1,
  minChroma: 0.05,
  maxShade: 0.92,
  inkClearance: 2,
  coastReach: 6,
  peelDepth: 8,
  minColouredShare: 0.1,
  islandFloor: 40,
  blurRadius: 1,
  tolerance: 0.5,
};

type Painter = (x: number, y: number, under: Rgb) => Rgb | undefined;

/** A paper-coloured raster with every painter laid on in turn. */
function draw(...painters: Painter[]): Raster {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let colour = PAPER;
      for (const paint of painters)
        colour = paint(x + 0.5, y + 0.5, colour) ?? colour;
      data.set([...colour, 255], (y * SIZE + x) * 4);
    }
  }
  return { data, width: SIZE, height: SIZE };
}

const disc =
  (cx: number, cy: number, r: number, colour = FILL): Painter =>
  (x, y) =>
    Math.hypot(x - cx, y - cy) <= r ? colour : undefined;

/** A filled disc with an ink rim, as the drawing outlines its land. */
const inkedDisc = (cx: number, cy: number, r: number, fill = FILL) => [
  disc(cx, cy, r + 1.5, INK),
  disc(cx, cy, r, fill),
];

const stroke =
  (x0: number, y0: number, x1: number, y1: number): Painter =>
  (x, y) =>
    x >= x0 && x <= x1 && y >= y0 && y <= y1 ? INK : undefined;

/** An ink circle 2 px thick: a letter О, enclosing bare paper. */
const letterO =
  (cx: number, cy: number, r: number): Painter =>
  (x, y) =>
    Math.abs(Math.hypot(x - cx, y - cy) - r) <= 1 ? INK : undefined;

/** A tint drifting from blue to yellow across the whole sheet. */
const tint: Painter = (x) => {
  const t = x / SIZE;
  return [225 + 20 * t, 232 + 6 * t, 245 - 25 * t];
};

describe('traceCoast', () => {
  it('traces a disc as one ring of its area, clockwise on screen', () => {
    const [land, ...rest] = traceCoast(draw(...inkedDisc(80, 80, 50)), OPTIONS);
    assert.ok(land);
    assert.equal(rest.length, 0);
    const area = signedArea(land);
    assert.ok(area > 0);
    assert.ok(Math.abs(area - Math.PI * 51.5 ** 2) / area < 0.05);
  });

  it('keeps an inked lake of bare paper as a hole turning against the land', () => {
    const [land, lake, ...rest] = traceCoast(
      draw(...inkedDisc(80, 80, 60), ...inkedDisc(80, 80, 20, PAPER)),
      OPTIONS,
    );
    assert.ok(land && lake);
    assert.equal(rest.length, 0);
    assert.ok(signedArea(land) > Math.PI * 58 ** 2);
    const area = -signedArea(lake);
    assert.ok(Math.abs(area - Math.PI * 20 ** 2) / area < 0.1, `${area}`);
  });

  it('keeps a lake as small as a pool, whatever the island floor', () => {
    const traced = traceCoast(
      draw(...inkedDisc(80, 80, 50), ...inkedDisc(80, 80, 4, PAPER)),
      { ...OPTIONS, islandFloor: 200 },
    );
    assert.equal(traced.length, 2);
    assert.ok(signedArea(traced[1] ?? []) < 0);
  });

  it('fills bare paper between two strokes: too narrow to clear the ink', () => {
    // Paper 3 px wide (y 42–44) inside an inked frame, as a border drawn a
    // few pixels off the coast leaves it.
    const frame: Painter[] = [
      (x, y) => (x >= 50 && x <= 100 && y >= 40 && y <= 47 ? PAPER : undefined),
      stroke(50, 40, 100, 42),
      stroke(50, 45, 100, 47),
      stroke(50, 40, 52, 47),
      stroke(98, 40, 100, 47),
    ];
    const drawing = draw(...inkedDisc(80, 80, 60), ...frame);
    assert.equal(traceCoast(drawing, OPTIONS).length, 1);
    const looser = traceCoast(drawing, { ...OPTIONS, inkClearance: 1 });
    assert.equal(looser.length, 2, 'a clearance of 1 reads it as a lake');
  });

  it('fills an inked ring of crayon: a painted hole is land', () => {
    const traced = traceCoast(
      draw(...inkedDisc(80, 80, 60), ...inkedDisc(80, 80, 20, PALE)),
      OPTIONS,
    );
    assert.equal(traced.length, 1);
  });

  it('drops a speck under the island floor and keeps the disc', () => {
    const traced = traceCoast(
      draw(...inkedDisc(70, 70, 45), disc(145, 145, 2)),
      OPTIONS,
    );
    assert.equal(traced.length, 1);
  });

  it('loses a word in thin ink strokes on the paper, however large', () => {
    const word = [
      letterO(40, 60, 25),
      stroke(75, 30, 77, 90),
      stroke(105, 30, 107, 90),
      stroke(75, 59, 107, 61),
      letterO(130, 120, 20),
    ];
    assert.deepEqual(traceCoast(draw(...word), OPTIONS), []);
  });

  it('keeps a pale disc whole through a 1 px gap in its outline', () => {
    const gap: Painter = (x, y, under) =>
      Math.abs(x - 80) <= 0.5 && y < 40 ? PAPER : under;
    const traced = traceCoast(
      draw(...inkedDisc(80, 80, 50, PALE), gap),
      OPTIONS,
    );
    assert.equal(traced.length, 1);
    const [land] = traced;
    assert.ok(land && signedArea(land) > 0.9 * Math.PI * 50 ** 2);
  });

  it('opens a strait between two coastlines a pixel apart along a sea stroke', () => {
    const strait: Painter = (x, y, under) => {
      if (y < 24 || y > 78) return under;
      if (Math.abs(x - 80) <= 0.5) return PAPER;
      return Math.abs(x - 80) <= 1.5 ? INK : under;
    };
    const drawing = draw(...inkedDisc(80, 80, 50), strait);
    const area = (options: TraceOptions) => {
      const traced = traceCoast(drawing, options);
      assert.equal(traced.length, 1);
      const [land] = traced;
      assert.ok(land);
      return signedArea(land);
    };
    const sealed = area(OPTIONS);
    const opened = area({
      ...OPTIONS,
      seaStrokes: [
        {
          path: [
            [80, 20],
            [80, 76],
          ],
          radius: 1,
        },
      ],
    });
    assert.ok(sealed > 0.97 * Math.PI * 51.5 ** 2, `${sealed}`);
    assert.ok(sealed - opened > 2 * 45, `${sealed - opened}`);
  });

  it('reads a tinted gradient across the paper as no land', () => {
    assert.deepEqual(traceCoast(draw(tint), OPTIONS), []);
  });
});

describe('simplify', () => {
  it('keeps a square through points along its sides', () => {
    const side = Array.from({ length: 10 }, (_, i) => i);
    const square: Array<[number, number]> = [
      ...side.map((i): [number, number] => [i, 0]),
      ...side.map((i): [number, number] => [10, i]),
      ...side.map((i): [number, number] => [10 - i, 10]),
      ...side.map((i): [number, number] => [0, 10 - i]),
    ];
    const simplified = simplify(square, 0.1);
    assert.equal(simplified.length, 4);
    assert.equal(signedArea(simplified), 100);
  });
});
