import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { perchName } from '../../model/flight';
import { OPENING_EYE } from '../../model/ground';
import { INSECT_KINDS } from '../../model/insect-genes';
import { INSECT_LIMITS } from '../../model/insects';
import {
  AIR_BELOW,
  airAloftOf,
  airAlofts,
  airOf,
  airSpots,
  clumpRow,
} from './air-spots';
import { drawnAloft } from './insect-frame';
import { meadowLayout } from './layout';
import { placeOfAloft } from './plane-place';
import { rowAt, viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';
import { widestOn } from './widest-spans';

/** Eyes walked and turned off the opening one, in the steps the perches are re-seen by and past them. */
const EYES = [
  OPENING_EYE,
  { ...OPENING_EYE, x: 2 },
  { ...OPENING_EYE, y: OPENING_EYE.y + 2 },
  { ...OPENING_EYE, heading: 0.3 },
  { x: 7, y: -12, heading: 2.5 },
  { x: -30, y: 41, heading: -Math.PI + 0.1 },
];

describe('airSpots', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`offers a spot for every butterfly and one more, each inside the world by half a butterfly's widest wings, from any eye, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 40)) {
        const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25);
        const half = widestOn(layout, 'butterfly') / 2;
        for (const eye of EYES) {
          const spots = airSpots(layout, eye);
          assert.ok(spots.length > INSECT_LIMITS.butterfly);
          for (const { id, x, y } of spots) {
            assert.ok(x >= half && x <= layout.camera.world - half, id);
            assert.ok(y >= half, id);
          }
        }
      }
    });
  }

  it('offers some 650 spots round the eye on a tablet', () => {
    const layout = meadowLayout(1180, 820, 7);
    for (const eye of EYES) {
      const { length } = airSpots(layout, eye);
      assert.ok(length > 500 && length < 800, String(length));
    }
  });
});

describe('airAlofts', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps every spot's height in the band from a butterfly's wings under the world's top down over the back of the ground, as over the clump's row, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 3);
      const { camera } = layout;
      const row = clumpRow(camera);
      const { perPx } = rowAt(camera, row);
      const half = widestOn(layout, 'butterfly') / 2;
      const bottom = Math.max(
        half,
        camera.groundTop + AIR_BELOW * camera.ground,
      );
      const [low, high] = [(row - bottom) * perPx, (row - half) * perPx];
      for (const eye of EYES) {
        for (const [id, { h }] of airAlofts(layout, eye)) {
          assert.ok(h >= low - 1e-9 && h <= high + 1e-9, id);
        }
      }
    });

    it(`lays every spot where the eye it is offered round frames its fixed point, and draws it, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 3);
      for (const eye of EYES) {
        const view = viewAt(layout.camera, eye);
        const { places, alofts } = airOf(layout, eye);
        for (const { id, x, y } of airSpots(layout, eye)) {
          const aloft = alofts.get(id);
          assert.ok(aloft && drawnAloft(view, aloft), id);
          const framed = placeOfAloft(view, 1, aloft);
          assert.ok(Math.abs(framed.x - x) < 1e-6, id);
          assert.ok(Math.abs(framed.y - y) < 1e-6, id);
          const place = places[perchName({ kind: 'air', id })];
          assert.ok(place, id);
          assert.ok(Math.abs(place.fromEye - framed.fromEye) < 1e-9, id);
        }
      }
    });
  }

  it('keeps every spot its name and fixed point from one eye to the next, walked or turned', () => {
    const layout = meadowLayout(1180, 820, 7);
    for (const [index, eye] of EYES.entries()) {
      const next = EYES[index + 1];
      if (!next) continue;
      const [here, there] = [airAlofts(layout, eye), airAlofts(layout, next)];
      let shared = 0;
      for (const [id, aloft] of here) {
        const again = there.get(id);
        if (!again) continue;
        shared++;
        assert.deepEqual(again, aloft, id);
      }
      if (index < 3) assert.ok(shared > 0, String(shared));
    }
  });
});

describe('airAloftOf', () => {
  it("finds every spot's fixed point from its name alone, offered round the eye or not", () => {
    const layout = meadowLayout(1180, 820, 7);
    for (const eye of EYES) {
      for (const [id, aloft] of airAlofts(layout, eye)) {
        assert.deepEqual(airAloftOf(layout, id), aloft, id);
      }
    }
    assert.equal(airAloftOf(layout, 'cap-3'), undefined);
  });
});

describe('airOf', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`crowds every two spots nearer as the eye draws them than two butterflies' widest wings drawn there, and no others, from any eye, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 3);
      const span = widestOn(layout, 'butterfly');
      for (const eye of EYES) {
        const view = viewAt(layout.camera, eye);
        const { alofts, aloft } = airOf(layout, eye);
        const spots = [...alofts].map(([id, at]) => {
          const drawn = drawnAloft(view, at);
          assert.ok(drawn, id);
          return { id, ...drawn };
        });
        const paired = new Set(
          aloft.flatMap(([a, b, pairings]) =>
            a.kind === 'air' &&
            b.kind === 'air' &&
            pairings.some(([p, q]) => p === 'butterfly' && q === 'butterfly')
              ? [`${a.id} ${b.id}`, `${b.id} ${a.id}`]
              : [],
          ),
        );
        for (const [index, spot] of spots.entries()) {
          for (const other of spots.slice(index + 1)) {
            const near =
              Math.hypot(spot.x - other.x, spot.y - other.y) <
              (span * (spot.zoom + other.zoom)) / 2;
            const key = `${spot.id} ${other.id}`;
            assert.equal(paired.has(key), near, key);
          }
        }
      }
    });
  }

  for (const [width, height] of [
    [844, 390],
    [1180, 820],
    [1920, 1080],
  ] as const) {
    it(`leaves no two spots uncrowded on which two insects drawn hovering at the opening overlap on the screen, on a ${String(width)}×${String(height)} screen`, () => {
      const layout = meadowLayout(width, height, 3);
      const { camera } = layout;
      const view = viewAt(camera, OPENING_EYE);
      const { alofts, aloft } = airOf(layout, OPENING_EYE);
      const crowded = new Set(
        aloft.flatMap(([a, b, pairings]) =>
          a.kind === 'air' && b.kind === 'air'
            ? pairings.map(([p, q]) => `${a.id} ${p} ${b.id} ${q}`)
            : [],
        ),
      );
      const left = (camera.world - camera.width) / 2;
      const drawn = [...alofts].flatMap(([id, at]) => {
        const placed = drawnAloft(view, at);
        assert.ok(placed, id);
        const shown = placed.x >= left && placed.x <= left + camera.width;
        return shown ? [{ id, ...placed }] : [];
      });
      const overlapping: string[] = [];
      for (const [index, a] of drawn.entries()) {
        for (const b of drawn.slice(index + 1)) {
          const between = Math.hypot(a.x - b.x, a.y - b.y);
          for (const p of INSECT_KINDS) {
            for (const q of INSECT_KINDS) {
              if (crowded.has(`${a.id} ${p} ${b.id} ${q}`)) continue;
              const wings =
                (widestOn(layout, p) * a.zoom + widestOn(layout, q) * b.zoom) /
                2;
              if (between < wings - 1e-9) {
                overlapping.push(`${a.id}/${b.id} ${p}/${q}`);
              }
            }
          }
        }
      }
      assert.deepEqual(overlapping, []);
    });
  }
});
