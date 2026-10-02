import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { flowerGenes } from '../../model/flower-genes';
import {
  SEEDED_SOUNDS,
  seedSounding,
  soundOf,
} from '../../model/flower-sounds';
import {
  type Box,
  boxAround,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import { geneBounds } from '../../model/mushroom-genes';
import { mulberry32 } from '../../model/random';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import {
  FLOWER_SWAY,
  type FlowerFoot,
  FLOWERS_APART,
  FOOT_CLEARANCE,
  groundOf,
  MOST_SHADED,
  standingOn,
  widestHead,
} from './flower-layout';
import { type StandingFlower, standingFlowers } from './flower-plots';
import { type Footing, type MeadowLayout, meadowLayout } from './layout';
import { standingControls } from './sky-layout';
import { EITHER_WAY, VIEWPORTS, VISITS } from './viewports';
import { type Opened, opened, relaidOn } from './visit-play';

/** The least number of seeded flowers the average visit keeps, on every screen. */
const LEAST_FLOWERS = 6.5;
/** How many points across a flower's head its share hidden is read at. */
const HEAD_STEPS = 9;
/** How near two ground points count as the same one, in the clump's size. */
const SAME_GROUND = 1e-9;

/** Each screen's layout for a visit that opened elsewhere, but for its flowers. */
const screenLayouts = new Map(
  EITHER_WAY.map(([name, width, height]) => [
    name,
    meadowLayout(width, height, 1),
  ]),
);

/**
 * Every visit opened on a screen `width` by `height` as the scene opens it,
 * opened once for every test of that screen that reads it; a screen's tests
 * run one after another, so only the latest screen's are kept.
 */
const openedOn = new Map<string, Opened[]>();
function visitsOn(width: number, height: number): Opened[] {
  const key = `${String(width)} ${String(height)}`;
  const known =
    openedOn.get(key) ??
    VISITS.map((seed) => opened(seed, width, height, false));
  openedOn.clear();
  openedOn.set(key, known);
  return known;
}

/** The visit's seeded bed on the ground, read back off the screen it opened on. */
function bedOf({ layout }: Opened): FlowerFoot[] {
  return layout.flowers.map((place) => groundOf(layout.camera, place));
}

/** Every head of `flower` as drawn: at rest, and leant either way by the breeze. */
function headsOf({ seed, place }: StandingFlower): Circle[] {
  const { stemBend, petalLength } = flowerGenes({ seed });
  return [-FLOWER_SWAY, 0, FLOWER_SWAY].map((sway) => ({
    x:
      place.x +
      stemBend * place.size * Math.cos(sway) +
      place.size * Math.sin(sway),
    y:
      place.y +
      stemBend * place.size * Math.sin(sway) -
      place.size * Math.cos(sway),
    r: petalLength * place.size,
  }));
}

/** Points evenly spread over `head`, as a grid its box holds. */
function headPoints({ x, y, r }: Circle): Point[] {
  const step = (2 * r) / HEAD_STEPS;
  return Array.from({ length: HEAD_STEPS ** 2 }, (_, index) => ({
    x: x - r + ((index % HEAD_STEPS) + 0.5) * step,
    y: y - r + (Math.floor(index / HEAD_STEPS) + 0.5) * step,
  })).filter((point) => Math.hypot(point.x - x, point.y - y) <= r);
}

/** Each control's circle as drawn, the pickers' included. */
const drawnControls = (layout: MeadowLayout): Circle[] => [
  ...standingControls(layout),
  ...layout.picker,
  ...layout.housePicker,
];

/** Whether `point` lies inside `box`, edges included. */
const inBox = ({ left, right, top, bottom }: Box, { x, y }: Point) =>
  x >= left && x <= right && y >= top && y <= bottom;

/**
 * How far `flower`'s stem and head keep off the foot `mushroom` on the
 * screen, as a share of the clearance a foot keeps round it: 1 or more is
 * clear.
 */
function footClearance(flower: Footing, mushroom: Footing): number {
  const nearestY = Math.min(
    flower.y,
    Math.max(flower.y - flower.size, mushroom.y),
  );
  return (
    Math.hypot(mushroom.x - flower.x, mushroom.y - nearestY) /
    (mushroom.size * FOOT_CLEARANCE + widestHead(flower).r)
  );
}

/** How far apart two flowers' heads stand on the screen, as a share of how far apart they must. */
function headsGap(a: Footing, b: Footing): number {
  const [p, q] = [widestHead(a), widestHead(b)];
  return Math.hypot(p.x - q.x, p.y - q.y) / (FLOWERS_APART * (p.r + q.r));
}

/** The flowers' sounds, sorted, so two beds compare as multisets. */
function sounds(flowers: readonly StandingFlower[]): string[] {
  return flowers
    .map((flower) => JSON.stringify(soundOf(flowerGenes(flower))))
    .toSorted();
}

describe('the seeded flowers', () => {
  it('sound each seeded sound once in each half of the world', () => {
    const every = sounds(
      SEEDED_SOUNDS.map((sound, index) => ({
        id: String(index),
        seed: seedSounding(mulberry32(index), sound),
        foot: { x: 0, z: 0, size: 0 },
        place: { x: 0, y: 0, size: 0 },
      })),
    );
    for (const [index, visit] of visitsOn(1180, 820).slice(0, 200).entries()) {
      const { layout, flowers, mushrooms } = visit;
      const standing = standingFlowers(layout, flowers, [], mushrooms, []);
      const at = `visit ${String(VISITS[index])}`;
      assert.deepEqual(
        sounds(standing.filter(({ foot }) => foot.x < 0)),
        every,
        `${at}, left half`,
      );
      assert.deepEqual(
        sounds(standing.filter(({ foot }) => foot.x >= 0)),
        every,
        `${at}, right half`,
      );
    }
  });

  for (const [name, width, height] of VIEWPORTS) {
    it(`stand on the same ground on every screen, by the visit, for a visit opened on a ${name} screen`, () => {
      const visits = visitsOn(width, height).slice(0, 40);
      let shown = 0;
      for (const [index, visit] of visits.entries()) {
        const seed = (VISITS[index] ?? 0) ^ 0xf1_0e_25;
        const bed = bedOf(visit);
        for (const [screen, across, down] of EITHER_WAY) {
          const there = meadowLayout(
            across,
            down,
            seed,
            visit.meadow.mushrooms,
          );
          assert.equal(there.flowers.length, bed.length);
          for (const [at, place] of there.flowers.entries()) {
            const foot = groundOf(there.camera, place);
            const own = bed[at];
            assert.ok(own);
            shown += 1;
            assert.ok(
              Math.abs(foot.x - own.x) < SAME_GROUND &&
                Math.abs(foot.z - own.z) < SAME_GROUND &&
                Math.abs(foot.size - own.size) < SAME_GROUND,
              `visit ${String(VISITS[index])}: flower ${String(at)} moved on the ground on a ${screen} screen`,
            );
          }
        }
      }
      assert.ok(shown > 0);
    });

    it(`differ from visit to visit, opened on a ${name} screen`, () => {
      const beds = visitsOn(width, height).map((visit) =>
        bedOf(visit)
          .map(({ x, z }) => `${x.toFixed(6)} ${z.toFixed(6)}`)
          .join(' '),
      );
      const alike = beds.length - new Set(beds).size;
      assert.equal(alike, 0, `${String(alike)} visits placed as another`);
    });

    it(`keep off the opening clump's feet and apart on every screen, opened on a ${name} screen`, (t) => {
      let least = Infinity;
      let nearest = Infinity;
      let placed = 0;
      for (const [index, visit] of visitsOn(width, height).entries()) {
        const bed = bedOf(visit);
        placed += bed.length;
        for (const [screen] of EITHER_WAY) {
          const there = screenLayouts.get(screen);
          assert.ok(there);
          const flowers = bed.map((foot) => standingOn(there.camera, foot));
          const feet = visit.mushrooms.flatMap(
            (mushroom) => placeIn(there.mushrooms, mushroom) ?? [],
          );
          for (const [at, flower] of flowers.entries()) {
            for (const foot of feet) {
              least = Math.min(least, footClearance(flower, foot));
            }
            for (const other of flowers.slice(at + 1)) {
              nearest = Math.min(nearest, headsGap(flower, other));
            }
          }
          assert.ok(
            least >= 1 && nearest >= 1,
            `visit ${String(VISITS[index])} on a ${screen} screen: clearance ${least.toFixed(3)}, heads ${nearest.toFixed(3)}`,
          );
        }
      }
      const perVisit = placed / VISITS.length;
      t.diagnostic(
        `least clearance off a foot ${least.toFixed(3)}, heads ${nearest.toFixed(3)} apart, ${perVisit.toFixed(2)} flowers a visit`,
      );
      // Moving flowers where they are seen must not leave the meadow bare.
      assert.ok(perVisit >= LEAST_FLOWERS, `${perVisit.toFixed(2)} a visit`);
    });

    it(`keep every head off every control, however the breeze leans it, on the ${name} screen the visit opens on`, (t) => {
      let nearest = Infinity;
      for (const [index, visit] of visitsOn(width, height).entries()) {
        const controls = drawnControls(visit.layout);
        for (const flower of standingFlowers(
          visit.layout,
          visit.flowers,
          [],
          visit.mushrooms,
          [],
        )) {
          for (const head of headsOf(flower)) {
            for (const control of controls) {
              const gap =
                Math.hypot(head.x - control.x, head.y - control.y) -
                control.r -
                head.r;
              nearest = Math.min(nearest, gap);
              assert.ok(
                gap >= 0,
                `visit ${String(VISITS[index])}: ${flower.id}'s head under a control`,
              );
            }
          }
        }
      }
      t.diagnostic(
        `nearest a head comes to a control: ${nearest.toFixed(1)} px`,
      );
    });

    it(`keep every head at least half in sight past the clump the visit opens with, on the ${name} screen it opens on`, (t) => {
      let most = 0;
      let behind = 0;
      let flowers = 0;
      for (const [index, visit] of visitsOn(width, height).entries()) {
        const clump = visit.meadow.mushrooms.flatMap((mushroom) => {
          const place = placeIn(visit.layout.mushrooms, mushroom);
          if (!place) return [];
          const drawn = standingAt(place, mushroom).drawn.map((outline) => ({
            outline,
            box: boxAround(outline),
          }));
          return [{ depth: place.y, drawn }];
        });
        const standing = standingFlowers(
          visit.layout,
          visit.flowers,
          [],
          visit.mushrooms,
          [],
        );
        flowers += standing.length;
        for (const flower of standing) {
          const nearer = clump
            .filter(({ depth }) => depth > flower.place.y)
            .flatMap(({ drawn }) => drawn);
          let hidden = 0;
          for (const head of headsOf(flower)) {
            const points = headPoints(head);
            const shaded = points.filter((point) =>
              nearer.some(
                ({ outline, box }) =>
                  inBox(box, point) && containsPoint(outline, point),
              ),
            ).length;
            hidden = Math.max(hidden, shaded / points.length);
          }
          most = Math.max(most, hidden);
          if (hidden > 0) behind += 1;
          assert.ok(
            hidden <= MOST_SHADED,
            `visit ${String(VISITS[index])}: ${flower.id} ${(hidden * 100).toFixed(0)}% hidden by the clump`,
          );
        }
      }
      t.diagnostic(
        `most of a head hidden ${(most * 100).toFixed(0)}%, ${((behind / flowers) * 100).toFixed(1)}% of flowers partly behind the clump`,
      );
    });

    it(`all stand in the world of the ${name} screen turned, where they stood`, () => {
      let flowers = 0;
      for (const [index, visit] of visitsOn(width, height).entries()) {
        const turned = relaidOn(visit, VISITS[index] ?? 0, height, width);
        const { world } = turned.camera;
        for (const foot of bedOf(visit)) {
          const { x, y, size } = standingOn(turned.camera, foot);
          const head = widestHead({ x, y, size });
          flowers += 1;
          assert.ok(
            head.x - head.r >= 0 && head.x + head.r <= world,
            `visit ${String(VISITS[index])}: a flower past the turned world's side`,
          );
          const back = groundOf(turned.camera, { x, y, size });
          assert.ok(
            Math.abs(back.x - foot.x) < SAME_GROUND &&
              Math.abs(back.z - foot.z) < SAME_GROUND,
            `visit ${String(VISITS[index])}: a flower moved on the ground`,
          );
        }
      }
      assert.ok(flowers > 0);
    });

    it(`keep every flower shorter than the clump's stems on a ${name} screen`, () => {
      const [visit] = visitsOn(width, height);
      assert.ok(visit);
      const { flowers, mushrooms } = visit.layout;
      const stem = Math.min(
        ...visit.mushrooms.flatMap((mushroom) => {
          const place = placeIn(mushrooms, mushroom);
          return place ? [place.size * geneBounds('stemHeight')[0]] : [];
        }),
      );
      assert.ok(flowers.length > 0);
      for (const flower of flowers) assert.ok(flower.size < stem);
    });
  }
});
