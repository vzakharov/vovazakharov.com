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
  MUSHROOM_SPECIES,
  mushroomGenes,
  type MushroomSeed,
  type Species,
} from '../../model/mushroom-genes';
import { capReach, tapArea, toCanvas } from '../../model/mushroom-outline';
import { splayed, stemAt } from '../../model/mushroom-pose';
import { mulberry32, nextSeed, pick } from '../../model/random';
import { everyPlace, placeIn } from './clump-layout';
import { doorHitArea, MOUSE_HEAD_LEAST, mouseHead } from './door-reach';
import { doorInSight, IN_SIGHT, sightOf, standingAt } from './door-sight';
import {
  EDGE_MARGIN,
  type MeadowLayout,
  meadowLayout,
  type Placement,
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
/** Every station a door may take, over a run of visits' mushrooms of every species. */
const DOOR_TRIES = VISITS.slice(0, 100).flatMap((seed) =>
  MUSHROOM_SPECIES.flatMap((species) =>
    doorStations(mushroomGenes({ seed, species })),
  ),
);

/** Every pair of species the clump can stand, back then front. */
const PAIRS = MUSHROOM_SPECIES.flatMap((back) =>
  MUSHROOM_SPECIES.map((front) => [back, front] as const),
);
const pairName = ([back, front]: readonly [Species, Species]) =>
  `${back} behind ${front}`;
const PAIR_NAMES = PAIRS.map((pair) => pairName(pair));
/** Each species in each slot, as the sweeps over every slot name them. */
const SPECIES_IN_SLOTS = MUSHROOM_SPECIES.flatMap((species) =>
  Array.from(
    { length: MUSHROOM_SLOTS },
    (_, slot) => `${species} in mushroom-${slot}`,
  ),
);

/**
 * The species standing in each slot on the `index`th visit, `seed`: the
 * clump's back and front take each of `PAIRS` in turn, so every pair stands
 * over a sixteenth of the visits (all sixteen on every visit would take
 * sixteen times as long), and each forest slot one drawn from the seed, so
 * over a run of visits it tries every species.
 */
function speciesOf(seed: number, index: number): (slot: number) => Species {
  const random = mulberry32(seed ^ 0x5b_d1_e9_95);
  const drawn = Array.from({ length: MUSHROOM_SLOTS }, () =>
    pick(random, MUSHROOM_SPECIES),
  );
  const [back, front] = PAIRS[index % PAIRS.length] ?? [];
  return (slot) =>
    (slot === 0 ? back : slot === 1 ? front : drawn[slot]) ?? 'fly-agaric';
}

/**
 * The worst of a measure over a sweep by each of `keys`, logged beside its
 * test for the record; a key the sweep never measured fails it.
 */
function worstOf(
  keys: readonly string[],
  worse: (a: number, b: number) => number,
): {
  note: (key: string, value: number) => void;
  report: (unit: string) => string;
} {
  const worst = new Map<string, number>();
  return {
    note: (key, value) => {
      const known = worst.get(key);
      worst.set(key, known === undefined ? value : worse(known, value));
    },
    report: (unit) => {
      assert.deepEqual(
        keys.filter((key) => !worst.has(key)),
        [],
        'left unmeasured',
      );
      return keys
        .map((key) => `${key} ${(worst.get(key) ?? 0).toFixed(1)}${unit}`)
        .join(', ');
    },
  };
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
 * The clump of the `index`th visit, `seed`, as the scene stands it, the
 * front-most first: the opening clump's seeds, each of the species
 * `speciesOf` stands in its slot, since whatever grows into a freed clump
 * slot grows from a seed like theirs.
 */
function clumpOf(seed: number, index: number, layout: MeadowLayout) {
  const species = speciesOf(seed, index);
  return firstMeadow(mulberry32(seed))
    .mushrooms.map(({ id, slot, seed: own }) => {
      const place = placeIn(layout.mushrooms, { slot, species: species(slot) });
      assert.ok(place);
      return {
        id,
        species: species(slot),
        ...standingWithTaps(place, { seed: own, species: species(slot) }),
      };
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

/** The opening clump of the `index`th visit, `seed`, on `layout` (`clumpOf`). */
function standingClump(seed: number, index: number, layout: MeadowLayout) {
  if (clumps.layout !== layout) clumps = { layout, bySeed: new Map() };
  const clump = clumps.bySeed.get(seed) ?? clumpOf(seed, index, layout);
  clumps.bySeed.set(seed, clump);
  return clump;
}

/** Every slot of the `index`th visit, `seed`, filled with a mushroom fresh-seeded from it, of the species `speciesOf` stands there. */
function standingForest(seed: number, index: number, layout: MeadowLayout) {
  const random = mulberry32(seed);
  const species = speciesOf(seed, index);
  return layout.mushrooms.map((places, slot) => ({
    species: species(slot),
    ...standingWithTaps(places[species(slot)], {
      seed: nextSeed(random),
      species: species(slot),
    }),
  }));
}

/** A standing mushroom's cap as the forest sweep reads it: its species, how near the front it stands, and the box round its cap and gills. */
type CapBox = { species: Species; depth: number; box: Box };

const capBoxesOf = (forest: ReturnType<typeof standingForest>): CapBox[] =>
  forest.map(({ species, depth, drawn: [dome = [], gills = []] }) => ({
    species,
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
function notedForest(seed: number, index: number, layout: MeadowLayout) {
  const forest = standingForest(seed, index, layout);
  if (forestCaps.layout !== layout) forestCaps = { layout, bySeed: new Map() };
  forestCaps.bySeed.set(seed, capBoxesOf(forest));
  return forest;
}

/** The caps of the forest `standingForest` stands for the `index`th visit, `seed`, on `layout`. */
function capsOfForest(
  seed: number,
  index: number,
  layout: MeadowLayout,
): CapBox[] {
  const noted =
    forestCaps.layout === layout ? forestCaps.bySeed.get(seed) : undefined;
  return noted ?? capBoxesOf(standingForest(seed, index, layout));
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
    it(`keeps every species' cap in every slot on a ${name} screen`, (t) => {
      const layout = screenLayout(width, height);
      assert.equal(layout.mushrooms.length, MUSHROOM_SLOTS);
      const margins = worstOf(SPECIES_IN_SLOTS, Math.min);
      for (const seed of VISITS) {
        const random = mulberry32(seed);
        for (const [slot, places] of layout.mushrooms.entries()) {
          const own = nextSeed(random);
          for (const species of MUSHROOM_SPECIES) {
            const place = places[species];
            const mushroom = { seed: own, species };
            const { genes, turn } = splayed(
              mushroomGenes(mushroom),
              place.splay,
            );
            const { left, right } = capReach(genes, turn);
            const margin = Math.min(
              place.x - left * place.size,
              width - place.x - right * place.size,
            );
            margins.note(`${species} in mushroom-${slot}`, margin);
            assert.ok(
              margin >= EDGE_MARGIN,
              `visit ${seed}: a ${species} in mushroom-${slot} past the edge`,
            );
          }
        }
      }
      t.diagnostic(`nearest the edge: ${margins.report(' px')}`);
    });

    it(`keeps the clump's back cap in view past the front one on a ${name} screen`, (t) => {
      const layout = screenLayout(width, height);
      const least = worstOf(PAIR_NAMES, Math.min);
      for (const [index, seed] of VISITS.entries()) {
        const [front, back] = standingClump(seed, index, layout);
        assert.ok(front && back);
        const [dome = [], gills = []] = back.drawn;
        const shown = shownPast([dome, gills], front.drawn.slice(0, 2));
        least.note(pairName([back.species, front.species]), shown * 100);
        if (shown < BACK_CAP_SHOWN)
          assert.fail(
            `visit ${seed}: ${back.id}'s ${back.species} cap ${(shown * 100).toFixed(0)}% in view behind a ${front.species}`,
          );
      }
      t.diagnostic(`least of a back cap in view: ${least.report('%')}`);
    });

    it(`hands a tap on either clump stem to the mushroom drawn there on a ${name} screen`, () => {
      const layout = screenLayout(width, height);
      for (const [index, seed] of VISITS.entries()) {
        const clump = standingClump(seed, index, layout);
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

    it(`keeps each clump door mostly in sight on a ${name} screen`, (t) => {
      const layout = screenLayout(width, height);
      const least = worstOf(PAIR_NAMES, Math.min);
      for (const [index, seed] of VISITS.entries()) {
        const clump = standingClump(seed, index, layout);
        const [front, back] = clump;
        assert.ok(front && back);
        for (const [depth, mushroom] of clump.entries()) {
          const sight = sightOf(
            mushroom,
            doorInSight(mushroom, clump),
            'doorway',
            clump.slice(0, depth),
          );
          if (mushroom === back)
            least.note(pairName([back.species, front.species]), sight * 100);
          if (sight < IN_SIGHT)
            assert.fail(
              `visit ${seed}: ${mushroom.id}'s ${mushroom.species} doorway ${(sight * 100).toFixed(0)}% in sight`,
            );
        }
      }
      t.diagnostic(`least of a back doorway in sight: ${least.report('%')}`);
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
          picker.map((button, index) => [`pick ${index}`, button]),
        ),
        ...Object.fromEntries(
          housePicker.map((button, index) => [`furnish ${index}`, button]),
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
      for (const [index, seed] of VISITS.entries()) {
        const forest = notedForest(seed, index, layout);
        for (const [slot, { tapped, boxes }] of forest.entries()) {
          for (const { control, ...circle } of controls) {
            for (const [part, outline] of tapped.entries()) {
              const box = boxes.tapped[part] ?? boxAround(outline);
              // No nearer to the outline than to the box round it.
              if (distanceToBox(box, circle) >= circle.r) continue;
              assert.ok(
                distanceTo(outline, circle) >= circle.r,
                `visit ${seed}: ${control} over mushroom-${slot}, a ${forest[slot]?.species}`,
              );
            }
          }
        }
      }
    });

    it(`keeps every forest cap mostly in view on a ${name} screen`, (t) => {
      const layout = screenLayout(width, height);
      const most = worstOf(MUSHROOM_SPECIES, Math.max);
      for (const [index, seed] of VISITS.entries()) {
        const caps = capsOfForest(seed, index, layout);
        for (const [slot, { species, depth, box }] of caps.entries()) {
          for (const [other, nearer] of caps.entries()) {
            // The clump's own two caps cross by design, as in the drawing.
            if (nearer.depth <= depth || (slot < 2 && other < 2)) continue;
            const hidden = coverOf(box, nearer.box);
            most.note(species, hidden * 100);
            assert.ok(
              hidden <= MOST_HIDDEN,
              `visit ${seed}: mushroom-${other}, a ${nearer.species}, hides ${(hidden * 100).toFixed(0)}% of mushroom-${slot}, a ${species}`,
            );
          }
        }
      }
      t.diagnostic(`most of a cap hidden: ${most.report('%')}`);
    });
  }
});
