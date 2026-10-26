import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { boxAround, placedAt, type Point } from '../../model/geometry';
import { type Eye, OPENING_EYE } from '../../model/ground';
import {
  MUSHROOM_SPECIES,
  mushroomGenes,
  type Species,
} from '../../model/mushroom-genes';
import { between, mulberry32, nextSeed } from '../../model/random';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import {
  drawnHolds,
  flowerTakes,
  type MushroomTarget,
  tappedMushroom,
} from './mushroom-tap';
import { TAP_RADIUS } from './tap-reach';
import { cull, ofGround, viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';
import { opened, tapTarget } from './visit-play';

/** Sizes a mushroom may be drawn at, px to its unit: from a speck to past any screen's clump. */
const SIZES = [3, 5, 8, 12, 16, 20, 25, 30, 40, 50, 60, 70, 80, 100, 130];
const SEEDS_PER = 12;
/** How many visits each screen grows to six, seen from each of `EYES`. */
const GROWN_VISITS = 10;
/** The eyes a grown meadow's taps are tried from: the opening one, and one stepped 3 units in. */
const EYES: ReadonlyArray<readonly [string, Eye]> = [
  ['the opening eye', OPENING_EYE],
  ['an eye stepped in', { ...OPENING_EYE, y: OPENING_EYE.y + 3 }],
];
/** Directions round a point a finger is tried in. */
const AROUND = Array.from({ length: 16 }, (_, index) => (index * Math.PI) / 8);
/** How far round a head's middle, in its head's half-width, fingers are tried. */
const REACHES = [0.25, 0.5, 1, 1.5, 2];

type Named = MushroomTarget & {
  name: string;
  foot: Point;
  turn: number;
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
  return { ...tapTarget(genes, size, foot, turn), name, foot, turn };
}

/** The middle of what is drawn of a mushroom's head, cap and gills, on screen, and half its width. */
function headOf({ area, foot, turn }: Named): Point & { half: number } {
  const { left, right, top, bottom } = boxAround([...area.cap, ...area.gills]);
  return {
    ...placedAt(foot, turn, { x: (left + right) / 2, y: (top + bottom) / 2 }),
    half: (right - left) / 2,
  };
}

const around = (middle: Point, r: number) =>
  AROUND.map((angle) => ({
    x: middle.x + r * Math.cos(angle),
    y: middle.y + r * Math.sin(angle),
  }));

/** Fingers round a mushroom's head, on it and past it. */
const fingersRound = (mushroom: Named) => {
  const head = headOf(mushroom);
  return REACHES.flatMap((reach) => around(head, reach * head.half));
};

const drawnOnScreen = (mushroom: Named, at: Point) =>
  drawnHolds(mushroom.area, mushroom.local(at));

describe('a mushroom’s tap area', () => {
  it('takes a tap only where it is drawn, however small it is drawn', () => {
    const random = mulberry32(17);
    for (const species of MUSHROOM_SPECIES) {
      let on = 0;
      let off = 0;
      for (const size of SIZES) {
        for (let index = 0; index < SEEDS_PER; index += 1) {
          const mushroom = standing(
            'one',
            species,
            nextSeed(random),
            size,
            { x: between(random, -50, 50), y: between(random, 200, 400) },
            between(random, -0.3, 0.3),
          );
          for (const finger of fingersRound(mushroom)) {
            const drawn = drawnOnScreen(mushroom, finger);
            if (drawn) on += 1;
            else off += 1;
            assert.equal(
              tappedMushroom(finger, [mushroom]) === mushroom,
              drawn,
              `a ${species} at ${String(size)} px`,
            );
          }
        }
      }
      assert.ok(on > 0 && off > 0, `${species}: left unmeasured`);
    }
  });

  it('never takes a tap on a bigger mushroom’s drawn body, in front of it or behind', () => {
    const random = mulberry32(29);
    for (const bigSpecies of MUSHROOM_SPECIES) {
      for (const smallSpecies of MUSHROOM_SPECIES) {
        let contested = 0;
        for (let index = 0; index < SEEDS_PER; index += 1) {
          const big = standing(
            'big',
            bigSpecies,
            nextSeed(random),
            between(random, 90, 130),
            { x: 0, y: 0 },
            between(random, -0.2, 0.2),
          );
          // Its foot somewhere over the big one's cap, so the fingers round
          // its head lie on the big one's drawn body.
          const { left, right, top, bottom } = boxAround(
            big.area.cap.map((point) => placedAt(big.foot, big.turn, point)),
          );
          const small = standing(
            'small',
            smallSpecies,
            nextSeed(random),
            between(random, 4, 20),
            {
              x: between(random, left, right),
              y: between(random, top, bottom),
            },
            between(random, -0.3, 0.3),
          );
          const fingers = around(headOf(small), TAP_RADIUS * random());
          for (const order of [
            [big, small],
            [small, big],
          ]) {
            const front = order.at(-1);
            for (const finger of fingers) {
              if (!drawnOnScreen(big, finger)) continue;
              const onSmall = drawnOnScreen(small, finger);
              const expected = onSmall && front === small ? 'small' : 'big';
              if (!onSmall) contested += 1;
              assert.equal(
                tappedMushroom(finger, order)?.name,
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
  });

  for (const [name, width, height] of VIEWPORTS) {
    for (const [seen, eye] of EYES) {
      it(`answers a tap on a meadow grown to six only where each mushroom is drawn, seen from ${seen} on a ${name} screen`, (t) => {
        let shown = 0;
        let taken = 0;
        for (const seed of VISITS.slice(0, GROWN_VISITS)) {
          const { layout, mushrooms } = opened(seed, width, height, true);
          const view = viewAt(layout.camera, eye);
          // Each as the bed stands it through the view: where it sees the
          // foot, drawn `zoom` times its laid-out size.
          const targets = mushrooms
            .flatMap((mushroom) => {
              const place = placeIn(layout.mushrooms, mushroom);
              if (!place) return [];
              const at = ofGround(view, mushroom.foot);
              if (cull(at)) return [];
              const { turn } = standingAt(place, mushroom);
              const { id, species, seed: own } = mushroom;
              const standsAt = (size: number, foot: Point) =>
                standing(id, species, own, size, foot, turn);
              const laid = standsAt(place.size, place);
              const { zoom, y: depth } = at;
              const drawn = standsAt(place.size * zoom, at);
              return [{ laid, drawn, zoom, depth }];
            })
            .toSorted((a, b) => a.depth - b.depth);
          shown += targets.length;
          const painted = targets.map(({ drawn }) => drawn);
          for (const { laid, drawn, zoom } of targets) {
            for (const finger of fingersRound(drawn)) {
              // The point under the finger on the mushroom as laid out.
              const back = {
                x: laid.foot.x + (finger.x - drawn.foot.x) / zoom,
                y: laid.foot.y + (finger.y - drawn.foot.y) / zoom,
              };
              const onIt = drawnOnScreen(laid, back);
              assert.equal(
                tappedMushroom(finger, [drawn]) === drawn,
                onIt,
                `visit ${String(seed)}: ${drawn.name}`,
              );
              const taker = tappedMushroom(finger, painted);
              if (taker === drawn) taken += 1;
              assert.ok(
                taker === undefined || drawnOnScreen(taker, finger),
                `visit ${String(seed)}: ${taker?.name ?? ''} took a tap off its body`,
              );
            }
          }
        }
        assert.ok(shown > 0, 'no mushroom in view');
        assert.ok(taken > 0, 'no tap taken');
        t.diagnostic(
          `${String(shown)} mushrooms in view, ${String(taken)} taps taken`,
        );
      });
    }
  }
});

describe('a flower’s tap', () => {
  const reach = { petals: 8, tap: TAP_RADIUS };
  it('takes its head whatever is drawn under it, and its reach past the head only off a drawn mushroom', () => {
    assert.equal(
      flowerTakes(7, reach, () => true),
      true,
    );
    assert.equal(
      flowerTakes(20, reach, () => false),
      true,
    );
    assert.equal(
      flowerTakes(20, reach, () => true),
      false,
    );
    assert.equal(
      flowerTakes(TAP_RADIUS + 1, reach, () => false),
      false,
    );
  });
});
