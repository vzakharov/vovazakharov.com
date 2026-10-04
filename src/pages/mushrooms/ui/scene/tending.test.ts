import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { MUSHROOM_SLOTS } from '../../model/crowding';
import { reduce, sameFoot } from '../../model/game';
import { type Eye, OPENING_EYE } from '../../model/ground';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { plantedId, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { flowersOf } from './flower-plots';
import { coversOn, roomFor as beeRoomFor, type Stand } from './flower-sight';
import { LiveLawn, type Sprout } from './lawn';
import { roomFor as mushroomRoomFor } from './mushroom-room';
import {
  lostOn,
  plantableIn,
  TEND_SLICE,
  Tended,
  tendedIn,
  Tending,
  tendTufts,
} from './tending';
import { viewAt } from './view';
import { type Opened, opened } from './visit-play';

/** Steps `tending` until it hands back its tufts, and how many steps that took. */
function drained(tending: Tending): [Sprout[], number] {
  for (let steps = 1; ; steps++) {
    const standing = tending.step();
    if (standing) return [standing, steps];
  }
}

describe('Tending', () => {
  for (const [seed, forest] of [
    [3, true],
    [11, false],
  ] as const) {
    it(`stands, spread over frames, exactly the tufts tendTufts stands at once (visit ${String(seed)})`, () => {
      const stand = opened(seed, 1180, 820, forest);
      const { layout } = stand;
      const lawn = new LiveLawn({ seed: seed * 31, layout });
      for (const eye of [
        OPENING_EYE,
        { x: 6, y: 9, heading: 0.7 },
        { x: -30, y: -45, heading: Math.PI },
      ]) {
        const grown = lawn
          .round(eye)
          .filter(tendedIn(viewAt(layout.camera, eye)));
        assert.ok(grown.length > 2 * TEND_SLICE, JSON.stringify(eye));
        const [standing, steps] = drained(new Tending(stand, grown, eye));
        assert.deepEqual(standing, tendTufts(stand, grown, eye));
        // The rules on the first step, then `TEND_SLICE` tufts a step.
        assert.equal(steps, 1 + Math.ceil(grown.length / TEND_SLICE));
      }
    });
  }

  it('stands nothing, a step after reading the rules, when nothing is grown', () => {
    const stand = opened(3, 1180, 820, false);
    const tending = new Tending(stand, [], OPENING_EYE);
    assert.equal(tending.step(), undefined);
    assert.deepEqual(tending.step(), []);
  });
});

/** A second eye off the opening, its anchor elsewhere. */
const AWAY: Eye = { x: 6, y: 9, heading: 0.7 };

/** `stand` with a flower the child planted on `sprout`'s foot. */
function childPlanted(stand: Stand, { foot }: Sprout, seed: number): Stand {
  const sown: Sown = { id: plantedId(stand.planted), seed, foot };
  return { ...stand, planted: [...stand.planted, sown] };
}

/** `stand` with a flower a bee planted in each slot `roomFor` offers round the flowers it stands, one stand a slot. */
function beePlanted(stand: Stand, seed: number): Stand[] {
  const random = mulberry32(seed);
  const ids = flowersOf(stand).map(({ id }) => id);
  return beeRoomFor(stand, ids, coversOn(stand.layout, stand.mushrooms)).map(
    (slot) => {
      const sown: Sown = {
        id: plantedId(stand.planted),
        seed: nextSeed(random),
        parent: slot.flower,
        ...pick(slot, 'ring'),
      };
      return { ...stand, planted: [...stand.planted, sown] };
    },
  );
}

/**
 * `stand`, short a mushroom when it stands `MUSHROOM_SLOTS`, before and after
 * a mushroom grows where `roomFor` finds room in the view from `eye`.
 */
function mushroomGrown(
  stand: Opened,
  eye: Eye,
  seed: number,
): Array<[Stand, Stand]> {
  const full = stand.meadow.mushrooms.length >= MUSHROOM_SLOTS;
  const mushrooms = full ? stand.mushrooms.slice(0, -1) : stand.mushrooms;
  const meadow = { ...stand.meadow, mushrooms };
  const was = { ...stand, meadow, mushrooms };
  const growing = mulberry32(seed);
  return MUSHROOM_SPECIES.flatMap((species): Array<[Stand, Stand]> => {
    const own = nextSeed(growing);
    const foot = mushroomRoomFor(was, own, viewAt(stand.layout.camera, eye));
    if (!foot) return [];
    const grown = reduce(meadow, { kind: 'grow', species, seed: own, ...foot });
    return [[was, { ...was, ...pick(grown, 'mushrooms') }]];
  });
}

/** The tufts the lawn of `stand`'s visit `seed` grows round `eye` and the view from it tends. */
function gatherer(seed: number): (stand: Stand, eye: Eye) => Sprout[] {
  let lawn: LiveLawn | undefined;
  return (stand, eye) => {
    lawn ??= new LiveLawn({ seed: seed * 31, ...pick(stand, 'layout') });
    return lawn.round(eye).filter(tendedIn(viewAt(stand.layout.camera, eye)));
  };
}

describe('lostOn', () => {
  const lost = { child: 0, bee: 0, mushroom: 0 };
  for (const [seed, forest] of [
    [3, true],
    [11, false],
  ] as const) {
    for (const eye of [OPENING_EYE, AWAY]) {
      it(`loses exactly the standing tufts plantableIn no longer stands, after a child's, a bee's or a mushroom's newcomer (visit ${String(seed)}, eye ${JSON.stringify(eye)})`, () => {
        const stand = opened(seed, 1180, 820, forest);
        const gather = gatherer(seed);
        /** Asserts `lostOn` on `was` → `now` against the full rules, over the tufts standing on `was`; how many went. */
        const agrees = (was: Stand, now: Stand): number => {
          const standing = tendTufts(was, gather(was, eye), eye);
          const losing = lostOn(was, now, eye);
          const judge = plantableIn(now, eye);
          const went = standing.filter((sprout) => losing(sprout));
          assert.deepEqual(
            went,
            standing.filter((sprout) => !judge(sprout)),
          );
          return went.length;
        };
        const standing = tendTufts(stand, gather(stand, eye), eye);
        for (const [index, sprout] of standing.entries()) {
          if (index % 9 !== 0) continue;
          lost.child += agrees(stand, childPlanted(stand, sprout, index + 1));
        }
        for (const now of beePlanted(stand, seed)) {
          lost.bee += agrees(stand, now);
        }
        for (const [was, now] of mushroomGrown(stand, eye, seed)) {
          lost.mushroom += agrees(was, now);
        }
      });
    }
  }

  it('loses some tufts to each kind of newcomer, so the cases above can fail', () => {
    assert.ok(lost.child > 0, JSON.stringify(lost));
    assert.ok(lost.bee > 0, JSON.stringify(lost));
    assert.ok(lost.mushroom > 0, JSON.stringify(lost));
  });
});

describe('Tended', () => {
  for (const [seed, forest] of [
    [3, true],
    [11, false],
  ] as const) {
    it(`hides the tuft under a child's new flower at once, then re-tends no more than TEND_SLICE tufts a frame (visit ${String(seed)})`, () => {
      const stand = opened(seed, 1180, 820, forest);
      const gather = gatherer(seed);
      const touched = new Set<Sprout>();
      // Every tuft gathered, noting each one a judge reads the foot of.
      const counted = (on: Stand, eye: Eye): Sprout[] =>
        gather(on, eye).map(({ foot, tuft }) => {
          const sprout: Sprout = {
            get foot() {
              touched.add(sprout);
              return foot;
            },
            tuft,
          };
          return sprout;
        });
      const tended = new Tended(counted);
      tended.whole(stand, OPENING_EYE);
      const [planted] = tended.standing();
      assert.ok(planted);
      const now = childPlanted(stand, planted, 7);
      tended.change(now, AWAY);
      const { foot } = planted;
      assert.ok(
        !tended.standing().some((sprout) => sameFoot(sprout.foot, foot)),
      );
      const view = viewAt(stand.layout.camera, AWAY);
      /** How many tufts a `follow` judges. */
      const judgedInFollow = (): number => {
        touched.clear();
        tended.follow(view);
        return touched.size;
      };
      // The change's own frame judges nothing, not even the rules.
      assert.equal(judgedInFollow(), 0);
      let follows = 0;
      while (tended.tendedAt() !== AWAY) {
        const judged = judgedInFollow();
        follows += 1;
        assert.ok(judged <= TEND_SLICE, String(judged));
        assert.ok(follows < 100);
      }
      // The rules on the first, then `TEND_SLICE` tufts a follow.
      const grown = gather(now, AWAY).length;
      assert.equal(follows, 1 + Math.ceil(grown / TEND_SLICE));
      assert.ok(follows > 2);
      assert.equal(tended.stand(), now);
      assert.deepEqual(
        tended.standing().map((sprout) => sprout.foot),
        tendTufts(now, gather(now, AWAY), AWAY).map((sprout) => sprout.foot),
      );
    });
  }
});
