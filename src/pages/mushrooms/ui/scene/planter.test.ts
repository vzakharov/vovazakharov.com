import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { SEEDED_SOUNDS } from '../../model/flower-sounds';
import { type Meadow, reduce, sameFoot } from '../../model/game';
import { type Eye, OPENING_EYE } from '../../model/ground';
import { plantedId, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { takesFlower } from './flower-sight';
import { LiveLawn } from './lawn';
import { Planter } from './planter';
import { strayed, Tended } from './tending';
import { type Sprout, tendedIn, tendTufts } from './tufts';
import { viewAt } from './view';
import { type Opened, opened } from './visit-play';

/** How many visits are walked, half of them in a forest. */
const VISITS = 6;
/** How many flowers the child plants on the opening's tufts before the walk. */
const PLANTED = 10;
/**
 * Where the eye walks to from the opening, none of it past a re-tend
 * (`strayed`): steps across and ahead, a turn, and all three at once.
 */
const WALKS: readonly Eye[] = [
  { ...OPENING_EYE, x: OPENING_EYE.x + 0.2 },
  { ...OPENING_EYE, y: OPENING_EYE.y + 0.45 },
  { ...OPENING_EYE, y: OPENING_EYE.y - 0.45 },
  { ...OPENING_EYE, heading: OPENING_EYE.heading + 0.02 },
  {
    x: OPENING_EYE.x - 0.3,
    y: OPENING_EYE.y + 0.3,
    heading: OPENING_EYE.heading - 0.015,
  },
];

/** The visit `seed` on a 1180×820 screen with `PLANTED` flowers planted on its tufts, and the tufts the opening eye tends. */
function plantedVisit(seed: number, forest: boolean): [Opened, Sprout[]] {
  const opening = opened(seed, 1180, 820, forest);
  const { layout } = opening;
  const grown = new LiveLawn({ seed, layout })
    .round(OPENING_EYE)
    .filter(tendedIn(viewAt(layout.camera, OPENING_EYE)));
  const choosing = mulberry32(seed ^ 0x5e_ed);
  let stand = opening;
  for (let planting = 0; planting < PLANTED; planting++) {
    const sprouts = tendTufts(stand, grown, OPENING_EYE);
    const next = sprouts[Math.floor(choosing() * sprouts.length)];
    if (!next) break;
    const sown: Sown = {
      id: plantedId(stand.planted),
      seed: nextSeed(choosing),
      ...pick(next, 'foot'),
    };
    stand = { ...stand, planted: [...stand.planted, sown] };
  }
  return [stand, grown];
}

/**
 * What a tap on a tuft, then a key, did: whether the tap opened the picker
 * on it, the picker's shapes could plant there (`plantable`), the key planted
 * a flower on its foot, and what the child heard and saw on the way.
 */
type Tapped = {
  opened: boolean;
  plantable: boolean;
  keyed: boolean;
  heard: string[];
};

/** A tap on `sprout`, then a key, with the grass tended at `tended` showing `shown` and the eye at `eye`. */
function tapAndKey(
  stand: Opened,
  shown: readonly Sprout[],
  sprout: Sprout,
  tended: Eye,
  eye: Eye,
): Tapped {
  let meadow: Meadow = stand.meadow;
  const heard: string[] = [];
  const hear = (what: string) => () => {
    heard.push(what);
  };
  const planter = new Planter(
    { pop: hear('pop'), nuhUh: hear('nuh-uh') },
    () => 0,
    {
      stand: () => stand,
      view: () => viewAt(stand.layout.camera, eye),
      meadow: () => meadow,
      dispatch: (action) => {
        meadow = reduce(meadow, action);
      },
      tufts: () => shown,
      tendedAt: () => tended,
    },
    1,
  );
  planter.tapTuft(sprout, { refuse: hear('shake') });
  const open = meadow.planting?.foot;
  const onTuft = open !== undefined && sameFoot(open, sprout.foot);
  const plantable = planter.plantable(meadow);
  const [sound] = SEEDED_SOUNDS;
  assert.ok(sound);
  planter.plantSounding(sound);
  const sown = meadow.planted.at(-1);
  const keyed =
    meadow.planted.length > stand.meadow.planted.length &&
    sown !== undefined &&
    'foot' in sown &&
    sameFoot(sown.foot, sprout.foot);
  return { opened: onTuft, plantable, keyed, heard };
}

describe('Planter', () => {
  it('opens the picker on every tuft the grass holds and plants there, by a shape or a key, while the eye walks short of a re-tend', () => {
    let driftRefused = 0;
    for (let visit = 0; visit < VISITS; visit++) {
      const seed = visit * 7919 + 3;
      const [stand, grown] = plantedVisit(seed, visit % 2 === 1);
      // What `Grass.holds` holds once tended at the opening eye.
      const held = tendTufts(stand, grown, OPENING_EYE);
      assert.ok(held.length > 0, `visit ${String(seed)}`);
      for (const eye of WALKS) {
        const at = `visit ${String(seed)}, eye ${JSON.stringify(eye)}`;
        assert.ok(!strayed(viewAt(stand.layout.camera, eye), OPENING_EYE), at);
        for (const sprout of held) {
          if (!takesFlower(stand, sprout.foot, eye)) driftRefused += 1;
          assert.deepEqual(
            tapAndKey(stand, held, sprout, OPENING_EYE, eye),
            { opened: true, plantable: true, keyed: true, heard: [] },
            at,
          );
        }
      }
    }
    // Judged at the eye walked to, some of these tufts refuse: the walks move
    // the anchor far enough for a planter judging there to fail this test.
    assert.ok(driftRefused > 0);
  });

  it('opens the picker on every tuft the grass holds and plants there mid-re-tend, after the child plants and the eye walks', () => {
    for (let visit = 0; visit < VISITS; visit++) {
      const seed = visit * 7919 + 3;
      const [stand, grown] = plantedVisit(seed, visit % 2 === 1);
      const { layout } = stand;
      const lawn = new LiveLawn({ seed, layout });
      const tended = new Tended((_, eye) =>
        eye === OPENING_EYE
          ? grown
          : lawn.round(eye).filter(tendedIn(viewAt(layout.camera, eye))),
      );
      tended.whole(stand, OPENING_EYE);
      const [first] = tended.standing();
      assert.ok(first);
      const { meadow } = stand;
      const sown: Sown = {
        id: plantedId(stand.planted),
        seed: nextSeed(mulberry32(seed)),
        ...pick(first, 'foot'),
      };
      const planted = [...stand.planted, sown];
      const now = { ...stand, planted, meadow: { ...meadow, planted } };
      for (const eye of WALKS) {
        const at = `visit ${String(seed)}, eye ${JSON.stringify(eye)}`;
        tended.change(now, eye);
        tended.follow(viewAt(layout.camera, eye));
        tended.follow(viewAt(layout.camera, eye));
        // Still re-tending: the tufts stand as tended from the opening.
        assert.equal(tended.tendedAt(), OPENING_EYE, at);
        const held = tended.standing();
        assert.ok(held.length > 0, at);
        for (const sprout of held) {
          assert.deepEqual(
            tapAndKey(now, held, sprout, tended.tendedAt(), eye),
            { opened: true, plantable: true, keyed: true, heard: [] },
            at,
          );
        }
      }
    }
  });
});
