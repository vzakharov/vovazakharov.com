import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { later } from '../../api/fake-store';
import type { Keeper } from '../../api/keeper';
import { FULL_DUSK } from '../../model/dusk';
import type { Meadow } from '../../model/game';
import type { Eye } from '../../model/ground';
import { settled } from '../../model/keeping';
import { type Kept, KEPT_VERSION } from '../../model/kept-record';
import type { WalkStart } from '../../model/walk';
import { type KeptPage, keptRecord, meadowKeeping } from './meadow-keeping';
import { opened } from './visit-play';

const SEED = 0x6b_ee_70;
const { meadow } = opened(3, 1180, 820, false);
const EYE: Eye = { x: 0.4, y: -0.2, heading: 1.1 };

type FakePage = KeptPage & {
  reloads: number;
  reports: unknown[];
  hide: () => void;
  show: () => void;
  editHash: () => void;
};

/** A page whose events the test fires, counting its reloads and reports. */
function fakePage(): FakePage {
  const shown: { visibilityState: DocumentVisibilityState } = {
    visibilityState: 'visible',
  };
  const document = Object.assign(new EventTarget(), shown);
  const window = new EventTarget();
  const turn = (state: DocumentVisibilityState) => {
    document.visibilityState = state;
    document.dispatchEvent(new Event('visibilitychange'));
  };
  const page: FakePage = {
    document,
    window,
    reloads: 0,
    reports: [],
    reload: () => {
      page.reloads += 1;
    },
    report: (error) => {
      page.reports.push(error);
    },
    hide: () => {
      turn('hidden');
    },
    show: () => {
      turn('visible');
    },
    editHash: () => {
      window.dispatchEvent(new Event('hashchange'));
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

const onScreen = (now: number) =>
  keptRecord({ seed: SEED }, meadow, now, { eye: EYE, gait: 'flight' });

/**
 * What the scene holds: no meadow before `create`, no eye before the first
 * paint; a meadow opened `fresh` rather than reopened from a kept record.
 */
type Held = {
  meadow?: Meadow;
  fitted?: boolean;
  seconds?: number;
  eye?: Eye;
  gait?: WalkStart['gait'];
  fresh?: boolean;
};

/**
 * The keeping of a scene holding `held`, its clock at `seconds`, seen from
 * `EYE` once fitted; the store check answers `stale`, or fails with it.
 */
function keeping(held: Held, stale: boolean | Error = false) {
  const keeper = fakeKeeper();
  const page = fakePage();
  const overwritten = async () => {
    await later();
    if (stale instanceof Error) throw stale;
    return stale;
  };
  const kept = meadowKeeping(
    {
      seed: SEED,
      keeper,
      overwritten,
      ...(held.fresh === true ? {} : { kept: onScreen(0) }),
    },
    { meadow: () => held.meadow },
    {
      eye: () => (held.fitted === false ? undefined : (held.eye ?? EYE)),
      gait: () => held.gait ?? 'flight',
    },
    () => held.seconds ?? 2,
    () => page,
  );
  return { kept, keeper, page };
}

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

  it('polls only when the meadow, eye or gait moved since the last record handed over', () => {
    const held: Held = { meadow, seconds: 3 };
    const { kept, keeper } = keeping(held);
    const polls = () => keeper.polled.length;
    kept.poll(3000);
    kept.poll(4000);
    assert.equal(polls(), 1, 'an idle tick keeps the same meadow');
    for (const move of [
      () => (held.meadow = { ...meadow }),
      () => (held.eye = { ...EYE, x: EYE.x + 0.1 }),
      () => (held.gait = 'steps'),
    ]) {
      const before = polls();
      move();
      kept.poll(5000);
      kept.poll(6000);
      assert.equal(polls(), before + 1);
    }
  });

  it('polls nothing after a keep that handed the same record over', () => {
    const { kept, keeper } = keeping({ meadow });
    kept.keep();
    kept.poll(3000);
    assert.deepEqual(keeper.polled, []);
  });

  it('keeps a fresh meadow only once played: an action, or the eye or gait moved', () => {
    const tickedOnly: Held = { meadow, fresh: true };
    const ticked = keeping(tickedOnly);
    ticked.kept.poll(1000);
    tickedOnly.meadow = { ...meadow };
    ticked.kept.poll(2000);
    ticked.page.hide();
    ticked.kept.bind();
    ticked.page.hide();
    assert.deepEqual(
      ticked.keeper.kept,
      [],
      'its own ticks alone keep nothing',
    );

    const acted = keeping({ meadow, fresh: true });
    acted.kept.poll(1000);
    acted.kept.keep();
    assert.equal(acted.keeper.kept.length, 1);

    for (const move of [
      { eye: { ...EYE, heading: 0 } },
      { gait: 'steps' as const },
    ]) {
      const walked: Held = { meadow, fresh: true };
      const { kept, keeper } = keeping(walked);
      kept.poll(1000);
      Object.assign(walked, move);
      kept.poll(2000);
      assert.equal(keeper.kept.length, 1);
      walked.meadow = { ...meadow };
      kept.poll(3000);
      assert.equal(keeper.kept.length, 2, 'played, its ticks keep');
    }
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
    page.editHash();
    assert.equal(keeper.kept.length, 1);
    assert.equal(page.reloads, 1);
    letGo();
    page.hide();
    page.editHash();
    assert.equal(keeper.kept.length, 1);
    assert.equal(page.reloads, 1);
  });

  it('keeps nothing from a hide until the store is checked, then pays the keep owed', async () => {
    const held: Held = { meadow };
    const { kept, keeper, page } = keeping(held);
    kept.bind();
    page.hide();
    page.show();
    held.meadow = { ...meadow };
    kept.keep();
    kept.poll(9000);
    assert.equal(keeper.kept.length, 1);
    await later();
    assert.equal(keeper.kept.length, 2);
    held.meadow = { ...meadow };
    kept.poll(9000);
    assert.equal(keeper.kept.length, 3);
    assert.equal(page.reloads, 0);
  });

  it('reloads rather than keep when another tab kept the meadow meanwhile', async () => {
    const { kept, keeper, page } = keeping({ meadow }, true);
    kept.bind();
    page.hide();
    page.show();
    kept.keep();
    await later();
    kept.poll(9000);
    assert.equal(keeper.kept.length, 1);
    assert.equal(page.reloads, 1);
  });

  it('stays paused when hidden again before the check answers', async () => {
    const { kept, keeper, page } = keeping({ meadow });
    kept.bind();
    page.hide();
    page.show();
    page.hide();
    await later();
    kept.poll(9000);
    assert.equal(keeper.kept.length, 1);
  });

  it('reports a check that fails and keeps nothing more', async () => {
    const failure = new Error('refused');
    const { kept, keeper, page } = keeping({ meadow }, failure);
    kept.bind();
    page.hide();
    page.show();
    await later();
    kept.keep();
    kept.poll(9000);
    assert.equal(keeper.kept.length, 1);
    assert.deepEqual(page.reports, [failure]);
    assert.equal(page.reloads, 0);
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
    page.editHash();
    assert.equal(page.reloads, 0);
  });
});
