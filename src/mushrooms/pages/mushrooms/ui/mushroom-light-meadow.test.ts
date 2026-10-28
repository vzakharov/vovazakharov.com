import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { placedAt, type Point } from '@/mushrooms/shared/lib/geometry';
import { sunLight } from '@/mushrooms/shared/lib/light';
import { OPENING_EYE } from '@/mushrooms/shared/space';
import {
  flowerGenes,
  flowerHead,
  flowerLight,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  capOnCanvas,
  everyPlace,
  MUSHROOM_SPECIES,
  mushroomGenes,
  mushroomLights,
  type Placement,
  splayed,
  VIEWPORTS,
  VISITS,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import { capLight } from '@/mushrooms/entities/mushroom/index.test-only';

import { type MeadowLayout, meadowLayout } from './layout';
import { middleOf } from './mushroom-light.test-kit';

/**
 * Asserts that `at`, a light toward the sun seen facing a heading, stands
 * across by `sin(α − heading)`, `α` the sun's azimuth as `opening`, the light
 * at the opening heading, gives it — so none facing the sun — its height kept.
 */
function assertTurnsBy(
  opening: Point,
  at: (facing: number) => Point,
  what: string,
): void {
  const azimuth = Math.asin(opening.x);
  assert.ok(Math.abs(at(azimuth).x) < 1e-12, `${what} facing the sun`);
  for (const facing of [0.3, -1.2, Math.PI / 2, Math.PI, 5]) {
    const { x, y } = at(facing);
    assert.ok(Math.abs(x - Math.sin(azimuth - facing)) < 1e-12, what);
    assert.equal(y, opening.y, what);
  }
}

/** A unit vector from `from` to `to`. */
function heading(from: Point, to: Point): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

/**
 * How a mushroom of `seed` stands lit in `place`, on screen: which side of
 * its own axis its rim light, its shade and the sun stand (above 0 its right,
 * as it leans), how far off that axis the sun is, in radians, and how strong
 * its side shade is.
 */
function flanks(layout: MeadowLayout, place: Placement, seed: number) {
  const species =
    MUSHROOM_SPECIES[seed % MUSHROOM_SPECIES.length] ?? 'fly-agaric';
  const stood = splayed(mushroomGenes({ seed, species }), place.splay);
  const { genes, turn } = stood;
  const { body } = mushroomLights(sunLight(layout), stood, place, layout.sun);
  const onScreen = (point: Point) =>
    placedAt(place, turn, capOnCanvas(genes, place.size)(point));
  const middle = onScreen({ x: 0, y: genes.capHeight / 2 });
  const toSun = heading(middle, layout.sun);
  const up = { x: Math.sin(turn), y: -Math.cos(turn) };
  const sideOf = ({ x, y }: Point) => up.x * y - up.y * x;
  const layers = capLight(genes, body.toward);
  const arcSide = (kind: 'shade' | 'rim') => {
    const layer = layers.find((each) => each.kind === kind);
    assert.ok(layer?.kind === kind);
    return sideOf(
      heading(middle, middleOf(layer.arc.map((point) => onScreen(point)))),
    );
  };
  const shaded = layers.find((layer) => layer.kind === 'shade');
  assert.ok(shaded?.kind === 'shade');
  const { strength } = shaded;
  return {
    rim: arcSide('rim'),
    shade: arcSide('shade'),
    sun: sideOf(toSun),
    off: Math.acos(up.x * toSun.x + up.y * toSun.y),
    strength,
  };
}

describe('the meadow’s light', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, VISITS[0] ?? 0);
    const { sun, mushrooms } = layout;
    const flowers = layout.flowers.filter((foot) => foot !== undefined);

    it(`lights every mushroom on the side facing the sun, as strongly as it is sideways, on a ${name} screen`, () => {
      let overhead = 0;
      for (const [slot, place] of everyPlace(mushrooms).entries()) {
        for (let seed = 1; seed <= 40; seed++) {
          const {
            rim,
            shade,
            sun: sunSide,
            off,
            strength,
          } = flanks(layout, place, seed);
          const where = `place ${String(slot)}, seed ${String(seed)}`;
          if (off >= 0.1) {
            assert.ok(rim * sunSide > 0, `rim, ${where}`);
            assert.ok(shade * sunSide < 0, `shade, ${where}`);
          } else {
            // The sun straight up its own axis lights both flanks alike.
            overhead++;
            assert.ok(strength < 0.25, `overhead shade, ${where}`);
          }
        }
      }
      if (name === 'small phone') {
        assert.ok(overhead > 0, 'no mushroom under the sun');
      }
    });

    it(`lights every flower from the sun’s side, on a ${name} screen`, () => {
      const light = sunLight(layout);
      for (const [index, foot] of flowers.entries()) {
        const genes = flowerGenes({ seed: index * 31 + 7 });
        const { x, size } = foot;
        const across = sun.x - (x + flowerHead(genes, size).x);
        if (Math.abs(across) < size * 0.5) continue;
        const { toward } = flowerLight(light, genes, foot, sun);
        assert.ok(toward.x * across > 0, `flower ${String(index)}`);
      }
    });
  }
});

/** A fly agaric of `seed` stood as `place` splays it. */
const flyAgaricIn = (place: Placement, seed: number) =>
  splayed(mushroomGenes({ seed, species: 'fly-agaric' }), place.splay);

describe('the meadow’s light by heading', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, VISITS[0] ?? 0);
    const { sun, mushrooms } = layout;
    const flowers = layout.flowers.filter((foot) => foot !== undefined);
    const light = sunLight(layout);

    it(`lights every thing at the opening eye from the sun as seen where it stands, on a ${name} screen`, () => {
      for (const [slot, place] of everyPlace(mushrooms).entries()) {
        const lights = mushroomLights(
          light,
          flyAgaricIn(place, slot),
          place,
          sun,
        );
        assert.deepEqual(
          mushroomLights(
            light,
            flyAgaricIn(place, slot),
            place,
            sun,
            OPENING_EYE.heading,
          ),
          lights,
        );
        const length = Math.hypot(sun.x - place.x, sun.y - place.y);
        assert.deepEqual(lights.ground.toward, {
          x: (sun.x - place.x) / length,
          y: (sun.y - place.y) / length,
        });
      }
      for (const [index, foot] of flowers.entries()) {
        const genes = flowerGenes({ seed: index });
        const head = flowerHead(genes, foot.size);
        const [x, y] = [foot.x + head.x, foot.y + head.y];
        const length = Math.hypot(sun.x - x, sun.y - y);
        assert.deepEqual(flowerLight(light, genes, foot, sun).toward, {
          x: (sun.x - x) / length,
          y: (sun.y - y) / length,
        });
      }
    });

    it(`lights every thing from the other side with the eye turned round, on a ${name} screen`, () => {
      for (const [slot, place] of everyPlace(mushrooms).entries()) {
        const at = (facing: number) =>
          mushroomLights(light, flyAgaricIn(place, slot), place, sun, facing)
            .ground.toward;
        const [opening, round] = [at(OPENING_EYE.heading), at(Math.PI)];
        assert.ok(
          Math.abs(opening.x + round.x) < 1e-12,
          `place ${String(slot)}`,
        );
        assert.equal(round.y, opening.y);
      }
      for (const [index, foot] of flowers.entries()) {
        const genes = flowerGenes({ seed: index });
        const at = (facing: number) =>
          flowerLight(light, genes, foot, sun, facing).toward.x;
        assert.ok(Math.abs(at(0) + at(Math.PI)) < 1e-12);
      }
    });

    // The bed judges a mushroom's sun side drifted by turning its opening
    // ground light, and repaints it in the light of the new heading.
    it(`paints a mushroom's ground light across by the sun's azimuth off the heading, none facing the sun, on a ${name} screen`, () => {
      for (const [slot, place] of everyPlace(mushrooms).entries()) {
        const at = (facing: number) =>
          mushroomLights(light, flyAgaricIn(place, slot), place, sun, facing)
            .ground.toward;
        assertTurnsBy(at(OPENING_EYE.heading), at, `place ${String(slot)}`);
      }
    });

    // The flower bed keeps a flower's opening light and paints it turned by
    // the heading.
    it(`paints a flower's light across by the sun's azimuth off the heading, none facing the sun, on a ${name} screen`, () => {
      for (const [index, foot] of flowers.entries()) {
        const genes = flowerGenes({ seed: index });
        const at = (facing?: number) =>
          flowerLight(light, genes, foot, sun, facing).toward;
        assertTurnsBy(at(), at, `flower ${String(index)}`);
      }
    });
  }
});
