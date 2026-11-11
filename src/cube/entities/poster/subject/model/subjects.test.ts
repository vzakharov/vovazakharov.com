import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { visitorMetres } from '../../frame';
import { sketchOf, subjectOf } from './subjects';

const FLOORS = Array.from({ length: 66 }, (_, at) => at + 1);

describe('the thing a floor’s visitor is the size of', () => {
  it('starts with a grown-up and ends on a question', () => {
    assert.equal(subjectOf(1).name, 'A GROWN-UP');
    assert.equal(subjectOf(5).name, 'A MOUSE');
    assert.equal(subjectOf(66).measured, undefined);
    assert.notEqual(subjectOf(66).unsizedNote ?? '', '');
  });

  it('shows thirty drawings or more on the way down', () => {
    const names = new Set(FLOORS.map((n) => subjectOf(n).name));
    assert.ok(names.size >= 30, `${names.size} drawings`);
  });

  it('never shows a bigger thing than the floor above', () => {
    for (const n of FLOORS.slice(1)) {
      assert.ok(
        subjectOf(n).metres <= subjectOf(n - 1).metres,
        `floor ${n}: ${subjectOf(n).name} after ${subjectOf(n - 1).name}`,
      );
    }
  });

  it('gives each of the first thirty-eight floors a thing of its own', () => {
    const names = FLOORS.slice(0, 38).map((n) => subjectOf(n).name);
    assert.equal(new Set(names).size, names.length);
  });

  // The widest gap is the atom's emptiness: nothing sized sits between a
  // wave of light and a nucleus.
  it('keeps a sized thing within sixteen times the visitor’s size', () => {
    for (const n of FLOORS) {
      const { name, metres, measured } = subjectOf(n);
      if (measured === undefined) continue;
      const times = metres / visitorMetres(n);
      assert.ok(times > 1 / 16 && times < 16, `floor ${n}: ${name} ×${times}`);
    }
  });

  it('draws every thing as finite strokes, in capitals', () => {
    for (const n of FLOORS) {
      const subject = subjectOf(n);
      const sketch = sketchOf(subject, n);
      assert.ok(sketch.length > 0, subject.name);
      assert.ok(
        sketch.every((line) =>
          line.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)),
        ),
        subject.name,
      );
      assert.equal(subject.name, subject.name.toUpperCase());
    }
  });
});
