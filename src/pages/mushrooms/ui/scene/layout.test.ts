import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow, MUSHROOM_SLOTS } from '../../model/game';
import {
  type Circle,
  containsPoint,
  placedAt,
  type Point,
  sample,
} from '../../model/geometry';
import {
  CAP_KINDS,
  GENE_RANGES,
  mushroomGenes,
} from '../../model/mushroom-genes';
import {
  domeBand,
  gillsOutline,
  stemOutline,
  tapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { capFrame, capReach, splayed, stemAt } from '../../model/mushroom-pose';
import { mulberry32, nextSeed } from '../../model/random';
import {
  EDGE_MARGIN,
  FOOT_CLEARANCE,
  type MeadowLayout,
  meadowLayout,
} from './layout';
import { SUN_GLOW_REACH, TAP_RADIUS, tapReach } from './sky-layout';

const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;
const onScreen = ({ x, y, r }: Circle, width: number, height: number) =>
  x - r >= 0 && x + r <= width && y - r >= 0 && y + r <= height;

const VIEWPORTS = [
  ['tablet', 1180, 820],
  ['tablet portrait', 820, 1180],
  ['phone', 390, 844],
  ['phone held sideways', 844, 390],
  ['small phone', 320, 568],
  ['desktop', 1920, 1080],
] as const;
const VISITS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);
/** How many points along a stem's drawn centreline a tap is tried at. */
const STEM_TRIES = 20;
/** How much of a cap's bounding box a nearer mushroom's cap may hide. */
const MOST_HIDDEN = 0.25;

/**
 * A mushroom as the scene stands it in `place`: its depth, points along its
 * stem, and its outlines as drawn and as tapped, on screen.
 */
function standingAt(
  place: MeadowLayout['mushrooms'][number],
  seeded: Parameters<typeof mushroomGenes>[0],
) {
  const { genes, turn } = splayed(mushroomGenes(seeded), place.splay);
  const canvas = toCanvas(place.size);
  const placed = (outline: readonly Point[]) =>
    outline.map((point) => placedAt(place, turn, canvas(point)));
  const cap = capFrame(genes);
  return {
    // Where its foot stands, as the scene sets it.
    depth: place.y,
    stem: placed(sample(0.05, 0.95, STEM_TRIES - 1, (t) => stemAt(genes, t))),
    drawn: [
      placed(domeBand(genes, 0).map((point) => cap(point))),
      placed(gillsOutline(genes).map((point) => cap(point))),
      placed(stemOutline(genes)),
    ],
    tapped: Object.values(tapArea(genes)).map((outline) => placed(outline)),
  };
}

/** The opening clump of a visit as the scene stands it, the front-most first. */
function standingClump(seed: number, layout: MeadowLayout) {
  return firstMeadow(mulberry32(seed))
    .mushrooms.map(({ id, slot, ...seeded }) => {
      const place = layout.mushrooms[slot];
      assert.ok(place);
      return { id, ...standingAt(place, seeded) };
    })
    .toSorted((a, b) => b.depth - a.depth);
}

/**
 * Every slot filled with a mushroom fresh-seeded from `seed`, the cap kinds
 * turned by `turn` so that, over a run of visits, every slot tries each.
 */
function standingForest(seed: number, turn: number, layout: MeadowLayout) {
  const random = mulberry32(seed);
  return layout.mushrooms.map((place, slot) =>
    standingAt(place, {
      seed: nextSeed(random),
      cap: CAP_KINDS[(turn + slot) % CAP_KINDS.length] ?? 'spotted',
    }),
  );
}

type Box = Record<'left' | 'right' | 'top' | 'bottom', number>;

function boxAround(points: readonly Point[]): Box {
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

/** How much of `box`'s area `over` covers. */
function coverOf(box: Box, over: Box): number {
  const across =
    Math.min(box.right, over.right) - Math.max(box.left, over.left);
  const down = Math.min(box.bottom, over.bottom) - Math.max(box.top, over.top);
  const area = (box.right - box.left) * (box.bottom - box.top);
  return (Math.max(0, across) * Math.max(0, down)) / area;
}

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

/** The front-most of `clump` whose outlines, as drawn or as tapped, hold `point`. */
function topmost(
  clump: ReturnType<typeof standingClump>,
  point: Point,
  as: 'drawn' | 'tapped',
): string | undefined {
  return clump.find((mushroom) =>
    mushroom[as].some((outline) => containsPoint(outline, point)),
  )?.id;
}

describe('meadowLayout', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps every cap in every slot on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
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

    it(`makes every slot's narrowest cap a finger's target on a ${name} screen`, () => {
      const { mushrooms } = meadowLayout(width, height, 1);
      for (const [slot, { size }] of mushrooms.entries()) {
        assert.ok(
          GENE_RANGES.capWidth[0] * size >= 2 * TAP_RADIUS - 1e-9,
          `mushroom-${slot} at size ${size.toFixed(0)}`,
        );
      }
    });

    it(`hands a tap on either clump stem to the mushroom drawn there on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
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

    it(`keeps the sun's glow on a ${name} screen`, () => {
      const { sun } = meadowLayout(width, height, 1);
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
      const { flowers, mushrooms } = meadowLayout(width, height, 1);
      const stem = Math.min(
        ...mushrooms
          .slice(0, 2)
          .map(({ size }) => size * GENE_RANGES.stemHeight[0]),
      );
      for (const flower of flowers) assert.ok(flower.size < stem);
    });

    it(`keeps the forest's back rows smaller and hazier on a ${name} screen`, () => {
      const { mushrooms } = meadowLayout(width, height, 1);
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
      const { mute, plus, minus, picker } = meadowLayout(width, height, 1);
      assert.equal(picker.length, CAP_KINDS.length);
      for (const drawn of [plus, minus, ...picker]) {
        assert.ok(drawn.r >= TAP_RADIUS);
      }
      // Each as its hit area, which the mute's small drawing reaches past.
      const controls = [mute, plus, minus, ...picker].map((control) => ({
        ...control,
        r: tapReach(control.r),
      }));
      for (const [index, control] of controls.entries()) {
        assert.ok(onScreen(control, width, height), `control ${index} off`);
        for (const other of controls.slice(index + 1)) {
          assert.ok(apart(control, other), `control ${index} overlaps`);
        }
      }
    });

    it(`keeps every control off every mushroom and the sun on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      const { sun, mute, plus, minus, picker } = layout;
      // Each as its hit area, which the HUD's depth puts over the meadow.
      const controls = Object.entries({
        mute,
        plus,
        minus,
        ...Object.fromEntries(
          picker.map((pick, index) => [`pick ${index}`, pick]),
        ),
      }).map(([control, circle]) => ({
        control,
        ...circle,
        r: tapReach(circle.r),
      }));
      for (const { control, ...circle } of controls) {
        assert.ok(apart(circle, sun), `${control} on the sun`);
      }
      for (const [turn, seed] of VISITS.entries()) {
        const forest = standingForest(seed, turn, layout);
        for (const [slot, { tapped }] of forest.entries()) {
          for (const { control, ...circle } of controls) {
            for (const outline of tapped) {
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
      const layout = meadowLayout(width, height, 1);
      for (const [turn, seed] of VISITS.entries()) {
        const caps = standingForest(seed, turn, layout).map(
          ({ depth, drawn: [dome = [], gills = []] }) => ({
            depth,
            box: boxAround([...dome, ...gills]),
          }),
        );
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
