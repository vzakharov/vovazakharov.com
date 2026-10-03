import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { MUSHROOM_SLOTS } from '../../model/crowding';
import { firstMeadow } from '../../model/game';
import {
  type Box,
  boxAround,
  type Circle,
  containsPoint,
  type Point,
  sample,
} from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
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
import { PICK_APART, PICK_CLEAR } from './picker-rows';
import { flowerPicker, shownOverPickers, standingControls } from './sky-layout';
import { SUN_GLOW_REACH, SUN_RAY_REACH } from './sun-layout';
import { TAP_RADIUS, tapReach } from './tap-reach';
import { viewAt } from './view';
import {
  FLOOR_HELD,
  type Screen,
  TURNED_SMALL,
  VIEWPORTS,
  VISITS,
} from './viewports';
import { capsSpan, opened } from './visit-play';

/** Each control as its hit area, which the mute's small drawing reaches past. */
const reach = (circles: readonly Circle[]) =>
  circles.map((control) => ({ ...control, r: tapReach(control.r) }));
const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;
/** Whether two buttons stand in one row: their reaches overlap up and down. */
const beside = (a: Circle, b: Circle) => Math.abs(a.y - b.y) < a.r + b.r;
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
 * The visits a screen grows a forest in, spread over `VISITS`: every tenth,
 * and every twentieth on the small phone, whose visits grow slowest.
 */
const grownVisits = (name: Screen) =>
  VISITS.filter((_, index) => index % (name === 'small phone' ? 20 : 10) === 0);
/** The least share of visits reaching each count of mushrooms on every screen. */
const LEAST_FULL = 0.99;
/** How many mushrooms the opening crop holds, grown `+` by `+`, in `LEAST_FULL` of visits. */
const CROP_HOLDS = 6;

/** How many mushrooms a forest grew, and how wide its caps span as a share of its screen's width. */
type Forest = { grown: number; span: number };
/** Each forest grown, by visit, screen and whether it grew on the opening crop, grown once for every sweep that reads it. */
const forests = new Map<string, Forest>();
function forestOf(
  seed: number,
  width: number,
  height: number,
  cropped: boolean,
): Forest {
  const key = `${String(seed)} ${String(width)} ${String(height)} ${String(cropped)}`;
  const known = forests.get(key);
  if (known) return known;
  const stand = opened(
    seed,
    width,
    height,
    true,
    cropped ? (layout) => viewAt(layout.camera, OPENING_EYE) : undefined,
  );
  const forest = { grown: stand.mushrooms.length, span: capsSpan(stand) };
  forests.set(key, forest);
  return forest;
}

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

/** How wide the caps of a tablet held sideways span, at the least, in the median visit, as a share of the screen's width. */
const LEAST_SPAN = 0.6;

describe('a meadow grown on the opening crop of a tablet held sideways', () => {
  it(`spans at least ${String(LEAST_SPAN * 100)}% of the screen's width with its caps in the median visit`, (t) => {
    const [, width, height] = VIEWPORTS[0];
    const spans = grownVisits('tablet').map(
      (seed) => forestOf(seed, width, height, true).span,
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
    it(`grows at least ${String(CROP_HOLDS)} mushrooms on the opening crop in the share of visits it is held to on a ${name} screen`, (t) => {
      const visits = grownVisits(name);
      const held = visits.filter(
        (seed) => forestOf(seed, width, height, true).grown >= CROP_HOLDS,
      ).length;
      t.diagnostic(
        `${String(held)} of ${String(visits.length)} visits reach ${String(CROP_HOLDS)}`,
      );
      assert.ok(
        held / visits.length >= LEAST_FULL,
        `${String(held)} of ${String(visits.length)} reach ${String(CROP_HOLDS)}`,
      );
    });

    it(`grows ${String(MUSHROOM_SLOTS)} mushrooms over the world in the share of visits it is held to on a ${name} screen`, (t) => {
      const visits = grownVisits(name);
      const full = visits.filter(
        (seed) => forestOf(seed, width, height, false).grown === MUSHROOM_SLOTS,
      ).length;
      t.diagnostic(
        `${String(full)} of ${String(visits.length)} visits reach ${String(MUSHROOM_SLOTS)}`,
      );
      assert.ok(
        full / visits.length >= LEAST_FULL,
        `${String(full)} of ${String(visits.length)} reach ${String(MUSHROOM_SLOTS)}`,
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
  for (const [name, width, height] of [
    ...VIEWPORTS,
    FLOOR_HELD,
    ...TURNED_SMALL,
  ]) {
    it(`gives every control and every picker's stage a finger's reach, apart, on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      const { yielding, picker, housePicker } = layout;
      const { colours, shapes, cross } = flowerPicker(layout);
      assert.equal(picker.length, MUSHROOM_SPECIES.length);
      assert.equal(housePicker.length, FURNISHINGS.length);
      const standing = standingControls(layout);
      // Open on a flower, the colours stand with the cross.
      const stages = {
        picker,
        housePicker,
        colours: [...colours, cross],
        shapes,
      };
      for (const { r } of [
        ...standing.slice(1),
        ...Object.values(stages).flat(),
      ]) {
        assert.ok(r >= TAP_RADIUS);
      }
      // Only a screen with no room anywhere else has buttons give way to an
      // open picker.
      assert.equal(
        yielding.length > 0,
        [
          'small phone',
          FLOOR_HELD[0],
          ...TURNED_SMALL.map(([turned]) => turned),
        ].includes(name),
      );
      const given = shownOverPickers(layout);
      const reached = reach(standing);
      for (const [index, control] of reached.entries()) {
        assert.ok(onScreen(control, width, height), `control ${index} off`);
        for (const other of reached.slice(index + 1)) {
          assert.ok(apart(control, other), `control ${index} overlaps`);
        }
      }
      // The pickers share the top, one open at a time, so each stage is held
      // apart from itself and clear of every button still standing, but not
      // from the others.
      for (const [stage, open] of Object.entries(stages)) {
        const buttons = reach(open);
        for (const [index, button] of buttons.entries()) {
          assert.ok(onScreen(button, width, height), `${stage} ${index} off`);
          for (const [at, other] of buttons.slice(index + 1).entries()) {
            assert.ok(
              apart(button, { ...other, r: other.r + PICK_CLEAR }),
              `${stage} ${String(index)} and ${String(index + 1 + at)} closer than PICK_CLEAR`,
            );
          }
          for (const other of reach(given)) {
            assert.ok(
              apart(button, { ...other, r: other.r + PICK_CLEAR }),
              `${stage} ${index} meets a control`,
            );
          }
        }
      }
      // The cross, shown only while picking, yields to the sun's rays.
      const { sun } = layout;
      assert.ok(
        apart(
          { ...cross, r: tapReach(cross.r) },
          { ...sun, r: sun.r * SUN_RAY_REACH },
        ),
        'the cross on the sun',
      );
    });

    // A screen with room for every button sets the four-button row apart
    // from the controls it shares the top row with; the five-button one
    // fills that row on a phone held sideways, which has it keep only
    // `PICK_CLEAR`.
    it(`sets the caps' and the shapes' row apart from the controls beside it on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      if (layout.yielding.length > 0) return;
      const given = reach(shownOverPickers(layout));
      for (const [index, button] of reach(
        flowerPicker(layout).shapes,
      ).entries()) {
        for (const other of given.filter((control) =>
          beside(button, control),
        )) {
          assert.ok(
            apart(button, { ...other, r: other.r + PICK_APART }),
            `shape ${String(index)} within PICK_APART of a control beside it`,
          );
        }
      }
    });
  }
});
