import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Keeper } from '../../api/keeper';
import { FULL_DUSK } from '../../model/dusk';
import type { Meadow } from '../../model/game';
import type { Eye } from '../../model/ground';
import { settled } from '../../model/keeping';
import { type Kept, KEPT_VERSION } from '../../model/kept-record';
import { type KeptPage, keptRecord, meadowKeeping } from './meadow-keeping';
import { opened } from './visit-play';

const SEED = 0x6b_ee_70;
const { meadow } = opened(3, 1180, 820, false);
const EYE: Eye = { x: 0.4, y: -0.2, heading: 1.1 };

type FakePage = KeptPage & { reloads: number; hide: () => void };

/** A page whose events the test fires, counting its reloads. */
function fakePage(): FakePage {
  const shown: { visibilityState: DocumentVisibilityState } = {
    visibilityState: 'visible',
  };
  const document = Object.assign(new EventTarget(), shown);
  const page: FakePage = {
    document,
    window: new EventTarget(),
    reloads: 0,
    reload: () => {
      page.reloads += 1;
    },
    hide: () => {
      document.visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    },
  };
  return page;
}

/** A keeper that writes nothing, holding what it was handed. */
function fakeKeeper(): Keeper & { kept: Kept[]; polled: number[] } {
  const kept: Kept[] = [];
  const polled: number[] = [];
  return {
    kept,
    polled,
    keep: (record) => {
      kept.push(record);
    },
    poll: (at, record) => {
      polled.push(at);
      kept.push(record());
    },
  };
}

/** What the scene holds: no meadow before `create`, no eye before the first paint. */
type Held = { meadow?: Meadow; fitted?: boolean; seconds?: number };

/** The keeping of a scene holding `held`, its clock at `seconds`, seen from `EYE` once fitted. */
function keeping(held: Held) {
  const keeper = fakeKeeper();
  const page = fakePage();
  const kept = meadowKeeping(
    { seed: SEED, keeper },
    { meadow: () => held.meadow },
    {
      eye: () => (held.fitted === false ? undefined : EYE),
      gait: () => 'flight',
    },
    () => held.seconds ?? 2,
    () => page,
  );
  return { kept, keeper, page };
}

const onScreen = (now: number) =>
  keptRecord({ seed: SEED }, meadow, now, { eye: EYE, gait: 'flight' });

describe('keptRecord', () => {
  it('keeps the meadow settled at rest as of now, with the seed and the walk start', () => {
    const dusking = { ...meadow, dusk: FULL_DUSK };
    const start = { eye: EYE, gait: 'steps' } as const;
    assert.deepEqual(keptRecord({ seed: SEED }, dusking, 3000, start), {
      version: KEPT_VERSION,
      seed: SEED,
      meadow: settled(dusking, 3000),
      ...start,
    });
  });
});

describe('meadowKeeping', () => {
  it('keeps the meadow on screen as of the scene clock, in ms', () => {
    const { kept, keeper } = keeping({ meadow, seconds: 2.5 });
    kept.keep();
    assert.deepEqual(keeper.kept, [onScreen(2500)]);
  });

  it('hands the poll the frame time and the record on screen', () => {
    const { kept, keeper } = keeping({ meadow, seconds: 3 });
    kept.poll(3000);
    assert.deepEqual(keeper.polled, [3000]);
    assert.deepEqual(keeper.kept, [onScreen(3000)]);
  });

  it('keeps nothing before the meadow or the eye is there', () => {
    for (const held of [{ meadow, fitted: false }, {}]) {
      const { kept, keeper } = keeping(held);
      kept.keep();
      kept.poll(5000);
      assert.deepEqual(keeper.kept, []);
    }
  });

  it('keeps when the tab hides and reloads on a hash edit, until let go', () => {
    const { kept, keeper, page } = keeping({ meadow });
    const letGo = kept.bind();
    page.hide();
    page.window.dispatchEvent(new Event('hashchange'));
    assert.equal(keeper.kept.length, 1);
    assert.equal(page.reloads, 1);
    letGo();
    page.hide();
    page.window.dispatchEvent(new Event('hashchange'));
    assert.equal(keeper.kept.length, 1);
    assert.equal(page.reloads, 1);
  });

  it('with no keeper, listens to nothing', () => {
    const page = fakePage();
    const kept = meadowKeeping(
      { seed: SEED },
      { meadow: () => meadow },
      { eye: () => EYE, gait: () => 'steps' },
      () => 0,
      () => page,
    );
    kept.bind();
    page.window.dispatchEvent(new Event('hashchange'));
    assert.equal(page.reloads, 0);
  });
});
