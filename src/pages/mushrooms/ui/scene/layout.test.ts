import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
  CAP_KINDS,
  GENE_RANGES,
  mushroomGenes,
  type MushroomSeed,
} from '../../model/mushroom-genes';
import { tapArea, toCanvas } from '../../model/mushroom-outline';
import { capReach, splayed, stemAt } from '../../model/mushroom-pose';
import { mulberry32, nextSeed } from '../../model/random';
import { doorHitArea, MOUSE_HEAD_LEAST, mouseHead } from './door-reach';
import { doorInSight, IN_SIGHT, sightOf, standingAt } from './door-sight';
import {
  EDGE_MARGIN,
  FOOT_CLEARANCE,
  type MeadowLayout,
  meadowLayout,
} from './layout';
import { standingControls, TAP_RADIUS, tapReach } from './sky-layout';
import { SUN_GLOW_REACH, SUN_RAY_REACH } from './sun-layout';
import { VIEWPORTS, VISITS } from './viewports';

/** Each control as its hit area, which the mute's small drawing reaches past. */
const reach = (circles: readonly Circle[]) =>
  circles.map((control) => ({ ...control, r: tapReach(control.r) }));
const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;
const onScreen = ({ x, y, r }: Circle, width: number, height: number) =>
  x - r >= 0 && x + r <= width && y - r >= 0 && y + r <= height;

/** How many points along a stem's drawn centreline a tap is tried at. */
const STEM_TRIES = 20;
/** How much of a cap's bounding box a nearer mushroom's cap may hide. */
const MOST_HIDDEN = 0.25;
/**
 * How much of the clump's back cap shows past the front one at the least:
 * the two cross, as in the drawing, but each reads as a cap of its own.
 */
const BACK_CAP_SHOWN = 0.45;
/** How many points across a cap its share in view is read at. */
const CAP_STEPS = 16;
/** Every station a door may take, over a run of visits' mushrooms of every cap kind. */
const DOOR_TRIES = VISITS.slice(0, 100).flatMap((seed, index) =>
  doorStations(
    mushroomGenes({
      seed,
      cap: CAP_KINDS[index % CAP_KINDS.length] ?? 'spotted',
    }),
  ),
);

/**
 * A mushroom as the scene stands it in `place`, with points along its stem
 * and its outlines as tapped, on screen.
 */
function standingWithTaps(
  place: MeadowLayout['mushrooms'][number],
  seeded: MushroomSeed,
) {
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

/** The opening clump of a visit as the scene stands it, the front-most first. */
function clumpOf(seed: number, layout: MeadowLayout) {
  return firstMeadow(mulberry32(seed))
    .mushrooms.map(({ id, slot, ...seeded }) => {
      const place = layout.mushrooms[slot];
      assert.ok(place);
      return { id, ...standingWithTaps(place, seeded) };
    })
    .toSorted((a, b) => b.depth - a.depth);
}

/**
 * Each visit's clump on the screen the sweeps are on, stood once for every
 * test of that screen that reads it; a screen's tests run one after another,
 * so only the latest screen's are kept.
 */
let clumps: {
  layout: MeadowLayout;
  bySeed: Map<number, ReturnType<typeof clumpOf>>;
} = { layout: meadowLayout(1, 1, 1), bySeed: new Map() };

/** The opening clump of the visit `seed` on `layout` (`clumpOf`). */
function standingClump(seed: number, layout: MeadowLayout) {
  if (clumps.layout !== layout) clumps = { layout, bySeed: new Map() };
  const clump = clumps.bySeed.get(seed) ?? clumpOf(seed, layout);
  clumps.bySeed.set(seed, clump);
  return clump;
}

/**
 * Every slot filled with a mushroom fresh-seeded from `seed`, the cap kinds
 * turned by `turn` so that, over a run of visits, every slot tries each.
 */
function standingForest(seed: number, turn: number, layout: MeadowLayout) {
  const random = mulberry32(seed);
  return layout.mushrooms.map((place, slot) =>
    standingWithTaps(place, {
      seed: nextSeed(random),
      cap: CAP_KINDS[(turn + slot) % CAP_KINDS.length] ?? 'spotted',
    }),
  );
}

/** A standing mushroom's cap as the forest sweep reads it: how near the front it stands, and the box round its dome and gills. */
type CapBox = { depth: number; box: Box };

const capBoxesOf = (forest: ReturnType<typeof standingForest>): CapBox[] =>
  forest.map(({ depth, drawn: [dome = [], gills = []] }) => ({
    depth,
    box: boxAround([...dome, ...gills]),
  }));

/**
 * Each visit's forest caps on the screen the sweeps are on, noted as the
 * controls' sweep stands the forest, so the caps' sweep need not stand it
 * again; only the latest screen's are kept.
 */
let forestCaps: { layout: MeadowLayout; bySeed: Map<number, CapBox[]> } = {
  layout: meadowLayout(1, 1, 1),
  bySeed: new Map(),
};

/** `standingForest`, its caps noted for `capsOfForest`. */
function notedForest(seed: number, turn: number, layout: MeadowLayout) {
  const forest = standingForest(seed, turn, layout);
  if (forestCaps.layout !== layout) forestCaps = { layout, bySeed: new Map() };
  forestCaps.bySeed.set(seed, capBoxesOf(forest));
  return forest;
}

/** The caps of the forest `standingForest` stands for `seed` on `layout`. */
function capsOfForest(
  seed: number,
  turn: number,
  layout: MeadowLayout,
): CapBox[] {
  const noted =
    forestCaps.layout === layout ? forestCaps.bySeed.get(seed) : undefined;
  return noted ?? capBoxesOf(standingForest(seed, turn, layout));
}

/** How much of `box`'s area `over` covers. */
function coverOf(box: Box, over: Box): number {
  const across =
    Math.min(box.right, over.right) - Math.max(box.left, over.left);
  const down = Math.min(box.bottom, over.bottom) - Math.max(box.top, over.top);
  const area = (box.right - box.left) * (box.bottom - box.top);
  return (Math.max(0, across) * Math.max(0, down)) / area;
}

/** Whether `point` lies inside `box`, edges included. */
const inBox = ({ left, right, top, bottom }: Box, { x, y }: Point) =>
  x >= left && x <= right && y >= top && y <= bottom;

/** How far `point` is from `box`: 0 inside it, and never farther than from anything inside it. */
const distanceToBox = ({ left, right, top, bottom }: Box, { x, y }: Point) =>
  Math.hypot(
    Math.max(left - x, 0, x - right),
    Math.max(top - y, 0, y - bottom),
  );

/** How far `point` is from the closed `outline`: 0 inside it. */
function distanceTo(outline: readonly Point[], point: Point): number {
  if (containsPoint(outline, point)) return 0;
  return Math.min(
    ...outline.map((a, index) => {
      const b = outline[(index + 1) % outline.length] ?? a;
      const length = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
      const along =
        length === 0
          ? 0
          : ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) /
            length;
      const t = Math.min(1, Math.max(0, along));
      return Math.hypot(
        point.x - (a.x + t * (b.x - a.x)),
        point.y - (a.y + t * (b.y - a.y)),
      );
    }),
  );
}

/** How much of the area `outlines` hold together lies outside every one of `covers`. */
function shownPast(
  outlines: readonly Point[][],
  covers: readonly Point[][],
): number {
  const { left, right, top, bottom } = boxAround(outlines.flat());
  const boxed = covers.map((cover) => ({ cover, box: boxAround(cover) }));
  const step = (right - left) / CAP_STEPS;
  let inside = 0;
  let shown = 0;
  for (let x = left + step / 2; x < right; x += step) {
    for (let y = top + step / 2; y < bottom; y += step) {
      const point = { x, y };
      if (!outlines.some((outline) => containsPoint(outline, point))) continue;
      inside += 1;
      const covered = boxed.some(
        ({ cover, box }) => inBox(box, point) && containsPoint(cover, point),
      );
      if (!covered) shown += 1;
    }
  }
  return shown / inside;
}

/** The front-most of `clump` whose outlines, as drawn or as tapped, hold `point`. */
function topmost(
  clump: ReturnType<typeof standingClump>,
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

describe('meadowLayout', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps every cap in every slot on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      assert.equal(layout.mushrooms.length, MUSHROOM_SLOTS);
      for (const seed of VISITS) {
        const random = mulberry32(seed);
        for (const [slot, place] of layout.mushrooms.entries()) {
          const mushroom = {
            id: `mushroom-${slot}`,
            seed: nextSeed(random),
            cap: CAP_KINDS[slot % CAP_KINDS.length] ?? 'spotted',
          };
          const { genes, turn } = splayed(mushroomGenes(mushroom), place.splay);
          const { left, right } = capReach(genes, turn);
          assert.ok(
            place.x - left * place.size >= EDGE_MARGIN &&
              place.x + right * place.size <= width - EDGE_MARGIN,
            `visit ${seed}: ${mushroom.id} past the edge`,
          );
        }
      }
    });

    it(`keeps the clump's back cap in view past the front one on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      for (const seed of VISITS) {
        const [front, back] = standingClump(seed, layout);
        assert.ok(front && back);
        const [dome = [], gills = []] = back.drawn;
        const shown = shownPast([dome, gills], front.drawn.slice(0, 2));
        if (shown < BACK_CAP_SHOWN)
          assert.fail(
            `visit ${seed}: ${back.id}'s cap ${(shown * 100).toFixed(0)}% in view`,
          );
      }
    });

    it(`makes every slot's narrowest cap a finger's target on a ${name} screen`, () => {
      const { mushrooms } = screenLayout(width, height);
      for (const [slot, { size }] of mushrooms.entries()) {
        assert.ok(
          GENE_RANGES.capWidth[0] * size >= 2 * TAP_RADIUS - 1e-9,
          `mushroom-${slot} at size ${size.toFixed(0)}`,
        );
      }
    });

    it(`hands a tap on either clump stem to the mushroom drawn there on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      for (const seed of VISITS) {
        const clump = standingClump(seed, layout);
        // A tie would leave the one added later on top, which the sort
        // does not model.
        assert.notEqual(clump[0]?.depth, clump[1]?.depth);
        for (const { id, stem } of clump) {
          for (const point of stem) {
            assert.equal(
              topmost(clump, point, 'tapped'),
              topmost(clump, point, 'drawn'),
              `visit ${seed}: ${id}'s stem at (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`,
            );
          }
        }
      }
    });

    it(`keeps each clump door mostly in sight on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      for (const seed of VISITS) {
        const clump = standingClump(seed, layout);
        for (const [index, mushroom] of clump.entries()) {
          const sight = sightOf(
            mushroom,
            doorInSight(mushroom, clump),
            'doorway',
            clump.slice(0, index),
          );
          if (sight < IN_SIGHT)
            assert.fail(
              `visit ${seed}: ${mushroom.id}'s doorway ${(sight * 100).toFixed(0)}% in sight`,
            );
        }
      }
    });

    it(`gives every door a finger's target round all of it on a ${name} screen`, () => {
      for (const { size } of screenLayout(width, height).mushrooms) {
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
      for (const { size } of screenLayout(width, height).mushrooms) {
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

    it(`keeps every flower off every slot's foot on a ${name} screen`, () => {
      let placed = 0;
      for (const seed of VISITS) {
        const { flowers, mushrooms } = meadowLayout(width, height, seed);
        placed += flowers.length;
        for (const flower of flowers) {
          for (const mushroom of mushrooms) {
            const clear = mushroom.size * FOOT_CLEARANCE;
            for (const y of [flower.y, flower.y - flower.size]) {
              assert.ok(
                Math.hypot(flower.x - mushroom.x, y - mushroom.y) >= clear,
                `visit ${seed}: a flower on a mushroom's foot`,
              );
            }
          }
        }
      }
      // Moving flowers off the feet must not leave the meadow bare.
      assert.ok(placed / VISITS.length >= 4.5);
    });

    it(`keeps every flower shorter than the clump's stems on a ${name} screen`, () => {
      const { flowers, mushrooms } = screenLayout(width, height);
      const stem = Math.min(
        ...mushrooms
          .slice(0, 2)
          .map(({ size }) => size * GENE_RANGES.stemHeight[0]),
      );
      for (const flower of flowers) assert.ok(flower.size < stem);
    });

    it(`keeps the forest's back rows smaller and hazier on a ${name} screen`, () => {
      const { mushrooms } = screenLayout(width, height);
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

    it(`gives every control a finger's reach, apart, on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      const { releases, yielding, picker, housePicker } = layout;
      assert.equal(picker.length, CAP_KINDS.length);
      assert.equal(housePicker.length, FURNISHINGS.length);
      const standing = standingControls(layout);
      for (const { r } of [...standing.slice(1), ...picker, ...housePicker]) {
        assert.ok(r >= TAP_RADIUS);
      }
      // Only a screen with no room anywhere else has the fly and the bee
      // give way to an open picker.
      assert.equal(yielding, name === 'small phone');
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

    it(`keeps every control off every mushroom and the sun's rays on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      const { sun, mute, releases, plus, minus, house, picker, housePicker } =
        layout;
      // Each as its hit area, which the HUD's depth puts over the meadow.
      const controls = Object.entries({
        mute,
        ...releases,
        plus,
        minus,
        house,
        ...Object.fromEntries(
          picker.map((pick, index) => [`pick ${index}`, pick]),
        ),
        ...Object.fromEntries(
          housePicker.map((pick, index) => [`furnish ${index}`, pick]),
        ),
      }).map(([control, circle]) => ({
        control,
        ...circle,
        r: tapReach(circle.r),
      }));
      const rays = { ...sun, r: sun.r * SUN_RAY_REACH };
      for (const { control, ...circle } of controls) {
        assert.ok(apart(circle, rays), `${control} on the sun`);
      }
      for (const [turn, seed] of VISITS.entries()) {
        const forest = notedForest(seed, turn, layout);
        for (const [slot, { tapped, boxes }] of forest.entries()) {
          for (const { control, ...circle } of controls) {
            for (const [index, outline] of tapped.entries()) {
              const box = boxes.tapped[index] ?? boxAround(outline);
              // No nearer to the outline than to the box round it.
              if (distanceToBox(box, circle) >= circle.r) continue;
              assert.ok(
                distanceTo(outline, circle) >= circle.r,
                `visit ${seed}: ${control} over mushroom-${slot}`,
              );
            }
          }
        }
      }
    });

    it(`keeps every forest cap mostly in view on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      for (const [turn, seed] of VISITS.entries()) {
        const caps = capsOfForest(seed, turn, layout);
        for (const [slot, { depth, box }] of caps.entries()) {
          for (const [other, nearer] of caps.entries()) {
            // The clump's own two caps cross by design, as in the drawing.
            if (nearer.depth <= depth || (slot < 2 && other < 2)) continue;
            const hidden = coverOf(box, nearer.box);
            assert.ok(
              hidden <= MOST_HIDDEN,
              `visit ${seed}: mushroom-${other} hides ${(hidden * 100).toFixed(0)}% of mushroom-${slot}`,
            );
          }
        }
      }
    });

    it(`keeps the flowers where they were across a resize on a ${name} screen`, () => {
      const before = meadowLayout(width, height, 7).flowers;
      const after = meadowLayout(width * 1.25, height * 1.25, 7).flowers;
      assert.equal(after.length, before.length);
      for (const [index, flower] of before.entries()) {
        assert.ok(Math.abs((after[index]?.x ?? 0) / 1.25 - flower.x) < 1e-6);
      }
    });
  }
});
