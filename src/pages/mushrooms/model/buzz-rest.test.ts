import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { crawl, hop, HOP_EVERY, HOP_REACH, jitter, rubbing } from './buzz-rest';
import { INSECT_KINDS, type InsectKind } from './insect-genes';
import { LANDING, type Stay, wingBeat } from './insect-motion';

/** A stay on a cap: flying from 0, landing at 1000, due to leave at 9000. */
const STAY: Stay = {
  departs: 0,
  arrives: 1000,
  leaves: 9000,
  to: { kind: 'cap', id: 'cap' },
  launch: 0,
  speed: 0,
  drink: 0,
};
const PHASES = [0, 0.7, 2, 3.5, 5.9];
const times = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, index) => from + index * step,
  );
type SizeParams = { x: number; y: number };

const size = ({ x, y }: SizeParams) => Math.hypot(x, y);

describe('a fly at rest', () => {
  it('is still in flight, through its landing, and as it is due to leave', () => {
    for (const phase of PHASES) {
      for (const now of [
        ...times(0, STAY.arrives + LANDING, 5),
        ...times(STAY.leaves, STAY.leaves + 500, 5),
      ]) {
        assert.equal(size(jitter(STAY, now, { phase })), 0);
        assert.equal(rubbing(STAY, now, { phase }), 0);
        assert.deepEqual(hop(STAY, now, { phase }), { along: 0, rise: 0 });
      }
    }
  });

  it('jitters tinily and fast, never jumping', () => {
    for (const phase of PHASES) {
      const offsets = times(STAY.arrives, STAY.leaves, 1).map((now) =>
        jitter(STAY, now, { phase }),
      );
      assert.ok(Math.max(...offsets.map((each) => size(each))) < 0.02);
      const moved = offsets.filter(
        (each, index) => index > 0 && size(each) > 0.005,
      ).length;
      assert.ok(moved > 1000);
      for (const [index, each] of offsets.entries()) {
        const last = offsets[index - 1] ?? each;
        assert.ok(size({ x: each.x - last.x, y: each.y - last.y }) < 0.002);
      }
    }
  });

  it('rubs its front legs in bouts, between 0 and 1', () => {
    for (const phase of PHASES) {
      const rubs = times(STAY.arrives, STAY.leaves, 5).map((now) =>
        rubbing(STAY, now, { phase }),
      );
      assert.ok(rubs.every((rub) => rub >= 0 && rub <= 1));
      assert.ok(Math.max(...rubs) > 0.8);
      assert.ok(rubs.filter((rub) => rub === 0).length > rubs.length / 3);
    }
  });

  it('hops out along the cap and back about once a second, never far', () => {
    for (const phase of PHASES) {
      const hops = times(STAY.arrives, STAY.leaves, 5).map((now) =>
        hop(STAY, now, { phase }),
      );
      const along = hops.map((each) => each.along);
      const farthest = Math.max(...along.map((each) => Math.abs(each)));
      assert.ok(farthest <= HOP_REACH + 1e-9);
      // Out and back: every excursion from the seat returns to it.
      const outs = along.filter(
        (each, index) => each !== 0 && (along[index - 1] ?? 0) === 0,
      ).length;
      const stay = STAY.leaves - STAY.arrives - LANDING;
      assert.ok(
        Math.abs(outs - stay / HOP_EVERY) <= 1.5,
        `${String(outs)} hops`,
      );
      assert.ok(hops.every(({ rise }) => rise >= 0 && rise < 0.1));
      for (const [index, each] of along.entries()) {
        assert.ok(Math.abs(each - (along[index - 1] ?? each)) < 0.02);
      }
    }
  });
});

describe('a bee at rest', () => {
  it('crawls a little about its flower, never jumping', () => {
    const flower = { ...STAY, to: { kind: 'flower', id: 'flower-1' } } as const;
    for (const phase of PHASES) {
      const offsets = times(0, flower.leaves + 500, 5).map((now) =>
        crawl(flower, now, { phase }),
      );
      assert.ok(Math.max(...offsets.map((each) => size(each))) < 0.08);
      assert.equal(size(offsets[0] ?? { x: 1, y: 1 }), 0);
      assert.equal(size(offsets.at(-1) ?? { x: 1, y: 1 }), 0);
      for (const [index, each] of offsets.entries()) {
        const last = offsets[index - 1] ?? each;
        assert.ok(size({ x: each.x - last.x, y: each.y - last.y }) < 0.005);
      }
    }
  });
});

/** How many strokes a `kind`'s wings make in the air, over 600 ms of `STAY`'s flight. */
const inAir = (kind: InsectKind) => strokes(STAY, 300, 900, { phase: 0, kind });

/** How many times the wings turn from opening to closing between `from` and `to`. */
function strokes(
  stay: Stay,
  from: number,
  to: number,
  motion: Parameters<typeof wingBeat>[2],
) {
  const beats = times(from, to, 1).map((now) => wingBeat(stay, now, motion));
  return beats.filter(
    (beat, index) =>
      index > 1 &&
      (beats[index - 1] ?? 0) > beat &&
      (beats[index - 1] ?? 0) >= (beats[index - 2] ?? 0),
  ).length;
}

describe('wingBeat, every kind', () => {
  it('stays between 0 and 1, in the air and at rest', () => {
    for (const kind of INSECT_KINDS) {
      for (const phase of PHASES) {
        for (const now of times(0, 9000, 3)) {
          const open = wingBeat(STAY, now, { phase, kind });
          assert.ok(open >= 0 && open <= 1, `${kind} ${String(open)}`);
        }
      }
    }
  });

  it('beats a fly’s and a bee’s wings far faster than a butterfly’s', () => {
    assert.ok(inAir('fly') > inAir('butterfly') * 4);
    assert.ok(inAir('bee') > inAir('butterfly') * 3);
  });

  it('lays a fly’s wings still at rest, and flutters a bee’s now and then', () => {
    const settled = STAY.arrives + 600;
    for (const phase of PHASES) {
      for (const now of times(settled, STAY.leaves, 7)) {
        assert.equal(wingBeat(STAY, now, { phase, kind: 'fly' }), 0);
      }
      const bee = times(settled, STAY.leaves, 3).map((now) =>
        wingBeat(STAY, now, { phase, kind: 'bee' }),
      );
      assert.ok(Math.max(...bee) > 0.1);
      assert.ok(bee.filter((open) => open === 0).length > bee.length / 2);
    }
  });
});
