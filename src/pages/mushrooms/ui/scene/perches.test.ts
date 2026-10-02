import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Perch, perchName } from '../../model/flight';
import { apartIn } from '../../model/flight-timing';
import type { Point } from '../../model/geometry';
import { type Eye, OPENING_EYE } from '../../model/ground';
import { anchoredStand } from './anchored-stand';
import { type Stand, WIDEST_SPAN } from './flower-sight';
import { awayDown, leavingAloft } from './insect-away';
import { drawnAloft } from './insect-frame';
import { footRows, PERCH_REACH, perchSight, seatAt } from './perch-sight';
import { Perches } from './perches';
import { aloftOfLayout } from './plane-place';
import { viewAt } from './view';
import { opened } from './visit-play';

/** Eyes walked into the forest and turned, from which the screen still shows caps. */
const EYES = [
  { x: 0, y: 3, heading: 0 },
  { x: 2, y: 4, heading: 0 },
  { x: 1.5, y: 2, heading: 0.3 },
  { x: -2, y: 3, heading: -0.3 },
  { x: 0, y: 0, heading: 0.6 },
  { x: -1, y: 1, heading: -0.6 },
  { x: 0, y: 0, heading: 1.6 },
];

describe('Perches.sightFrom', () => {
  for (const [name, width, height] of [
    ['tablet', 1180, 820],
    ['phone', 390, 844],
  ] as const) {
    it(`times a leg off every cap in view as long as it is drawn, from an eye walked and turned, on a ${name} screen`, () => {
      const stand = opened(3, width, height, true);
      const { layout, mushrooms } = stand;
      const { camera, insectSize: unit, insectSizes } = layout;
      const perches = new Perches(() => ({
        bed: undefined,
        flowers: undefined,
      }));
      perches.see(stand);
      const rows = footRows(stand);
      const away = {
        span: WIDEST_SPAN * insectSizes.butterfly,
        drop: awayDown(height, 0),
      };
      const to: Perch = { kind: 'away', side: 'right' };
      let legs = 0;
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        const { places } = perches.sightFrom(view);
        for (const { id } of mushrooms) {
          const cap: Perch = { kind: 'cap', id };
          const seat = seatAt(stand, cap, 0);
          const row = rows.get(perchName(cap));
          if (!seat || row === undefined) continue;
          const from = aloftOfLayout(camera, seat, row);
          const start = drawnAloft(view, from);
          const end = drawnAloft(view, leavingAloft(view, 'right', away, from));
          if (!start || !end || start.x < 0 || start.x > width) continue;
          const timed = apartIn(places, cap, to);
          assert.ok(timed !== undefined, id);
          const zoom = (start.zoom + end.zoom) / 2;
          const drawn =
            Math.hypot(end.x - start.x, end.y - start.y) / (unit * zoom);
          const pace = drawn / timed;
          assert.ok(
            pace > 0.85 && pace < 1.15,
            `${id} from ${JSON.stringify(eye)}: drawn ${drawn.toFixed(2)} sizes, timed ${timed.toFixed(2)}`,
          );
          legs++;
        }
      }
      assert.ok(legs > 10, `only ${String(legs)} legs in view`);
    });
  }
});

/** `stand` with one more mushroom, `lone`, like its first, its foot at `at` on the plane. */
function withLone(stand: Stand, at: Point): Stand {
  const [first] = stand.mushrooms;
  assert.ok(first);
  return {
    ...stand,
    mushrooms: [
      ...stand.mushrooms,
      { ...first, id: 'lone', foot: { ...first.foot, ...at } },
    ],
  };
}

const LONE = perchName({ kind: 'cap', id: 'lone' });

describe('perches judged at an anchor', () => {
  it('are the opening sight itself at the opening eye', () => {
    const stand = opened(3, 1180, 820, true);
    assert.equal(anchoredStand(stand, OPENING_EYE), stand);
    const [plain, anchored] = [undefined, OPENING_EYE].map((anchor) => {
      const perches = new Perches(() => ({
        bed: undefined,
        flowers: undefined,
      }));
      perches.see(stand, anchor);
      return perches.sightFrom(viewAt(stand.layout.camera, OPENING_EYE));
    });
    assert.deepEqual(anchored, plain);
  });

  it('offer no cap past PERCH_REACH of the anchor', () => {
    const stand = withLone(opened(3, 1180, 820, true), { x: 0, y: 10 });
    const near: Eye = { x: 0, y: 0, heading: 0 };
    const far: Eye = { x: 0, y: 10 - PERCH_REACH - 1, heading: 0 };
    assert.ok(perchSight(anchoredStand(stand, near)).places?.[LONE]);
    assert.equal(
      perchSight(anchoredStand(stand, far)).places?.[LONE],
      undefined,
    );
  });

  it('place a cap behind the opening eye from an anchor facing it, where it stands', () => {
    const stand = withLone(opened(3, 1180, 820, true), { x: 0.3, y: -10 });
    assert.equal(perchSight(stand).places?.[LONE], undefined);
    const anchor: Eye = { x: 0, y: 0, heading: Math.PI };
    const perches = new Perches(() => ({ bed: undefined, flowers: undefined }));
    perches.see(stand, anchor);
    const place = perches.sightFrom(viewAt(stand.layout.camera, anchor))
      .places?.[LONE];
    assert.ok(place);
    assert.ok(
      Math.abs(place.fromEye - Math.hypot(0.3, 10)) < 0.5,
      String(place.fromEye),
    );
  });
});
