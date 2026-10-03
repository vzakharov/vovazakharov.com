import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from './geometry';
import { doorStations } from './house';
import {
  answerTap,
  caller,
  emptiestNear,
  endOf,
  entered,
  FLEE_EVERY,
  left,
  type Mice,
  miceAt,
  miceHome,
  moved,
  retarget,
  RUN_LEGS,
  RUN_PACE,
  RUN_REACH,
  RUN_SHARE,
  runAt,
  type RunCourse,
  type RunDoor,
  runDuration,
  type RunEnd,
  runnerAt,
  runsOuting,
  runTarget,
  scattered,
  widthAlong,
} from './mouse-run';
import { mushroomGenes } from './mushroom-genes';

const door = (id: string, x: number, y: number, hidden = false): RunDoor => ({
  id,
  foot: { x, y },
  seen: !hidden,
});
const miceOf = (counts: Record<string, number>): Mice =>
  new Map(Object.entries(counts));

const FRAME = 1 / 60;
const frames = (from: number, to: number) => {
  const out: number[] = [];
  for (let t = from; t < to; t += FRAME) out.push(t);
  return out;
};

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

const course = (
  runLength: number,
  extra: Partial<RunCourse> = {},
): RunCourse => ({
  runLength,
  opening: 'peek',
  calling: false,
  ...extra,
});

/** When each leg begins in `course`, read off `runAt`. */
function legStarts(of: RunCourse): Map<string, number> {
  const starts = new Map<string, number>();
  for (const t of frames(0, runDuration(of) + 0.2)) {
    const { leg } = runAt(t, of);
    if (!starts.has(leg)) starts.set(leg, t);
  }
  return starts;
}

/** Whether two times read off frames are the same to within a frame. */
const near = (a: number, b: number) => Math.abs(a - b) <= FRAME + 1e-9;

describe('runAt', () => {
  it('goes through every leg in order, a 0.25 run taking its length over RUN_PACE', () => {
    const short = course(0.25);
    const starts = legStarts(short);
    assert.deepEqual([...starts.keys()], RUN_LEGS);
    const at = (leg: string) => starts.get(leg) ?? Number.NaN;
    assert.ok(near(at('leave'), 0.85));
    assert.ok(near(at('run'), 1.1));
    assert.ok(near(at('enter') - at('run'), 0.25 / RUN_PACE));
    assert.ok(near(at('close') - at('enter'), 0.25));
    assert.ok(near(at('over'), runDuration(short)));
    assert.ok(
      near(runDuration(short), 0.85 + 0.25 + 0.25 / RUN_PACE + 0.25 + 0.3),
    );
  });

  it('never runs shorter than its least span', () => {
    const tiny = legStarts(course(0.01));
    assert.ok((tiny.get('enter') ?? 0) - (tiny.get('run') ?? 0) >= 0.4 - FRAME);
  });

  it('peeks from the start, out and its door open, then hops down with the door open', () => {
    const run = course(1);
    assert.equal(runAt(0, run).headOut, 0);
    assert.equal(runAt(0, run).fromOpen, 0);
    assert.ok(runAt(0.4, run).headOut > 0.99);
    assert.ok(runAt(0.4, run).fromOpen > 0.99);
    const leaving = runAt(0.9, run);
    assert.equal(leaving.leg, 'leave');
    assert.equal(leaving.headOut, 0);
    assert.equal(leaving.fromOpen, 1);
    assert.ok(leaving.runner);
    assert.ok(!runAt(0.5, run).runner);
  });

  it('lands in the target’s doorway with its door open, then shuts it, the runner gone', () => {
    const run = course(1);
    const starts = legStarts(run);
    const enter = starts.get('enter') ?? 0;
    const close = starts.get('close') ?? 0;
    assert.equal(runAt(enter + 0.01, run).toOpen, 1);
    assert.equal(runAt(enter + 0.01, run).progress, 1);
    assert.ok(!runAt(close + 0.01, run).runner);
    assert.ok(runAt(close + 0.01, run).toOpen > 0.9);
    assert.equal(runAt(runDuration(run), run).toOpen, 0);
    assert.equal(runAt(runDuration(run) + 5, run).leg, 'over');
  });

  it('moves nothing by more than a little between frames', () => {
    for (const run of [
      course(0.25),
      course(2.4),
      course(1, { opening: 'leave' }),
      course(1, { opening: 'run' }),
      course(1, { calling: true }),
    ]) {
      const span = frames(0, runDuration(run) + 0.1);
      for (const [index, t] of span.entries()) {
        const before = span[index - 1];
        if (before === undefined) continue;
        const [a, b] = [runAt(before, run), runAt(t, run)];
        // `headOut` is left out: at `leave` the head in the doorway hands
        // over to the runner on the sill, which `runner` shows at once.
        for (const key of ['progress', 'sill', 'fromOpen', 'toOpen'] as const) {
          assert.ok(Math.abs(a[key] - b[key]) < 0.2, `${key} at ${t}`);
        }
      }
    }
  });

  it('runs at an even pace mid-run, easing up to it and down from it', () => {
    const run = course(2.4);
    // Peek and hop down take 1.1 s; the run leg lasts its length over RUN_PACE.
    const [begin, end] = [1.1, 1.1 + 2.4 / RUN_PACE];
    const paceAt = (t: number) =>
      (runAt(t + 0.01, run).travelled - runAt(t - 0.01, run).travelled) / 0.02;
    const middle = paceAt((begin + end) / 2);
    assert.ok(middle >= RUN_PACE && middle < RUN_PACE * 1.05, `pace ${middle}`);
    assert.ok(Math.abs(paceAt(begin + 1) - middle) < 1e-9);
    assert.ok(paceAt(begin + 0.02) < middle / 2);
    assert.ok(paceAt(end - 0.02) < middle / 2);
    assert.ok(Math.abs(runAt(end - 1e-9, run).travelled - 2.4) < 1e-6);
  });

  it('opens with the hop down from a sinking house, and with the run itself when re-targeted', () => {
    const fleeing = course(1, { opening: 'leave' });
    assert.equal(runAt(0, fleeing).leg, 'leave');
    assert.equal(runAt(0, fleeing).fromOpen, 0);
    assert.ok(runAt(0.2, fleeing).fromOpen > 0.99);
    const turned = course(1, { opening: 'run' });
    assert.equal(runAt(0, turned).leg, 'run');
    assert.equal(runAt(0, turned).fromOpen, 0);
    assert.equal(runAt(0, turned).sill, 0);
  });

  it('holds a called door open from the start until the mouse is in', () => {
    const called = course(1, { calling: true });
    assert.ok(runAt(0.2, called).toOpen > 0.99);
    assert.ok(runAt(1.5, called).toOpen > 0.99);
    assert.equal(runAt(0.2, course(1)).toOpen, 0);
  });
});

describe('runnerAt', () => {
  const from: RunEnd = {
    front: { x: 0, y: 10 },
    across: 0.1,
    sillHeight: 0.02,
  };
  const to: RunEnd = { front: { x: 1, y: 11 }, across: 0.04, sillHeight: 0.05 };
  const run = course(Math.SQRT2);

  it('starts on its own sill at its own width and ends on the target’s at the target’s', () => {
    const start = legStarts(run).get('leave') ?? 0;
    const first = runnerAt(runAt(start, run), from, to);
    assert.deepEqual(first.point, from.front);
    assert.ok(Math.abs(first.up - from.sillHeight) < 1e-3);
    assert.equal(first.across, from.across);
    const end = runnerAt(runAt(runDuration(run) - 0.3 - 1e-6, run), from, to);
    assert.deepEqual(end.point, to.front);
    assert.equal(end.across, to.across);
    assert.ok(Math.abs(end.up - to.sillHeight) < 1e-3);
  });

  it('runs on the ground along the straight line, facing its target', () => {
    const moment = runAt(1.1 + Math.SQRT2 / RUN_PACE / 3, run);
    assert.equal(moment.leg, 'run');
    const runner = runnerAt(moment, from, to);
    assert.equal(runner.up, 0);
    assert.ok(moment.progress > 0.1 && moment.progress < 0.9);
    assert.ok(Math.abs(runner.point.x - moment.progress) < 1e-9);
    assert.ok(Math.abs(runner.point.y - 10 - moment.progress) < 1e-9);
    assert.ok(Math.abs(runner.heading.x - Math.SQRT1_2) < 1e-9);
    assert.ok(Math.abs(runner.heading.y - Math.SQRT1_2) < 1e-9);
    assert.equal(runner.across, widthAlong(from, to, moment.progress));
    assert.ok(runner.across < from.across && runner.across > to.across);
  });

  it('arcs over the line between sill and ground as it hops', () => {
    const start = legStarts(run).get('leave') ?? 0;
    const hop = runnerAt(runAt(start + 0.125, run), from, to);
    assert.ok(hop.up > from.sillHeight / 2);
  });
});

describe('endOf', () => {
  it('reads a door’s width and its sill’s height off its place, in the clump’s size', () => {
    const genes = mushroomGenes({ seed: 3, species: 'fly-agaric' });
    const [lowest] = doorStations(genes);
    assert.ok(lowest);
    const end = endOf({ x: 0, y: 9 }, lowest, 0.5);
    assert.equal(end.across, lowest.width * 0.5);
    assert.ok(end.sillHeight > 0);
    assert.ok(end.sillHeight < lowest.y * 0.5);
  });
});

describe('emptiestNear', () => {
  it('takes no door out of sight', () => {
    const doors = [door('hidden', 0.1, 10, true)];
    assert.equal(emptiestNear(miceOf({}), { x: 0, y: 10 }, doors), undefined);
  });
});
