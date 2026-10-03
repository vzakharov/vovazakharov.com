import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { between, mulberry32 } from '../../model/random';
import { cloudBox } from './cloud-puffs';
import {
  cloudSpan,
  dropColumn,
  firstCrossing,
  GUSH_DROPS,
  gushToStart,
  lerpPoint,
  MOST_DROPS,
  shownFrom,
  STEADY_DROPS,
  steadyToStart,
  UNDER_CLOUD,
} from './rain-fall';
import { CLOUD_SPREAD } from './rain-sky';

const WIDTH = 1000;
const cloud = { x: 500, y: 80, r: 25 };
const span = cloudSpan(WIDTH, cloud);

describe('cloudSpan', () => {
  it('is the cloud drawn spread either side of its middle', () => {
    assert.deepEqual(span, [500 - CLOUD_SPREAD * 25, 500 + CLOUD_SPREAD * 25]);
  });

  it('is clipped to the screen', () => {
    assert.deepEqual(cloudSpan(WIDTH, { ...cloud, x: 20 }), [
      0,
      20 + CLOUD_SPREAD * 25,
    ]);
  });

  it('is none for a cloud off the screen or wholly past its edge', () => {
    assert.equal(cloudSpan(WIDTH, undefined), undefined);
    assert.equal(cloudSpan(WIDTH, { ...cloud, x: -200 }), undefined);
  });
});

function columns(under: typeof cloud | undefined): number[] {
  const random = mulberry32(7);
  return Array.from({ length: 4000 }, () => dropColumn(random, WIDTH, under));
}

function shareIn(xs: number[], [left, right]: [number, number]): number {
  return xs.filter((x) => x >= left && x <= right).length / xs.length;
}

describe('dropColumn', () => {
  it('stays on the screen', () => {
    for (const x of columns(cloud)) assert.ok(x >= 0 && x <= WIDTH);
  });

  it('falls densest under the tapped cloud: about half there, the rest anywhere', () => {
    assert.ok(span);
    const wide = (span[1] - span[0]) / WIDTH;
    const expected = UNDER_CLOUD + (1 - UNDER_CLOUD) * wide;
    assert.ok(Math.abs(shareIn(columns(cloud), span) - expected) < 0.03);
  });

  it('spreads evenly across the screen while the cloud is off it', () => {
    assert.ok(span);
    const wide = (span[1] - span[0]) / WIDTH;
    assert.ok(Math.abs(shareIn(columns(undefined), span) - wide) < 0.03);
  });
});

describe('shownFrom', () => {
  const SLANT = 0.22;
  const box = cloudBox(cloud);

  it('shows a drop under a cloud from its underside', () => {
    const to = { x: cloud.x + SLANT * (600 - box.bottom), y: 600 };
    assert.equal(shownFrom(to, 700, SLANT, [cloud]), 600 - box.bottom);
  });

  it('shows a drop clear of every cloud from where it starts', () => {
    assert.equal(shownFrom({ x: 50, y: 600 }, 700, SLANT, [cloud]), 700);
    assert.equal(shownFrom({ x: 500, y: 600 }, 700, SLANT, [undefined]), 700);
  });

  it('never shows a streak head inside a drawn cloud', () => {
    const random = mulberry32(11);
    const clouds = Array.from({ length: 4 }, () => ({
      x: random() * WIDTH,
      y: between(random, 30, 200),
      r: between(random, 15, 45),
    }));
    const boxes = clouds.map((each) => cloudBox(each));
    let under = 0;
    for (let drop = 0; drop < 2000; drop++) {
      const to = { x: random() * WIDTH, y: between(random, 250, 800) };
      const fall = to.y + between(random, 20, 500);
      const shown = shownFrom(to, fall, SLANT, clouds);
      if (shown < fall) under++;
      for (let step = 0; step <= 200; step++) {
        const up = (shown * step) / 200;
        const head = { x: to.x - SLANT * up, y: to.y - up };
        // A hair inside the box, so a head on its underside is not counted.
        for (const { left, right, top, bottom } of boxes) {
          const inside =
            head.x > left &&
            head.x < right &&
            head.y > top &&
            head.y < bottom - 1e-6;
          assert.ok(!inside, `a drop to ${String(to.x)} shows inside a cloud`);
        }
      }
    }
    assert.ok(under > 0);
  });
});

describe('steadyToStart', () => {
  it('fills a full downpour up to the steady count', () => {
    assert.equal(steadyToStart(1, { all: 0, gushed: 0 }), STEADY_DROPS);
    assert.equal(steadyToStart(1, { all: 90, gushed: 0 }), STEADY_DROPS - 90);
    assert.equal(steadyToStart(0.5, { all: 60, gushed: 0 }), 0);
  });

  it('does not count a gush against the steady rain', () => {
    const air = { all: STEADY_DROPS - 10 + GUSH_DROPS, gushed: GUSH_DROPS };
    assert.equal(steadyToStart(1, air), 10);
  });

  it('never takes the drops in the air past the most', () => {
    assert.equal(steadyToStart(1, { all: MOST_DROPS - 2, gushed: 40 }), 2);
    assert.equal(steadyToStart(1, { all: MOST_DROPS, gushed: 40 }), 0);
  });
});

describe('gushToStart', () => {
  it('adds the whole gush on top of a full downpour', () => {
    assert.equal(gushToStart(STEADY_DROPS), GUSH_DROPS);
  });

  it('is cut to the room left under the most', () => {
    assert.equal(gushToStart(MOST_DROPS - 5), 5);
    assert.equal(gushToStart(MOST_DROPS), 0);
  });
});

describe('firstCrossing', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it('is where a path falling onto the outline first meets its top', () => {
    const from = { x: 5, y: -10 };
    const to = { x: 5, y: 30 };
    const along = firstCrossing(square, from, to);
    assert.equal(along, 0.25);
    assert.deepEqual(lerpPoint(from, to, 0.25), { x: 5, y: 0 });
  });

  it('meets a slanted path where it enters, not where it leaves', () => {
    const along = firstCrossing(square, { x: 0, y: -5 }, { x: 10, y: 15 });
    assert.ok(along !== undefined);
    assert.deepEqual(lerpPoint({ x: 0, y: -5 }, { x: 10, y: 15 }, along), {
      x: 2.5,
      y: 0,
    });
  });

  it('is none for a path that passes the outline by or stops short of it', () => {
    assert.equal(
      firstCrossing(square, { x: 20, y: -10 }, { x: 20, y: 30 }),
      undefined,
    );
    assert.equal(
      firstCrossing(square, { x: 5, y: -10 }, { x: 5, y: -1 }),
      undefined,
    );
  });
});
