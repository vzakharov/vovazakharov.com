import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OCTAVES } from './octaves';
import { groundSlope, reliefAt } from './relief';
import { stream } from './stream.test-kit';

/** Ground `d` metres from the coast with every regional and hill octave reading `broad`, every fine one `fine`. */
const groundAt = (d: number, broad: number, fine: number) =>
  reliefAt(d, 0, OCTAVES, (octave) =>
    octave.regional || octave.hill ? broad : fine,
  );

/** Ground `d` metres from the coast with each octave reading its entry in `values`. */
const drawnAt = (values: readonly number[], d: number) =>
  reliefAt(d, 0, OCTAVES, ({ index }) => values[index] ?? 0);

/** Ground `d` metres from the coast with each octave a sine of its wavelength along the way in, at its phase in `phases`. */
const sinesAt = (phases: readonly number[], d: number) =>
  reliefAt(d, 0, OCTAVES, ({ index, wavelength }) =>
    Math.sin((2 * Math.PI * d) / wavelength + (phases[index] ?? 0)),
  );

describe('groundSlope', () => {
  it('bounds the ground climbing straight in from the coast', () => {
    // Each octave a sine of its own wavelength along the path, so at its
    // steepest 2π per wavelength — a slope `groundSlope(2π, 0)` bounds.
    const next = stream(23);
    const bound = groundSlope(2 * Math.PI, 0);
    for (let trial = 0; trial < 40; trial += 1) {
      const phases = OCTAVES.map(() => 2 * Math.PI * next());
      for (let d = 0.05; d < 20_000; d += 0.37) {
        const slope =
          Math.abs(sinesAt(phases, d + 0.01) - sinesAt(phases, d - 0.01)) /
          0.02;
        assert.ok(slope <= bound, `${slope} > ${bound} at ${d} m`);
      }
    }
  });
});

describe('reliefAt near the coast', () => {
  it('lays a fine trough on the broad relief, not on a level', () => {
    // 1.5 km inland: the trough's ground climbs with the broad relief under it.
    const low = groundAt(1500, 0.3, -1);
    const high = groundAt(1500, 0.6, -1);
    const rise = groundAt(1500, 0.6, 0) - groundAt(1500, 0.3, 0);
    assert.ok(rise > 3, `broad rise ${rise}`);
    assert.ok(high - low > 0.75 * rise, `${high - low} vs ${rise}`);
    assert.ok(high - low <= rise + 1e-9, `${high - low} vs ${rise}`);
    assert.ok(low > 5, `trough ground ${low}`);
  });

  it('keeps the coast where the distance crosses zero', () => {
    const next = stream(5);
    for (let k = 0; k < 500; k += 1) {
      const values = OCTAVES.map(() => 2 * next() - 1);
      for (const d of [0.01, 1, 30, 400, 3000]) {
        const ground = drawnAt(values, d);
        assert.ok(ground > 0, `land ${d} m inland: ${ground}`);
      }
      const shore = drawnAt(values, 0.01);
      assert.ok(shore < 0.01, `no step at the shore: ${shore}`);
      assert.ok(drawnAt(values, 0) <= 0, 'sea on the coast');
      assert.ok(drawnAt(values, -0.01) > -0.01, 'no step offshore');
    }
  });
});
