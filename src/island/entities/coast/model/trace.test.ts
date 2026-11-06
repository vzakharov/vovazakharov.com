import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { signedArea, simplify } from './ring';
import { type Raster, traceCoast, type TraceOptions } from './trace';

const SIZE = 160;
const PAPER: [number, number, number] = [236, 236, 240];
const FILL: [number, number, number] = [220, 210, 140];
const INK: [number, number, number] = [40, 40, 50];

const OPTIONS: TraceOptions = {
  maxPaperSaturation: 0.15,
  minPaperValue: 0.5,
  blurRadius: 1,
  level: 0.5,
  holeFloor: 150,
  islandFloor: 150,
  tolerance: 0.5,
};

type Painter = (x: number, y: number) => [number, number, number] | undefined;

/** A paper-coloured raster with every painter laid on in turn. */
function draw(...painters: Painter[]): Raster {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const colour = painters.reduce<[number, number, number]>(
        (under, paint) => paint(x + 0.5, y + 0.5) ?? under,
        PAPER,
      );
      data.set([...colour, 255], (y * SIZE + x) * 4);
    }
  }
  return { data, width: SIZE, height: SIZE };
}

const disc =
  (cx: number, cy: number, r: number, colour = FILL): Painter =>
  (x, y) =>
    Math.hypot(x - cx, y - cy) <= r ? colour : undefined;

/** A coloured disc with an ink rim, as the drawing outlines its land. */
const inkedDisc = (cx: number, cy: number, r: number): Painter[] => [
  disc(cx, cy, r + 1.5, INK),
  disc(cx, cy, r),
];

describe('traceCoast', () => {
  it('traces a disc as one ring of its area, clockwise on screen', () => {
    const [land, ...rest] = traceCoast(draw(...inkedDisc(80, 80, 50)), OPTIONS);
    assert.ok(land);
    assert.equal(rest.length, 0);
    assert.equal(land.holes.length, 0);
    const area = signedArea(land.outer);
    assert.ok(area > 0);
    assert.ok(Math.abs(area - Math.PI * 51.5 ** 2) / area < 0.03);
  });

  it('fills a hole under the floor and keeps one above it', () => {
    const small = traceCoast(
      draw(...inkedDisc(80, 80, 60), disc(80, 80, 5, PAPER)),
      OPTIONS,
    );
    assert.equal(small.length, 1);
    assert.equal(small[0]?.holes.length, 0);

    const large = traceCoast(
      draw(...inkedDisc(80, 80, 60), disc(80, 80, 20, PAPER)),
      OPTIONS,
    );
    const [hole] = large[0]?.holes ?? [];
    assert.ok(hole);
    assert.ok(signedArea(hole) < 0);
  });

  it('drops a speck under the island floor and keeps the disc', () => {
    const traced = traceCoast(
      draw(...inkedDisc(70, 70, 45), disc(145, 145, 4)),
      OPTIONS,
    );
    assert.equal(traced.length, 1);
  });

  it('drops land that lay in a filled hole', () => {
    const traced = traceCoast(
      draw(...inkedDisc(80, 80, 60), disc(80, 80, 6, PAPER), disc(80, 80, 2)),
      { ...OPTIONS, islandFloor: 1 },
    );
    assert.equal(traced.length, 1);
  });

  it('loses a word written in ink on the paper', () => {
    // Thin strokes, as the map's lettering: an "H", an "I" and an "Л".
    const stroke =
      (x0: number, y0: number, x1: number, y1: number): Painter =>
      (x, y) =>
        x >= x0 && x <= x1 && y >= y0 && y <= y1 ? INK : undefined;
    const word = [
      stroke(20, 20, 22, 34),
      stroke(28, 20, 30, 34),
      stroke(20, 26, 30, 28),
      stroke(36, 20, 38, 34),
      stroke(44, 20, 46, 34),
      stroke(52, 20, 54, 34),
      stroke(44, 20, 54, 22),
    ];
    assert.deepEqual(traceCoast(draw(...word), OPTIONS), []);
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
