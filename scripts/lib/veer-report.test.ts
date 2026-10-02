import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PIVOT_SHARE } from '../../src/pages/mushrooms/model/insect-motion.ts';
import { dashPeak, pivotAllowance } from './veer-dash.ts';
import { DASH_SLACK, flicks } from './veer-report.ts';
import { FPS, type Sample } from './veer-watch.ts';

const BUTTERFLY = 40;
const WIDTH = 1000;
const LENS = { x: WIDTH / 2, y: 400, focal: 900, arc: 750 };
const frame = 1000 / FPS;

/**
 * Two frames of one fly on one leg, a `step` apart in CSS px at zoom 1, the
 * eye turning `turn` radians between them as a held key turns it.
 */
function fly(step: number, lifted: number | null, turn = 0): Sample[] {
  const at = (index: number): Sample => ({
    frame: index,
    now: index * frame,
    heading: index * turn,
    eyeX: 0,
    eyeY: 0,
    id: 'fly-1',
    kind: 'fly',
    legs: 1,
    from: 'cap',
    to: 'cap',
    departs: 0,
    arrives: 1000,
    visible: true,
    x: index * step,
    y: 100,
    zoom: 1,
    span: 30,
    flown: 0.5,
    lifted,
    distance: 1,
    out: false,
    seat: null,
  });
  return [at(0), at(1)];
}

/** The fly's own-size bound's failure from `flicks` over `samples`, `undefined` when it holds. */
function flyOver(samples: readonly Sample[]): string | undefined {
  const failed: string[] = [];
  const noted: string[] = [];
  flicks(
    samples,
    LENS,
    WIDTH,
    BUTTERFLY,
    (holds, message) => {
      if (!holds) failed.push(message);
    },
    (line) => {
      noted.push(line);
    },
  );
  return failed.find((message) =>
    /fly one-frame steps over .* own size/.test(message),
  );
}

describe('pivotAllowance', () => {
  it('keeps the curve for a leg that set off at once or was never steered', () => {
    assert.equal(pivotAllowance(0), 1);
    assert.equal(pivotAllowance(null), 1);
  });

  it('allows a pivoted leg what its pivot leaves of its time, either way round', () => {
    assert.equal(pivotAllowance(-Math.PI), 1 / (1 - PIVOT_SHARE));
    assert.equal(pivotAllowance(Math.PI / 2), 1 / (1 - PIVOT_SHARE / 2));
    assert.equal(pivotAllowance(0.4), pivotAllowance(-0.4));
  });

  it('allows a pivot the long way round past a half turn its own time', () => {
    const long = Math.PI + 0.3;
    assert.equal(
      pivotAllowance(long),
      1 / (1 - (PIVOT_SHARE * long) / Math.PI),
    );
    assert.ok(pivotAllowance(long) > pivotAllowance(Math.PI));
  });
});

describe('flicks, a fly over its dash curve', () => {
  const curve = (dashPeak('fly') ?? 0) * BUTTERFLY * DASH_SLACK;
  // Past the bound a leg that set off at once has, inside a half turn's.
  const fast = curve * (1 + 1 / (1 - PIVOT_SHARE)) * 0.5;

  it('fails a leg that set off at once', () => {
    assert.notEqual(flyOver(fly(fast, 0)), undefined);
  });

  it('passes the same step on a leg its flier turned half round on its perch first', () => {
    assert.equal(flyOver(fly(fast, Math.PI)), undefined);
  });

  it('fails it on a leg that turned too little to take that long', () => {
    assert.notEqual(flyOver(fly(fast, 0.04)), undefined);
  });

  it('still fails a pivoted leg past what its pivot allows', () => {
    assert.notEqual(
      flyOver(fly(curve * pivotAllowance(1.2) + 1, 1.2)),
      undefined,
    );
  });
});

describe('flicks, the eye turning under a held key', () => {
  const curve = (dashPeak('fly') ?? 0) * BUTTERFLY * DASH_SLACK;
  // Turning left slides everything drawn right, the way the fly flies.
  const turn = -0.0124;
  const slide = -LENS.arc * turn;

  it('passes a fly within its curve that the slide carries past it', () => {
    assert.equal(flyOver(fly(curve - 1 + slide, 0, turn)), undefined);
  });

  it('still fails a fly past its curve once the slide is out', () => {
    assert.notEqual(flyOver(fly(curve + 1 + slide, 0, turn)), undefined);
  });
});
