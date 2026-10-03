import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from './geometry';
import {
  answerTap,
  caller,
  emptiestNear,
  entered,
  FLEE_EVERY,
  left,
  type Mice,
  miceAt,
  miceHome,
  moved,
  retarget,
  RUN_REACH,
  RUN_SHARE,
  type RunDoor,
  runsOuting,
  runTarget,
  scattered,
} from './mouse-run';

const door = (id: string, x: number, y: number, hidden = false): RunDoor => ({
  id,
  foot: { x, y },
  seen: !hidden,
});
const miceOf = (counts: Record<string, number>): Mice =>
  new Map(Object.entries(counts));

describe('counts', () => {
  it('moves one mouse and keeps the total', () => {
    const mice = miceOf({ a: 2, b: 0 });
    const after = moved(mice, 'a', 'b');
    assert.equal(miceAt(after, 'a'), 1);
    assert.equal(miceAt(after, 'b'), 1);
    assert.equal(miceHome(after), miceHome(mice));
    assert.equal(
      miceAt(mice, 'a'),
      2,
      'the counts given are left as they were',
    );
  });

  it('brings one mouse with a new door, and never takes one from an empty house', () => {
    assert.equal(miceAt(entered(miceOf({}), 'c'), 'c'), 1);
    assert.throws(() => left(miceOf({ a: 0 }), 'a'));
    assert.throws(() => left(miceOf({}), 'z'));
  });
});

describe('runTarget', () => {
  const from = door('a', 0, 10);

  it('runs only to a door drawn now within RUN_REACH, never its own', () => {
    const doors = [
      from,
      door('far', RUN_REACH + 0.01, 10),
      door('hidden', 0.5, 10, true),
    ];
    assert.equal(runTarget(miceOf({ a: 1 }), from, doors), undefined);
    const near = door('near', RUN_REACH - 0.01, 10);
    assert.equal(runTarget(miceOf({ a: 1 }), from, [...doors, near]), 'near');
  });

  it('starts from no door that is not drawn', () => {
    const unseen = door('a', 0, 10, true);
    assert.equal(
      runTarget(miceOf({ a: 1 }), unseen, [unseen, door('b', 0.3, 10)]),
      undefined,
    );
  });

  it('picks the emptiest house, then the nearest, then by id', () => {
    const doors = [
      from,
      door('near-full', 0.2, 10),
      door('far-empty', 2, 10),
      door('mid-empty', 1, 10),
    ];
    const mice = miceOf({ a: 1, 'near-full': 1 });
    assert.equal(runTarget(mice, from, doors), 'mid-empty');
    const twins = [from, door('y', 1, 10), door('x', -1, 10)];
    assert.equal(runTarget(mice, from, twins), 'x');
  });

  it('spreads a crowded house’s mice over every house rather than one neighbour', () => {
    const doors = ['a', 'b', 'c', 'd', 'e'].map((id, index) =>
      door(id, index * 0.3, 10),
    );
    let mice = miceOf({ a: 5 });
    const [crowded] = doors;
    assert.ok(crowded);
    for (let run = 0; run < 4; run++) {
      const to = runTarget(mice, crowded, doors);
      assert.ok(to !== undefined);
      mice = moved(mice, 'a', to);
    }
    assert.deepEqual(
      doors.map(({ id }) => miceAt(mice, id)),
      [1, 1, 1, 1, 1],
    );
  });
});

describe('caller', () => {
  it('calls from the fullest house in reach, then the nearest, never an empty one', () => {
    const to = door('home', 0, 10);
    const doors = [
      to,
      door('one', 0.2, 10),
      door('two', 1, 10),
      door('two-far', 2, 10),
      door('three-out', RUN_REACH + 1, 10),
    ];
    const mice = miceOf({ one: 1, two: 2, 'two-far': 2, 'three-out': 3 });
    assert.equal(caller(mice, to, doors), 'two');
    assert.equal(caller(miceOf({}), to, doors), undefined);
  });
});

describe('answerTap', () => {
  const tapped = door('a', 0, 10);
  const other = door('b', 0.5, 10);

  it('runs a mouse home to a door in reach, else peeks', () => {
    assert.deepEqual(answerTap(miceOf({ a: 1 }), tapped, [tapped, other]), {
      answer: 'run',
      to: 'b',
    });
    assert.deepEqual(answerTap(miceOf({ a: 1 }), tapped, [tapped]), {
      answer: 'peek',
    });
  });

  it('calls a mouse to an empty door, else knocks', () => {
    assert.deepEqual(answerTap(miceOf({ b: 1 }), tapped, [tapped, other]), {
      answer: 'call',
      from: 'b',
    });
    assert.deepEqual(answerTap(miceOf({}), tapped, [tapped, other]), {
      answer: 'knock',
    });
  });
});

describe('runsOuting', () => {
  it('never runs from an empty house, always from a house of two', () => {
    for (let outing = 0; outing < 50; outing++) {
      assert.equal(runsOuting({ seed: 7 }, outing, 0), false);
      assert.equal(runsOuting({ seed: 7 }, outing, 2), true);
    }
  });

  it('runs about RUN_SHARE of a lone mouse’s outings, the same ones every time', () => {
    const outings = Array.from({ length: 2000 }, (_, outing) =>
      runsOuting({ seed: 12_345 }, outing, 1),
    );
    const share = outings.filter(Boolean).length / outings.length;
    assert.ok(Math.abs(share - RUN_SHARE) < 0.05, `share ${share}`);
    assert.deepEqual(
      outings.slice(0, 40),
      Array.from({ length: 40 }, (_, outing) =>
        runsOuting({ seed: 12_345 }, outing, 1),
      ),
    );
  });
});

describe('scattered', () => {
  it('sends every mouse to the emptiest doors in reach, one every FLEE_EVERY, the total kept', () => {
    const sinking = door('s', 0, 10);
    const doors = [sinking, door('a', 0.3, 10), door('b', 0.6, 10)];
    const mice = miceOf({ s: 3, a: 1, b: 0 });
    const { mice: after, fleeing } = scattered(mice, sinking, doors);
    assert.deepEqual(fleeing, [
      { to: 'b', wait: 0 },
      { to: 'a', wait: FLEE_EVERY },
      { to: 'b', wait: 2 * FLEE_EVERY },
    ]);
    assert.equal(miceAt(after, 's'), 0);
    assert.equal(miceHome(after) + fleeing.length, miceHome(mice));
  });

  it('counts a mouse in at once at the nearest door when it cannot run there in sight', () => {
    const sinking = door('s', 0, 10);
    const doors = [
      sinking,
      door('far-seen', RUN_REACH + 1, 10),
      door('far-hidden', RUN_REACH + 0.5, 10, true),
    ];
    const mice = miceOf({ s: 2 });
    const { mice: after, fleeing } = scattered(mice, sinking, doors);
    assert.deepEqual(fleeing, []);
    assert.equal(miceAt(after, 'far-hidden'), 2);
    assert.equal(miceHome(after), miceHome(mice));
  });

  it('runs to the nearest door drawn out of reach, both being in sight', () => {
    const sinking = door('s', 0, 10);
    const doors = [sinking, door('far', RUN_REACH + 1, 10)];
    const { fleeing } = scattered(miceOf({ s: 1 }), sinking, doors);
    assert.deepEqual(fleeing, [{ to: 'far', wait: 0 }]);
  });

  it('sinks its mice with it when no other door stands', () => {
    const sinking = door('s', 0, 10);
    const { mice, fleeing } = scattered(miceOf({ s: 2 }), sinking, [sinking]);
    assert.equal(miceHome(mice), 0);
    assert.deepEqual(fleeing, []);
  });
});

describe('retarget', () => {
  const at: Point = { x: 0, y: 10 };

  it('picks by emptiest then nearest from where the runner is', () => {
    const doors = [door('start', -2, 10), door('a', 0.5, 10), door('b', 1, 10)];
    assert.equal(retarget(miceOf({ a: 1 }), at, 'start', doors), 'b');
  });

  it('turns back to its start when nothing is in reach, else the nearest door', () => {
    const far = door('far', 10, 10);
    assert.equal(
      retarget(miceOf({}), at, 'start', [far, door('start', -9, 10)]),
      'start',
    );
    assert.equal(retarget(miceOf({}), at, 'start', [far]), 'far');
    assert.equal(retarget(miceOf({}), at, 'start', []), undefined);
  });
});

describe('emptiestNear', () => {
  it('takes no door out of sight', () => {
    const doors = [door('hidden', 0.1, 10, true)];
    assert.equal(emptiestNear(miceOf({}), { x: 0, y: 10 }, doors), undefined);
  });
});
