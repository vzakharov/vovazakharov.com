import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { firstMeadow, MUSHROOM_SLOTS } from '../../model/game';
import {
  type Box,
  boxAround,
  type Circle,
  containsPoint,
  type Point,
  sample,
} from '../../model/geometry';
import {
  doorStations,
  FURNISHINGS,
  onStem,
  paintedDoor,
} from '../../model/house';
import { NARROWEST_STANDING } from '../../model/motion';
import {
  MUSHROOM_SPECIES,
  mushroomGenes,
  type MushroomSeed,
} from '../../model/mushroom-genes';
import { tapArea, toCanvas } from '../../model/mushroom-outline';
import { stemAt } from '../../model/mushroom-pose';
import { mulberry32 } from '../../model/random';
import { hiddenOf, partOf, sighted } from './cap-cover';
import { everyPlace, placeIn } from './clump-layout';
import { doorHitArea, MOUSE_HEAD_LEAST, mouseHead } from './door-reach';
import { standingAt } from './door-sight';
import { type MeadowLayout, meadowLayout, type Placement } from './layout';
import { standingControls, TAP_RADIUS, tapReach } from './sky-layout';
import { SUN_GLOW_REACH } from './sun-layout';
import { FLOOR_HELD, VIEWPORTS, VISITS } from './viewports';
import { capsSpan, opened } from './visit-play';

/** A screen's name, as the sweeps know it. */
type Screen = (typeof VIEWPORTS)[number][0];

/** Each control as its hit area, which the mute's small drawing reaches past. */
const reach = (circles: readonly Circle[]) =>
  circles.map((control) => ({ ...control, r: tapReach(control.r) }));
const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;
const onScreen = ({ x, y, r }: Circle, width: number, height: number) =>
  x - r >= 0 && x + r <= width && y - r >= 0 && y + r <= height;

/** How many points along a stem's drawn centreline a tap is tried at. */
const STEM_TRIES = 20;
/**
 * How much of the clump's back cap shows past the front one at the least:
 * the two cross, as in the drawing, but each reads as a cap of its own.
 */
const BACK_CAP_SHOWN = 0.45;
/** Every station a door may take, over a run of visits' mushrooms of every species. */
const DOOR_TRIES = VISITS.slice(0, 100).flatMap((seed) =>
  MUSHROOM_SPECIES.flatMap((species) =>
    doorStations(mushroomGenes({ seed, species })),
  ),
);
/** The visits whose opening clump the clump's sweeps stand. */
const CLUMPS = VISITS.slice(0, 500);

/**
 * The visits a screen grows toward six, spread over `VISITS`: every tenth,
 * and every twentieth on the small phone, whose visits grow slowest.
 */
const grownVisits = (name: Screen) =>
  VISITS.filter((_, index) => index % (name === 'small phone' ? 20 : 10) === 0);
/** The least share of visits reaching six mushrooms on every screen. */
const LEAST_FULL = 0.99;

/**
 * A mushroom as the scene stands it in `place`, with points along its stem
 * and its outlines as tapped, on screen.
 */
function standingWithTaps(place: Placement, seeded: MushroomSeed) {
  const standing = standingAt(place, seeded);
  const { genes, turn, placed, drawn } = standing;
  const tapped = Object.values(tapArea(genes, turn)).map((outline) =>
    placed(outline),
  );
  return {
    ...standing,
    stem: placed(sample(0.05, 0.95, STEM_TRIES - 1, (t) => stemAt(genes, t))),
    tapped,
    boxes: {
      drawn: drawn.map((outline) => boxAround(outline)),
      tapped: tapped.map((outline) => boxAround(outline)),
    },
  };
}

/** Each screen's layout for the first visit, laid out once for every sweep that reads it. */
const laidOut = new Map<string, MeadowLayout>();
function screenLayout(width: number, height: number): MeadowLayout {
  const key = `${String(width)} ${String(height)}`;
  const layout = laidOut.get(key) ?? meadowLayout(width, height, 1);
  laidOut.set(key, layout);
  return layout;
}

/**
 * The opening clump of the visit `seed` as the scene stands it on `layout`,
 * the front-most first.
 */
function clumpOf(seed: number, layout: MeadowLayout) {
  return firstMeadow(mulberry32(seed))
    .mushrooms.map((mushroom) => {
      const place = placeIn(layout.mushrooms, mushroom);
      assert.ok(place, `visit ${String(seed)}: ${mushroom.id} off the screen`);
      return {
        ...pick(mushroom, 'id', 'species'),
        ...standingWithTaps(place, mushroom),
      };
    })
    .toSorted((a, b) => b.depth - a.depth);
}

/** Whether `point` lies inside `box`, edges included. */
const inBox = ({ left, right, top, bottom }: Box, { x, y }: Point) =>
  x >= left && x <= right && y >= top && y <= bottom;

/** The front-most of `clump` whose outlines, as drawn or as tapped, hold `point`. */
function topmost(
  clump: ReturnType<typeof clumpOf>,
  point: Point,
  as: 'drawn' | 'tapped',
): string | undefined {
  return clump.find((mushroom) =>
    mushroom[as].some(
      (outline, index) =>
        inBox(mushroom.boxes[as][index] ?? boxAround(outline), point) &&
        containsPoint(outline, point),
    ),
  )?.id;
}

/** How wide the six caps of a tablet held sideways span, at the least, in the median visit, as a share of the screen's width. */
const LEAST_SPAN = 0.6;

describe('a meadow grown to six on a tablet held sideways', () => {
  it(`spans at least ${String(LEAST_SPAN * 100)}% of the screen's width with its caps in the median visit`, (t) => {
    const [, width, height] = VIEWPORTS[0];
    const spans = grownVisits('tablet').map((seed) =>
      capsSpan(opened(seed, width, height, true)),
    );
    const median =
      spans.toSorted((a, b) => a - b)[Math.floor(spans.length / 2)] ?? 0;
    t.diagnostic(`median span ${(median * 100).toFixed(0)}%`);
    assert.ok(
      median >= LEAST_SPAN,
      `median span ${(median * 100).toFixed(0)}%`,
    );
  });
});

describe('meadowLayout', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`grows six mushrooms in the share of visits it is held to on a ${name} screen`, (t) => {
      const visits = grownVisits(name);
      const full = visits.filter(
        (seed) =>
          opened(seed, width, height, true).mushrooms.length === MUSHROOM_SLOTS,
      ).length;
      t.diagnostic(
        `${String(full)} of ${String(visits.length)} visits reach six`,
      );
      assert.ok(
        full / visits.length >= LEAST_FULL,
        `${String(full)} of ${String(visits.length)} reach six`,
      );
    });

    it(`keeps the clump's back cap in view past the front one on a ${name} screen`, (t) => {
      const layout = screenLayout(width, height);
      let least = 1;
      for (const seed of CLUMPS) {
        const [front, back] = clumpOf(seed, layout);
        assert.ok(front && back);
        const shown =
          1 - hiddenOf(sighted(partOf(back, 'cap'), partOf(front, 'cap')));
        least = Math.min(least, shown);
        assert.ok(
          shown >= BACK_CAP_SHOWN,
          `visit ${String(seed)}: ${back.id}'s cap ${(shown * 100).toFixed(0)}% in view`,
        );
      }
      t.diagnostic(`least of a back cap in view: ${(least * 100).toFixed(1)}%`);
    });

    it(`hands a tap on either clump stem to the mushroom drawn there on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      for (const seed of CLUMPS) {
        const clump = clumpOf(seed, layout);
        // A tie would leave the one added later on top, which the sort
        // does not model.
        assert.notEqual(clump[0]?.depth, clump[1]?.depth);
        for (const { id, stem } of clump) {
          for (const point of stem) {
            assert.equal(
              topmost(clump, point, 'tapped'),
              topmost(clump, point, 'drawn'),
              `visit ${String(seed)}: ${id}'s stem at (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`,
            );
          }
        }
      }
    });

    it(`gives every door a finger's target round all of it on a ${name} screen`, () => {
      for (const { size } of everyPlace(
        screenLayout(width, height).mushrooms,
      )) {
        const canvas = toCanvas(size);
        for (const station of DOOR_TRIES) {
          const hit = doorHitArea(station, size);
          const { left, right, top, bottom } = boxAround(hit);
          assert.ok(
            Math.min(right - left, bottom - top) >= 2 * TAP_RADIUS - 1e-9,
            `a door at size ${size.toFixed(0)}`,
          );
          const door = paintedDoor(station.height / station.width);
          for (const point of door.map(onStem(station))) {
            assert.ok(containsPoint(hit, canvas(point)));
          }
        }
      }
    });

    it(`draws every mouse's head big enough to read, its mushroom at its narrowest, on a ${name} screen`, () => {
      for (const { size } of everyPlace(
        screenLayout(width, height).mushrooms,
      )) {
        for (const { width: door } of DOOR_TRIES) {
          const narrowest = mouseHead(door * size) * NARROWEST_STANDING;
          assert.ok(narrowest >= MOUSE_HEAD_LEAST - 1e-9);
        }
      }
    });

    it(`keeps the sun's glow on a ${name} screen`, () => {
      const { sun } = screenLayout(width, height);
      const glow = sun.r * SUN_GLOW_REACH;
      assert.ok(sun.x + glow <= width + 1e-9 && sun.y - glow >= -1e-9);
    });

    it(`keeps the forest's back rows smaller and hazier on a ${name} screen`, () => {
      const mushrooms = everyPlace(screenLayout(width, height).mushrooms);
      const [nearest] = mushrooms;
      assert.ok(nearest);
      for (const place of mushrooms) {
        if (place.y < nearest.y) continue;
        assert.equal(place.haze, 0);
      }
      const back = mushrooms.filter(({ haze }) => haze > 0);
      assert.ok(back.length >= 2);
      for (const place of back) assert.ok(place.size < nearest.size);
    });
  }
});

describe('the controls', () => {
  for (const [name, width, height] of [...VIEWPORTS, FLOOR_HELD]) {
    it(`gives every control a finger's reach, apart, on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      const { releases, yielding, picker, housePicker } = layout;
      assert.equal(picker.length, MUSHROOM_SPECIES.length);
      assert.equal(housePicker.length, FURNISHINGS.length);
      const standing = standingControls(layout);
      for (const { r } of [...standing.slice(1), ...picker, ...housePicker]) {
        assert.ok(r >= TAP_RADIUS);
      }
      // Only a screen with no room anywhere else has the fly and the bee
      // give way to an open picker.
      assert.equal(yielding, name === 'small phone' || name === FLOOR_HELD[0]);
      const given = yielding
        ? standing.filter(
            (each) => each !== releases.fly && each !== releases.bee,
          )
        : standing;
      // The two pickers share the top, never open together, so each is
      // held apart from the rest and from itself but not from the other.
      for (const open of [[], picker, housePicker]) {
        const controls = reach([
          ...(open.length > 0 ? given : standing),
          ...open,
        ]);
        for (const [index, control] of controls.entries()) {
          assert.ok(onScreen(control, width, height), `control ${index} off`);
          for (const other of controls.slice(index + 1)) {
            assert.ok(apart(control, other), `control ${index} overlaps`);
          }
        }
      }
    });
  }
});
