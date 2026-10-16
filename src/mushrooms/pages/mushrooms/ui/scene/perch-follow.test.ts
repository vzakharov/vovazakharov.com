import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { perchName, type Sight } from '../../model/flight';
import { type Meadow, reduce } from '../../model/game';
import { distanceBetween } from '../../model/geometry';
import type { Eye } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import type { Flier } from '../../model/insects';
import type { Stand } from './flower-sight';
import { PERCH_REACH } from './perch-sight';
import { Perches } from './perches';
import { viewAt } from './view';
import { opened } from './visit-play';

/** How far up the plane the child walks: the opening's perches all past `PERCH_REACH` of him there. */
const WALKED = 40;

const NEAR: Eye = { x: 0, y: 0, heading: 0 };
const FAR: Eye = { x: 0, y: WALKED, heading: 0 };

/** What the scene sees of `stand`'s perches judged at `anchor`, framed from there. */
function sightAt(stand: Stand, anchor: Eye): Sight {
  const perches = new Perches(() => ({ bed: undefined, flowers: undefined }));
  perches.see(stand, anchor);
  return perches.sightFrom(viewAt(stand.layout.camera, anchor));
}

/** The opening forest, and its every mushroom again `WALKED` up the plane. */
function twoForests(): { stand: Stand; meadow: Meadow } {
  const { meadow, ...stand } = opened(3, 1180, 820, true);
  const mushrooms = [
    ...stand.mushrooms,
    ...stand.mushrooms.map((mushroom) => ({
      ...mushroom,
      id: `far-${mushroom.id}`,
      foot: { ...mushroom.foot, y: mushroom.foot.y + WALKED },
    })),
  ];
  return { stand: { ...stand, mushrooms }, meadow: { ...meadow, mushrooms } };
}

const TICK = 100;

describe('insects following the child', () => {
  for (const kind of [
    'fly',
    'butterfly',
    'bee',
  ] as const satisfies readonly InsectKind[]) {
    it(`a ${kind} sitting on a perch the walk leaves out of reach takes its next leg to one among the new places`, () => {
      const { stand, meadow: opening } = twoForests();
      const near = sightAt(stand, NEAR);
      let meadow = reduce(opening, {
        kind: 'release',
        insect: kind,
        seed: 0x51_7e,
        now: 0,
        ...near,
      });
      const sitting = (flier: Flier | undefined, now: number) =>
        flier !== undefined &&
        (flier.leg.to.kind === 'cap' || flier.leg.to.kind === 'flower') &&
        now >= flier.leg.arrives &&
        now < flier.leg.leaves;
      let now = 0;
      while (!sitting(meadow.insects[0], now)) {
        now += TICK;
        assert.ok(now < 120_000, `the ${kind} never sat down`);
        meadow = reduce(meadow, { kind: 'tick', now, ...near });
      }
      const [perched] = meadow.insects;
      assert.ok(perched);
      const left = perchName(perched.leg.to);
      const far = sightAt(stand, FAR);
      assert.ok(near.places?.[left], left);
      assert.equal(far.places?.[left], undefined, `${left} still offered`);

      now += TICK;
      meadow = reduce(meadow, { kind: 'tick', now, ...far });
      const [flown] = meadow.insects;
      assert.ok(flown);
      assert.notEqual(flown.leg, perched.leg, `the ${kind} stayed on ${left}`);
      assert.equal(perchName(flown.leg.from), left);
      const to = perchName(flown.leg.to);
      assert.notEqual(flown.leg.to.kind, 'away', to);
      assert.ok(far.places?.[to], `${to} is not among the new places`);
      if (flown.leg.to.kind === 'cap') {
        const { id } = flown.leg.to;
        const cap = stand.mushrooms.find((each) => each.id === id);
        assert.ok(cap);
        assert.ok(distanceBetween(FAR, cap.foot) <= PERCH_REACH, id);
      }
    });
  }
});
