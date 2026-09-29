import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { boxAround, placedAt, type Point } from '../../model/geometry';
import {
  MUSHROOM_SPECIES,
  mushroomGenes,
  type Species,
} from '../../model/mushroom-genes';
import {
  capOutlines,
  type TapArea,
  tapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { between, mulberry32 } from '../../model/random';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import {
  drawnHolds,
  FINGER_ACROSS,
  fingerPad,
  HEAD_SHORTFALL,
  type MushroomTarget,
  tappedMushroom,
} from './mushroom-tap';
import { TAP_RADIUS } from './sky-layout';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** Sizes a mushroom may be drawn at, px to its unit: from a speck to past any screen's clump. */
const SIZES = [3, 5, 8, 12, 16, 20, 25, 30, 40, 50, 60, 70, 80, 100, 130];
const SEEDS_PER = 12;
/** How many visits each screen grows to six for its padded mushrooms. */
const GROWN_VISITS = 20;
/**
 * The screens whose meadows grown to six draw caps narrower than a finger:
 * every phone. A tablet's and a desktop's far rows draw their narrowest caps
 * no narrower than about one, and seldom stand a mushroom there.
 */
const PADDED_ON: ReadonlySet<string> = new Set([
  'phone',
  'phone held sideways',
  'small phone',
]);
/** Directions round a point a finger is tried in. */
const AROUND = Array.from({ length: 16 }, (_, index) => (index * Math.PI) / 8);

type Named = MushroomTarget & {
  name: string;
  foot: Point;
  turn: number;
  /** Its cap's width by its gene, in pixels. */
  capWidth: number;
};

/** A `species` mushroom drawn `size` px to its unit, standing at `foot` turned `turn`, as the bed fills its hit area. */
function standing(
  name: string,
  species: Species,
  seed: number,
  size: number,
  foot: Point,
  turn: number,
): Named {
  const genes = mushroomGenes({ seed, species });
  const canvas = toCanvas(size);
  const { cap, gills, stem } = tapArea(genes, turn);
  const area: TapArea = {
    cap: cap.map((point) => canvas(point)),
    gills: gills.map((point) => canvas(point)),
    stem: stem.map((point) => canvas(point)),
  };
  return {
    name,
    area,
    foot,
    turn,
    capWidth: genes.capWidth * size,
    local: ({ x, y }) =>
      placedAt({ x: 0, y: 0 }, -turn, { x: x - foot.x, y: y - foot.y }),
  };
}

/** The middle of what is drawn of a mushroom's head, cap and gills, on screen. */
function headMiddle({ area, foot, turn }: Named): Point {
  const { left, right, top, bottom } = boxAround([...area.cap, ...area.gills]);
  return placedAt(foot, turn, { x: (left + right) / 2, y: (top + bottom) / 2 });
}

/** How wide its head is drawn across, in its own canvas frame. */
function headAcross({ area }: Named): number {
  const { left, right } = boxAround([...area.cap, ...area.gills]);
  return right - left;
}

const around = (middle: Point, r: number) =>
  AROUND.map((angle) => ({
    x: middle.x + r * Math.cos(angle),
    y: middle.y + r * Math.sin(angle),
  }));

const drawnOnScreen = (mushroom: Named, at: Point) =>
  drawnHolds(mushroom.area, mushroom.local(at));

describe('a small mushroom’s tap area', () => {
  it('takes a tap `TAP_RADIUS` from its head’s middle once drawn smaller than a finger, and only what is drawn otherwise', (t) => {
    const random = mulberry32(17);
    const padded = new Map<Species, number>();
    const exact = new Map<Species, number>();
    for (const species of MUSHROOM_SPECIES) {
      for (const size of SIZES) {
        for (let index = 0; index < SEEDS_PER; index += 1) {
          const mushroom = standing(
            'one',
            species,
            Math.floor(random() * 2 ** 31),
            size,
            { x: between(random, -50, 50), y: between(random, 200, 400) },
            between(random, -0.3, 0.3),
          );
          // Narrower than a finger by its gene, drawn no wider than that;
          // or a finger wide by it, however much narrower it is drawn. The
          // sliver between is either.
          const fingerWide = 2 * TAP_RADIUS;
          const small = mushroom.capWidth < fingerWide * (1 - HEAD_SHORTFALL);
          if (!small && mushroom.capWidth < fingerWide) continue;
          const count = small ? padded : exact;
          count.set(species, (count.get(species) ?? 0) + 1);
          // Just inside a finger's circle round the head, so a pad a hair
          // under `TAP_RADIUS` fails it as surely as none.
          for (const finger of around(
            headMiddle(mushroom),
            TAP_RADIUS - 1e-6,
          )) {
            const landed = tappedMushroom(finger, [mushroom]) === mushroom;
            assert.equal(
              landed,
              small || drawnOnScreen(mushroom, finger),
              `a ${species} ${headAcross(mushroom).toFixed(1)} px across, at ${size} px`,
            );
          }
        }
      }
    }
    for (const species of MUSHROOM_SPECIES) {
      assert.ok((padded.get(species) ?? 0) > 0, `${species}: none padded`);
      assert.ok((exact.get(species) ?? 0) > 0, `${species}: none exact`);
    }
    t.diagnostic(
      `padded / exact: ${MUSHROOM_SPECIES.map((species) => `${species} ${padded.get(species)}/${exact.get(species)}`).join(', ')}`,
    );
  });

  it('draws every species’ head at most `HEAD_SHORTFALL` narrower than its cap’s gene', (t) => {
    const random = mulberry32(53);
    const least = new Map<Species, number>();
    for (const species of MUSHROOM_SPECIES) {
      for (let index = 0; index < 1500; index += 1) {
        const genes = mushroomGenes({
          seed: Math.floor(random() * 2 ** 31),
          species,
        });
        const { left, right } = boxAround(capOutlines(genes).flat());
        least.set(
          species,
          Math.min(
            least.get(species) ?? Infinity,
            (right - left) / genes.capWidth,
          ),
        );
      }
    }
    assert.equal(least.size, MUSHROOM_SPECIES.length);
    for (const [species, share] of least) {
      assert.ok(share >= 1 - HEAD_SHORTFALL, `a ${species} drawn ${share}`);
    }
    t.diagnostic(
      `least head drawn across, in its gene's width: ${[...least].map(([species, share]) => `${species} ${share.toFixed(4)}`).join(', ')}`,
    );
  });

  it('never takes a tap on a bigger mushroom’s drawn body, in front of it or behind', (t) => {
    const random = mulberry32(29);
    let stolen = 0;
    for (const bigSpecies of MUSHROOM_SPECIES) {
      for (const smallSpecies of MUSHROOM_SPECIES) {
        let contested = 0;
        for (let index = 0; index < SEEDS_PER; index += 1) {
          const big = standing(
            'big',
            bigSpecies,
            Math.floor(random() * 2 ** 31),
            between(random, 90, 130),
            { x: 0, y: 0 },
            between(random, -0.2, 0.2),
          );
          // Its foot somewhere over the big one's cap, so its pad lies on
          // the big one's drawn body.
          const { left, right, top, bottom } = boxAround(
            big.area.cap.map((point) => placedAt(big.foot, big.turn, point)),
          );
          const small = standing(
            'small',
            smallSpecies,
            Math.floor(random() * 2 ** 31),
            between(random, 4, 20),
            {
              x: between(random, left, right),
              y: between(random, top, bottom),
            },
            between(random, -0.3, 0.3),
          );
          const fingers = around(headMiddle(small), TAP_RADIUS * random());
          for (const order of [
            [big, small],
            [small, big],
          ]) {
            const front = order.at(-1);
            for (const finger of fingers) {
              if (!drawnOnScreen(big, finger)) continue;
              const onSmall = drawnOnScreen(small, finger);
              const landed = tappedMushroom(finger, order)?.name;
              const expected = onSmall && front === small ? 'small' : 'big';
              if (!onSmall) contested += 1;
              if (landed !== expected) stolen += 1;
              assert.equal(
                landed,
                expected,
                `${smallSpecies} over ${bigSpecies}`,
              );
            }
          }
        }
        assert.ok(
          contested > 0,
          `${smallSpecies} over ${bigSpecies}: left unmeasured`,
        );
      }
    }
    t.diagnostic(`taps on a big mushroom’s body a small one took: ${stolen}`);
  });

  for (const [name, width, height] of VIEWPORTS) {
    const pads = PADDED_ON.has(name);
    it(`pads ${pads ? 'the far caps' : 'any cap'} a meadow grown to six draws narrower than a finger, and takes a tap at the pad’s rim, on a ${name} screen`, (t) => {
      let grown = 0;
      let padded = 0;
      let rimsTaken = 0;
      for (const seed of VISITS.slice(0, GROWN_VISITS)) {
        const { layout, mushrooms } = opened(seed, width, height, true);
        const targets = mushrooms
          .flatMap((mushroom) => {
            const place = placeIn(layout.mushrooms, mushroom);
            if (!place) return [];
            const { turn } = standingAt(place, mushroom);
            return [
              standing(
                mushroom.id,
                mushroom.species,
                mushroom.seed,
                place.size,
                place,
                turn,
              ),
            ];
          })
          .toSorted((a, b) => a.foot.y - b.foot.y);
        grown += targets.length;
        for (const mushroom of targets) {
          if (!fingerPad(mushroom.area)) continue;
          padded += 1;
          assert.ok(headAcross(mushroom) < FINGER_ACROSS);
          const middle = headMiddle(mushroom);
          for (const finger of around(middle, TAP_RADIUS - 1e-6)) {
            assert.equal(tappedMushroom(finger, [mushroom]), mushroom);
            // Among the meadow, a mushroom drawn under the finger, or another
            // pad whose middle is nearer, takes it instead.
            const taken = tappedMushroom(finger, targets);
            if (taken === mushroom) {
              rimsTaken += 1;
              continue;
            }
            assert.ok(taken, `visit ${String(seed)}: ${mushroom.name} lost`);
            const nearer =
              Math.hypot(
                headMiddle(taken).x - finger.x,
                headMiddle(taken).y - finger.y,
              ) <= Math.hypot(middle.x - finger.x, middle.y - finger.y);
            assert.ok(
              drawnOnScreen(taken, finger) || nearer,
              `visit ${String(seed)}: ${taken.name} took ${mushroom.name}'s tap`,
            );
          }
        }
      }
      t.diagnostic(
        `${String(padded)} of ${String(grown)} grown mushrooms padded, ${String(rimsTaken)} taps at a pad's rim taken by it`,
      );
      if (!pads) return;
      assert.ok(padded > 0, 'no mushroom padded');
      assert.ok(rimsTaken > 0, 'no tap at a pad’s rim taken');
    });
  }
});
