import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Place } from './flight';
import {
  type Aloft,
  centreOf,
  type EyeFrame,
  FRAME_MARGIN,
  framedOf,
  levelWith,
  placeOf,
} from './flight-frame';
import { apartOf, placesFlying } from './flight-timing';
import { CLUMP_DISTANCE, SPREAD } from './ground';

/** A sideways tablet's frame in insect sizes of 40 px: 1180 px across, four screens to a turn. */
const UNIT = 40;
const NEAR = 0.58 * CLUMP_DISTANCE;
const frameAt = (heading: number): EyeFrame => ({
  x: 590 / UNIT,
  y: 300 / UNIT,
  focal: (4 * 1180 * SPREAD) / (2 * Math.PI) / UNIT,
  eye: { x: 0, y: 0, heading },
});

/** A flower `distance` from the eye at `azimuth`. */
const flower = (azimuth: number, distance: number): Aloft => ({
  x: distance * Math.sin(azimuth),
  y: distance * Math.cos(azimuth),
  h: 0.5,
});

const unposed = ({ x, y, fromEye }: Place): Place => ({ x, y, fromEye });

/** 0.4 of the way from `a` to `b`. */
const along = (a: number, b: number) => a + (b - a) * 0.4;

/**
 * The length the view draws the leg from `from` to `to` at, in insect sizes
 * at its own size: its chord framed at `centreOf`, each cut over its zoom,
 * `1 / forward` mixed straight along it, as `scripts/lib/veer-away.ts`
 * measures it.
 */
function drawnLength(frame: EyeFrame, from: Aloft, to: Aloft): number {
  const centre = centreOf(frame.eye, from, to);
  const [start, end] = [
    framedOf(frame, centre, from),
    framedOf(frame, centre, to),
  ];
  const cuts = 400;
  let length = 0;
  for (let cut = 0; cut < cuts; cut += 1) {
    const flown = (cut + 0.5) / cuts;
    const forward = 1 / ((1 - flown) / start.forward + flown / end.forward);
    length += (Math.hypot(end.x - start.x, end.y - start.y) * forward) / cuts;
  }
  return length / CLUMP_DISTANCE;
}

/** A leg past the margin: the eye's heading, its two ends, and how far off its drawn length timing each place alone comes out. */
const PAST: ReadonlyArray<
  readonly [string, number, Aloft, Aloft, (ratio: number) => boolean]
> = [
  [
    "bee-8's leg, an end behind the eye",
    1.833,
    flower(1.166, 11.7),
    flower(-1.115, 11.7),
    (ratio) => ratio > 1.5,
  ],
  [
    'both behind the eye on one side',
    0,
    flower(2.4, 10),
    flower(2.9, 14),
    (ratio) => ratio > 3,
  ],
  [
    'crossing behind the eye',
    0,
    flower(2.8, 10),
    flower(-2.6, 12),
    (ratio) => ratio < 0.5,
  ],
];

describe('a leg timed in the frame it is drawn in', () => {
  for (const [name, heading, from, to, wasOff] of PAST) {
    it(`times ${name} as long as it is drawn`, () => {
      const frame = frameAt(heading);
      const [here, there] = [
        placeOf(frame, NEAR, from),
        placeOf(frame, NEAR, to),
      ];
      const drawn = drawnLength(frame, from, to);
      const ratio = drawn / apartOf(here, there);
      assert.ok(Math.abs(ratio - 1) < 0.03, `drawn/timed ${ratio}`);
      // The case reproduces the class: placed one at a time, it is off.
      assert.ok(wasOff(drawn / apartOf(unposed(here), unposed(there))));
    });
  }

  it('times a leg within the margin exactly as each place alone does', () => {
    const frame = frameAt(0.4);
    const [here, there] = [
      placeOf(frame, NEAR, flower(0.9, 10)),
      placeOf(frame, NEAR, flower(-0.6, 3)),
    ];
    assert.ok(Math.abs(there.fromEye - NEAR) < 1e-12, 'the near one is kept');
    const timed = apartOf(unposed(here), unposed(there));
    assert.ok(Math.abs(apartOf(here, there) - timed) < 1e-9 * timed);
  });

  it('places a flier cut mid-leg on the leg as it is drawn', () => {
    const frame = frameAt(1.833);
    const [from, to] = [flower(1.166, 11.7), flower(-1.115, 11.7)];
    const places = {
      'flower a': placeOf(frame, NEAR, from),
      'flower b': placeOf(frame, NEAR, to),
    };
    const leg = {
      from: { kind: 'flower', id: 'a' },
      to: { kind: 'flower', id: 'b' },
      departs: 0,
      arrives: 1000,
    } as const;
    const at = placesFlying(places, leg, 400)?.['flower b'];
    assert.ok(at?.pose);
    // In the leg's frame it stands 0.4 of the way across, `1 / forward` mixed.
    const centre = centreOf(frame.eye, from, to);
    const framed = (aloft: Aloft) => framedOf(frame, centre, aloft);
    const [start, end, cut] = [framed(from), framed(to), framed(at.pose.aloft)];
    assert.ok(Math.abs(cut.x - along(start.x, end.x)) < 1e-9);
    assert.ok(Math.abs(cut.y - along(start.y, end.y)) < 1e-9);
    const forward = 1 / along(1 / start.forward, 1 / end.forward);
    assert.ok(Math.abs(cut.forward - forward) < 1e-9);
  });

  it('within the margin, places a flier cut mid-leg as each place alone does', () => {
    const frame = frameAt(0);
    const posed = {
      'flower a': placeOf(frame, NEAR, flower(0.5, 8)),
      'flower b': placeOf(frame, NEAR, flower(-0.7, 14)),
    };
    const leg = {
      from: { kind: 'flower', id: 'a' },
      to: { kind: 'flower', id: 'b' },
      departs: 0,
      arrives: 1000,
    } as const;
    const plain = Object.fromEntries(
      Object.entries(posed).map(([name, place]) => [name, unposed(place)]),
    );
    const [a, b] = [
      placesFlying(posed, leg, 300)?.['flower b'],
      placesFlying(plain, leg, 300)?.['flower b'],
    ];
    assert.ok(a && b);
    for (const key of ['x', 'y', 'fromEye'] as const) {
      assert.ok(Math.abs(a[key] - b[key]) < 1e-9, key);
    }
  });

  it('levels an away spot with a start behind the eye at the depth the leg leaves it', () => {
    const frame = frameAt(0);
    const behind = placeOf(frame, NEAR, flower(2.6, 9));
    const ahead = placeOf(frame, NEAR, flower(0.3, 12));
    const away = placeOf(frame, NEAR, flower(0.45, CLUMP_DISTANCE));
    assert.ok(FRAME_MARGIN < 2.6);
    // Behind the eye the forward along the heading is kept out at `NEAR`.
    assert.ok(Math.abs(levelWith(behind, away).fromEye - NEAR) < 1e-9);
    const level = levelWith(ahead, away);
    assert.ok(Math.abs(level.fromEye - ahead.fromEye) < 1e-9);
    assert.ok(Math.abs(level.x - away.x) < 1e-9);
    assert.ok(Math.abs(level.y - away.y) < 1e-9);
  });
});
