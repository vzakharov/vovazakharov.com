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
  OUTING_REACH,
  outingTarget,
  retarget,
  RUN_SHARE,
  type RunDoor,
  runsOuting,
  runTarget,
  scattered,
} from './mouse-run';
import { runAt, type RunCourse, type RunLeg } from './mouse-run-clock';

const door = (id: string, x: number, y: number, hidden = false): RunDoor => ({
  id,
  foot: { x, y },
  seen: !hidden,
});
const miceOf = (counts: Record<string, number>): Mice =>
  new Map(Object.entries(counts));

const course: RunCourse = {
  runLength: 0.5,
  bowSign: 1,
  opening: 'peek',
  calling: false,
};
/** The leg a run from a door at rest is in `elapsed` after it began. */
const legAt = (elapsed: number): RunLeg => runAt(elapsed, course).leg;
/** A run from b going in at a, in `leg`. */
const into = (leg: RunLeg) => [{ from: 'b', to: 'a', leg }];

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

  it('runs only to a door drawn now, however far, never its own', () => {
    const doors = [from, door('hidden', 0.5, 10, true)];
    assert.equal(runTarget(miceOf({ a: 1 }), from, doors), undefined);
    // Two houses grown at the screen's two sides, as `pickFoot` spreads them.
    const far = door('far', 15, 12);
    assert.equal(runTarget(miceOf({ a: 1 }), from, [...doors, far]), 'far');
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
  it('calls from the fullest house in sight, then the nearest, never an empty one', () => {
    const to = door('home', 0, 10);
    const doors = [
      to,
      door('one', 0.2, 10),
      door('two', 1, 10),
      door('two-far', 9, 10),
      door('three-hidden', 1, 10, true),
    ];
    const mice = miceOf({ one: 1, two: 2, 'two-far': 2, 'three-hidden': 3 });
    assert.equal(caller(mice, to, doors), 'two');
    assert.equal(caller(miceOf({}), to, doors), undefined);
  });
});

describe('answerTap', () => {
  const tapped = door('a', 0, 10);
  const other = door('b', 0.5, 10);

  it('runs a mouse home to a door in reach, else peeks', () => {
    assert.deepEqual(answerTap(miceOf({ a: 1 }), tapped, [tapped, other], []), {
      answer: 'run',
      to: 'b',
    });
    assert.deepEqual(answerTap(miceOf({ a: 1 }), tapped, [tapped], []), {
      answer: 'peek',
    });
  });

  it('calls a mouse to an empty door, else knocks', () => {
    assert.deepEqual(answerTap(miceOf({ b: 1 }), tapped, [tapped, other], []), {
      answer: 'call',
      from: 'b',
    });
    assert.deepEqual(answerTap(miceOf({}), tapped, [tapped, other], []), {
      answer: 'knock',
    });
  });
  it('squeaks a mouse peeking out to run, on a door tapped twice 0.2 s apart', () => {
    const doors = [tapped, other];
    assert.deepEqual(answerTap(miceOf({ a: 1 }), tapped, doors, []), {
      answer: 'run',
      to: 'b',
    });
    // The run takes its mouse off a's count as it begins, its head still in a's doorway.
    const runs = [{ from: 'a', to: 'b', leg: legAt(0.2) }];
    const squeak = { answer: 'squeak', run: 0 };
    // Not a second mouse called home from b, nor a knock with b empty.
    assert.deepEqual(answerTap(miceOf({ b: 1 }), tapped, doors, runs), squeak);
    assert.deepEqual(answerTap(miceOf({}), tapped, doors, runs), squeak);
  });

  it('squeaks a mouse going in at the door, until its door has shut', () => {
    for (const leg of ['enter', 'close'] as const) {
      assert.deepEqual(answerTap(miceOf({}), tapped, [tapped], into(leg)), {
        answer: 'squeak',
        run: 0,
      });
    }
    assert.deepEqual(answerTap(miceOf({}), tapped, [tapped], into('run')), {
      answer: 'knock',
    });
  });

  it('answers as ever once the mouse has left the doorway', () => {
    const away = [{ from: 'a', to: 'b', leg: legAt(1) }];
    assert.deepEqual(
      answerTap(miceOf({ b: 1 }), tapped, [tapped, other], away),
      { answer: 'call', from: 'b' },
    );
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

describe('reach', () => {
  // Two houses 8 apart, as `pickFoot` spreads a child's meadow; a house of
  // two runs every outing, so only the reach decides.
  const from = door('a', 0, 10);
  const far = door('far', 8, 10);
  const mice = miceOf({ a: 2 });

  it('runs a tapped mouse to a door in sight however far', () => {
    assert.deepEqual(answerTap(mice, from, [from, far], []), {
      answer: 'run',
      to: 'far',
    });
  });

  it('runs a dusk outing to a door in sight however far', () => {
    assert.equal(runTarget(mice, from, [from, far]), 'far');
  });

  it('keeps a house’s own outing to a door within OUTING_REACH', () => {
    for (let outing = 0; outing < 20; outing++) {
      assert.equal(
        outingTarget({ seed: 7 }, outing, mice, from, [from, far]),
        undefined,
      );
    }
    const near = door('near', OUTING_REACH, 10);
    assert.equal(
      outingTarget({ seed: 7 }, 0, mice, from, [from, far, near]),
      'near',
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
      door('far-hidden', 3, 10, true),
      door('farther-hidden', 5, 10, true),
    ];
    const mice = miceOf({ s: 2 });
    const { mice: after, fleeing } = scattered(mice, sinking, doors);
    assert.deepEqual(fleeing, []);
    assert.equal(miceAt(after, 'far-hidden'), 2);
    assert.equal(miceHome(after), miceHome(mice));
    const unseen = door('s', 0, 10, true);
    const seenDoor = door('seen', 1, 10);
    const counted = scattered(mice, unseen, [unseen, seenDoor]);
    assert.deepEqual(counted.fleeing, []);
    assert.equal(miceAt(counted.mice, 'seen'), 2);
  });

  it('runs to a door in sight however far, both being drawn', () => {
    const sinking = door('s', 0, 10);
    const doors = [sinking, door('far', 15, 12)];
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
    assert.deepEqual(retarget(miceOf({ a: 1 }), at, 'start', doors), {
      to: 'b',
      runs: true,
    });
  });

  it('runs to a door in sight however far, else turns back to its start, else counts it in at the nearest door', () => {
    assert.deepEqual(
      retarget(miceOf({}), at, 'start', [door('seen', 10, 10)]),
      {
        to: 'seen',
        runs: true,
      },
    );
    const far = door('far', 10, 10, true);
    assert.deepEqual(
      retarget(miceOf({}), at, 'start', [far, door('start', -9, 10, true)]),
      { to: 'start', runs: true },
    );
    assert.deepEqual(retarget(miceOf({}), at, 'start', [far]), {
      to: 'far',
      runs: false,
    });
    assert.equal(retarget(miceOf({}), at, 'start', []), undefined);
  });
});

describe('emptiestNear', () => {
  it('takes no door out of sight', () => {
    const doors = [door('hidden', 0.1, 10, true)];
    assert.equal(emptiestNear(miceOf({}), { x: 0, y: 10 }, doors), undefined);
  });
});
