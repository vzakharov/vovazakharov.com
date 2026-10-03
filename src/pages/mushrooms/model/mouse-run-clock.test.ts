import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distanceBetween, type Point } from './geometry';
import { doorStations } from './house';
import {
  courseOf,
  endOf,
  hop,
  pathBetween,
  RUN_LEAST,
  RUN_LEGS,
  RUN_PACE,
  runAt,
  type RunCourse,
  runDuration,
  type RunEnd,
  runnerAt,
  widthAlong,
} from './mouse-run-clock';
import {
  alongPath,
  pathLength,
  RUN_BOW,
  RUNNER_SPAN,
  type RunPath,
  sideOf,
} from './mouse-run-course';
import { mushroomGenes } from './mushroom-genes';

const FRAME = 1 / 60;
const frames = (from: number, to: number) => {
  const out: number[] = [];
  for (let t = from; t < to; t += FRAME) out.push(t);
  return out;
};

const course = (
  runLength: number,
  extra: Partial<RunCourse> = {},
): RunCourse => ({
  runLength,
  bowSign: 1,
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
  it('goes through every leg in order, a 2.4 run taking its length over RUN_PACE', () => {
    const short = course(2.4);
    const starts = legStarts(short);
    assert.deepEqual([...starts.keys()], RUN_LEGS);
    const at = (leg: string) => starts.get(leg) ?? Number.NaN;
    assert.ok(near(at('leave'), 0.85));
    assert.ok(near(at('run'), 1.1));
    assert.ok(near(at('enter') - at('run'), 2.4 / RUN_PACE));
    assert.ok(near(at('close') - at('enter'), 0.25));
    assert.ok(near(at('over'), runDuration(short)));
    assert.ok(
      near(runDuration(short), 0.85 + 0.25 + 2.4 / RUN_PACE + 0.25 + 0.3),
    );
  });

  it('never runs shorter than its least span', () => {
    const tiny = legStarts(course(0.01));
    assert.ok(
      (tiny.get('enter') ?? 0) - (tiny.get('run') ?? 0) >= RUN_LEAST - FRAME,
    );
  });

  it('runs a re-targeted course from the ground at its own length over RUN_PACE, under its least span', () => {
    const regrounded = legStarts(course(0.2, { opening: 'run' }));
    assert.ok(
      near(
        (regrounded.get('enter') ?? 0) - (regrounded.get('run') ?? 0),
        0.2 / RUN_PACE,
      ),
    );
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
    const run = course(4.8);
    // Peek and hop down take 1.1 s; the run leg lasts its length over RUN_PACE.
    const [begin, end] = [1.1, 1.1 + 4.8 / RUN_PACE];
    const paceAt = (t: number) =>
      (runAt(t + 0.01, run).travelled - runAt(t - 0.01, run).travelled) / 0.02;
    const middle = paceAt((begin + end) / 2);
    assert.ok(middle >= RUN_PACE && middle < RUN_PACE * 1.05, `pace ${middle}`);
    assert.ok(Math.abs(paceAt(begin + 1) - middle) < 1e-9);
    assert.ok(paceAt(begin + 0.02) < middle / 2);
    assert.ok(paceAt(end - 0.02) < middle / 2);
    assert.ok(Math.abs(runAt(end - 1e-9, run).travelled - 4.8) < 1e-6);
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
  const straight: RunPath = {
    from: from.front,
    bend: { x: 0.5, y: 10.5 },
    to: to.front,
  };
  const run = course(Math.SQRT2);

  it('starts on its own sill at its own width and ends on the target’s at the target’s', () => {
    const start = legStarts(run).get('leave') ?? 0;
    const first = runnerAt(runAt(start, run), from, to, straight);
    assert.deepEqual(first.point, from.front);
    assert.ok(Math.abs(first.up - from.sillHeight) < 1e-3);
    assert.equal(first.across, from.across);
    const end = runnerAt(
      runAt(runDuration(run) - 0.3 - 1e-6, run),
      from,
      to,
      straight,
    );
    assert.deepEqual(end.point, to.front);
    assert.equal(end.across, to.across);
    assert.ok(Math.abs(end.up - to.sillHeight) < 1e-3);
  });

  it('runs on the ground along its course, facing along it', () => {
    const moment = runAt(1.1 + Math.SQRT2 / RUN_PACE / 3, run);
    assert.equal(moment.leg, 'run');
    const runner = runnerAt(moment, from, to, straight);
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
    const hopping = runnerAt(runAt(start + 0.125, run), from, to, straight);
    assert.ok(hopping.up > from.sillHeight / 2);
  });
});

/** Where a course's curve is halfway along its own parameter: the middle its bow is held by. */
const middleOf = ({ from, bend, to }: RunPath) => ({
  x: (from.x + 2 * bend.x + to.x) / 4,
  y: (from.y + 2 * bend.y + to.y) / 4,
});

describe('pathBetween', () => {
  const eye = { x: 0, y: 0 };
  /** A door `across` wide whose stem stands at `foot`, its front 0.11 nearer the eye, as the opening clump's stands. */
  const doorAt = (foot: Point, across: number): RunEnd => {
    const off = distanceBetween(eye, foot);
    return {
      foot,
      front: { x: foot.x * (1 - 0.11 / off), y: foot.y * (1 - 0.11 / off) },
      across,
      sillHeight: 0.02,
    };
  };
  const reach = (from: RunEnd, to: RunEnd) =>
    Math.min(
      distanceBetween(eye, from.foot ?? from.front),
      distanceBetween(eye, to.foot ?? to.front),
    ) -
    RUN_BOW * RUNNER_SPAN * Math.max(from.across, to.across);

  it('runs its middle a drawn runner of the wider door nearer the eye than the nearer foot', () => {
    const back = doorAt({ x: -0.08, y: 10.4 }, 0.15);
    const front = doorAt({ x: 0.06, y: 10.1 }, 0.14);
    const aside = doorAt({ x: 1.2, y: 10.2 }, 0.1);
    // A run re-targeted from the ground: no stem, its foot its front.
    const ground: RunEnd = {
      front: { x: 0.5, y: 9.5 },
      across: 0.12,
      sillHeight: 0,
    };
    for (const [from, to] of [
      [back, front],
      [front, back],
      [front, aside],
      [ground, back],
    ] as const) {
      for (const side of [1, -1]) {
        const path = pathBetween(from, to, eye, side);
        const middle = distanceBetween(eye, middleOf(path));
        assert.ok(middle <= reach(from, to) + 1e-9, `${middle}`);
      }
    }
    // The bow is held to the foot, not the nearer front.
    const toFront = pathBetween(
      { ...back, foot: back.front },
      { ...front, foot: front.front },
      eye,
      1,
    );
    assert.ok(
      distanceBetween(eye, middleOf(toFront)) <
        distanceBetween(eye, middleOf(pathBetween(back, front, eye, 1))),
    );
  });

  it('bows the course between two ends toward the eye and faces the runner along it', () => {
    const from = doorAt({ x: -0.1, y: 10.1 }, 0.05);
    const to = doorAt({ x: 0.1, y: 9.7 }, 0.06);
    // Bowed out to the far side of its chord, still clear of the nearer foot.
    const path = pathBetween(from, to, eye, -sideOf(from.front, to.front, eye));
    assert.ok(distanceBetween(eye, middleOf(path)) <= reach(from, to) + 1e-9);
    const moment = runAt(1.1, course(1));
    const runner = runnerAt({ ...moment, progress: 0.2 }, from, to, path);
    assert.deepEqual(runner, {
      ...alongPath(path, 0.2),
      up: 0,
      across: widthAlong(from, to, 0.2),
    });
  });
});

describe('courseOf', () => {
  const eye = { x: 0, y: 0 };
  const door: RunEnd = {
    foot: { x: 0.1, y: 10.11 },
    front: { x: 0.1, y: 10 },
    across: 0.12,
    sillHeight: 0.02,
  };
  // A runner turned back a fifth of the clump's size from its new door.
  const ground: RunEnd = {
    front: { x: -0.1, y: 10 },
    across: 0.12,
    sillHeight: 0,
  };

  it('runs a course re-targeted from the ground straight, in under a second', () => {
    const path = courseOf(ground, door, eye, { bowSign: 1, opening: 'run' });
    assert.deepEqual(path.bend, { x: 0, y: 10 });
    const runLength = pathLength(path);
    assert.ok(Math.abs(runLength - 0.2) < 1e-9, `${runLength}`);
    assert.ok(runDuration(course(runLength, { opening: 'run' })) < 1);
  });

  it('bows a course from a door as pathBetween does', () => {
    for (const opening of ['peek', 'leave'] as const) {
      assert.deepEqual(
        courseOf(door, ground, eye, { bowSign: -1, opening }),
        pathBetween(door, ground, eye, -1),
      );
    }
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
    assert.equal(end.foot, undefined);
    const foot = { x: 0, y: 9.1 };
    assert.deepEqual(endOf({ x: 0, y: 9 }, lowest, 0.5, foot), {
      ...end,
      foot,
    });
  });
});

describe('hop', () => {
  it('jumps once from the ground and lands, nothing before the tap or after', () => {
    assert.equal(hop(-0.1), 0);
    assert.equal(hop(-Infinity), 0);
    assert.equal(hop(0), 0);
    assert.ok(hop(0.15) > 0.4);
    assert.ok(hop(0.05) < hop(0.15) && hop(0.25) < hop(0.15));
    assert.ok(hop(0.3 - 1e-9) < 1e-6);
    assert.equal(hop(0.3), 0);
    assert.equal(hop(Infinity), 0);
  });

  it('rises and falls by no more than a little between frames', () => {
    for (let t = 0; t < 0.4; t += FRAME) {
      assert.ok(Math.abs(hop(t + FRAME) - hop(t)) < 0.1, `at ${t}`);
    }
  });
});
