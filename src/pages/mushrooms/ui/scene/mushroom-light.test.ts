import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import { placedAt, type Point } from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
import { sunLight } from '../../model/light';
import {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import {
  capOnCanvas,
  stemOutline,
  toCanvas,
} from '../../model/mushroom-outline';
import { splayed } from '../../model/mushroom-pose';
import { capSurface, CURVE_STEPS } from '../../model/mushroom-profile';
import { everyPlace } from './clump-layout';
import { luminance, mix, toHsv } from './colour';
import { type MeadowLayout, meadowLayout, type Placement } from './layout';
import {
  type CapLight,
  capLight,
  capRimArc,
  capShadeArc,
  capShine,
  flowerLight,
  mushroomLights,
  mushroomShadow,
  shadedHalf,
  STEM_LIGHT,
  type StemLayer,
  stemLight,
} from './mushroom-light';
import { PALETTE } from './palette';
import { VIEWPORTS, VISITS } from './viewports';

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

/** How far round the wheel a colour's hue stands from orange's. */
function towardOrange(colour: number): number {
  return Math.abs(toHsv(colour).h - 30 / 360);
}

/** The blue channel's share of the three. */
function blueness(colour: number): number {
  const [r, g, b] = [
    (colour >> 16) & 0xff,
    (colour >> 8) & 0xff,
    colour & 0xff,
  ];
  return b / (r + g + b);
}

const middleOf = (points: readonly Point[]) => ({
  x: points.reduce((sum, { x }) => sum + x, 0) / points.length,
  y: points.reduce((sum, { y }) => sum + y, 0) / points.length,
});

describe('a cap in the light', () => {
  const genes = mushroomGenes({ seed: 7, species: 'fly-agaric' });
  for (const [name, toward, side] of [
    ['from the right', { x: 0.8, y: -0.6 }, 1],
    ['from the left', { x: -0.8, y: -0.6 }, -1],
  ] as const) {
    it(`is shaded away from a light ${name}, and lit and shining toward it`, () => {
      assert.ok(middleOf(capShadeArc(genes, toward)).x * side < 0);
      assert.ok(middleOf(capRimArc(genes, toward)).x * side > 0);
      assert.ok(capShine(genes, toward).x * side > 0);
    });
  }

  it('shades a spot on the side away from the light', () => {
    const half = shadedHalf({ x: 0, y: 0 }, 1, { x: 1, y: 0 });
    assert.ok(middleOf(half).x < 0);
  });
});

describe('a chanterelle’s hollow top in the light', () => {
  const genes = mushroomGenes({ seed: 7, species: 'chanterelle' });
  assert.ok(genes.species === 'chanterelle');
  for (const [name, toward, side] of [
    ['from the right', { x: 0.8, y: -0.6 }, 1],
    ['from the left', { x: -0.8, y: -0.6 }, -1],
  ] as const) {
    it(`is shaded on the wall toward a light ${name}, and lit on the far one`, () => {
      const layers = capLight(genes, toward);
      const arc = (kind: CapLight['kind']) => {
        const layer = layers.find((each) => each.kind === kind);
        assert.ok(layer && 'arc' in layer, kind);
        return middleOf(layer.arc);
      };
      assert.ok(arc('dip-shade').x * side > 0);
      assert.ok(arc('dip-light').x * side < 0);
      // Outside the hollow the lip is lit as a dome's rim is.
      assert.ok(arc('rim').x * side > 0);
      assert.ok(arc('shade').x * side < 0);
      const shine = layers.find((layer) => layer.kind === 'shine');
      assert.ok(shine?.kind === 'shine' && shine.centre.x * side < 0);
      // Each lies along the lip's top, where the hollow is.
      for (const kind of ['dip-shade', 'dip-light'] as const) {
        const { x, y } = arc(kind);
        assert.ok(Math.abs(y - capSurface(genes, x)) < genes.lip * 0.5, kind);
      }
    });
  }
});

describe('the creatures’ light and shade', () => {
  it('lights a cap warmer than its red, and shades bluer than the old shade ink', () => {
    assert.ok(towardOrange(PALETTE.capLit) < towardOrange(PALETTE.capRed));
    assert.ok(blueness(PALETTE.shadeCool) > blueness(PALETTE.shadeInk));
  });

  it('keeps a spot white on its lit side', () => {
    assert.ok(luminance(PALETTE.spot) >= 0.9);
  });
});

describe('a stem in the light', () => {
  const over = (side: StemLayer[3], depth: number) => {
    let colour: number = PALETTE.stem;
    for (const [layer, alpha, reach, on] of STEM_LIGHT) {
      if (on === side && reach >= depth) colour = mix(colour, layer, alpha);
    }
    return colour;
  };
  const shade = STEM_LIGHT.filter((layer) => layer[3] === 'shade');

  it('shades softly, deepening toward its edge in steps too small to read as a band', () => {
    assert.ok(shade.length >= 4);
    for (const [, alpha] of shade) assert.ok(alpha <= 0.08);
    const depths = shade.map((layer) => layer[2]);
    assert.ok(
      depths.every(
        (depth, index) => index === 0 || depth < (depths[index - 1] ?? 0),
      ),
    );
    assert.ok(blueness(over('shade', 0)) > blueness(PALETTE.stem));
  });

  it('warms toward the sun and stays pale on both sides', () => {
    assert.ok(towardOrange(over('sun', 0.05)) < towardOrange(PALETTE.stem));
    for (const side of ['sun', 'shade'] as const) {
      assert.ok(luminance(over(side, 0)) >= 0.5, side);
    }
  });

  it('paints a far stem in fewer, more opaque layers that leave its edge as dark', () => {
    assert.deepEqual(stemLight(PALETTE.stemLit, CURVE_STEPS), STEM_LIGHT);
    for (const steps of [8, 14, 20]) {
      const far = stemLight(PALETTE.stemLit, steps);
      for (const side of ['sun', 'shade'] as const) {
        const [near, coarse] = [atEdge(STEM_LIGHT, side), atEdge(far, side)];
        assert.ok(coarse.count < near.count, `${steps} chords, ${side}`);
        assert.ok(coarse.count >= 2);
        assert.ok(Math.abs(coarse.opacity - near.opacity) < 1e-9);
        assert.deepEqual(coarse.span, near.span);
      }
    }
  });
});

/**
 * How many of `side`'s soft layers of stem light there are, how opaque they
 * stand together over its edge, and the depths they span (the rim line, at
 * over half opaque, left out).
 */
function atEdge(layers: readonly StemLayer[], side: StemLayer[3]) {
  const on = layers.filter((layer) => layer[3] === side && layer[1] < 0.5);
  const depths = on.map((layer) => layer[2]);
  return {
    count: on.length,
    opacity: 1 - on.reduce((clear, [, alpha]) => clear * (1 - alpha), 1),
    span: [Math.max(...depths), Math.min(...depths)],
  };
}

/** Whether `point` lies under `layer`, of the cap's layers the ones a point can be tested against. */
function covers(layer: CapLight, { x, y }: Point): boolean {
  if (layer.kind === 'spot') {
    const { spot } = layer;
    return Math.hypot(x - spot.x, y - spot.y) <= spot.r;
  }
  if (layer.kind !== 'shine') return false;
  const [rx, ry] = layer.radii;
  const { centre } = layer;
  return ((x - centre.x) / rx) ** 2 + ((y - centre.y) / ry) ** 2 <= 1;
}

/**
 * The share of `genes`' cap painted as shine over a spot, sampled on a grid
 * across the shine: points under both where the shine is the later layer.
 */
function shineOverSpots(
  genes: MushroomGenes,
  toward: Point,
): { overlapped: number; showing: number } {
  const layers = capLight(genes, toward);
  const shine = layers.find((layer) => layer.kind === 'shine');
  assert.ok(shine?.kind === 'shine');
  const [rx, ry] = shine.radii;
  let overlapped = 0;
  let showing = 0;
  for (let i = -1; i <= 1; i += 0.05) {
    for (let j = -1; j <= 1; j += 0.05) {
      const point = { x: shine.centre.x + i * rx, y: shine.centre.y + j * ry };
      const under = layers.flatMap((layer, index) =>
        covers(layer, point) ? [{ layer, index }] : [],
      );
      if (!under.some(({ layer }) => layer.kind === 'spot')) continue;
      if (!under.some(({ layer }) => layer.kind === 'shine')) continue;
      overlapped++;
      if (under.at(-1)?.layer.kind === 'shine') showing++;
    }
  }
  return { overlapped, showing };
}

describe('a spotted cap’s shine', () => {
  it('never shows over a spot, on caps where the two overlap', () => {
    let overlapping = 0;
    for (let seed = 1; seed <= 3000; seed++) {
      const genes = mushroomGenes({ seed, species: 'fly-agaric' });
      for (const toward of [
        { x: 0.8, y: -0.6 },
        { x: -0.3, y: -0.95 },
      ]) {
        const { overlapped, showing } = shineOverSpots(genes, toward);
        if (overlapped > 0) overlapping++;
        assert.equal(showing, 0, `seed ${String(seed)}`);
      }
    }
    // Most caps put a spot under the shine: the order is what keeps it off.
    assert.ok(overlapping > 3000, String(overlapping));
  });
});

describe('a mushroom’s foot', () => {
  const size = 300;
  const light = { toward: { x: 0.8, y: -0.6 } };
  // Every turn a mushroom stands at, on every screen.
  const splays = new Set(
    VIEWPORTS.flatMap(([, width, height]) =>
      everyPlace(meadowLayout(width, height, 1).mushrooms).map(
        ({ splay }) => splay,
      ),
    ),
  );

  it('stands level on the ground, both corners inside every layer of shadow centred on its foot, at every lean', () => {
    let worst = 0;
    for (const splay of splays) {
      for (let seed = 1; seed <= 200; seed++) {
        const { genes, turn } = splayed(
          mushroomGenes({
            seed,
            species:
              MUSHROOM_SPECIES[seed % MUSHROOM_SPECIES.length] ?? 'fly-agaric',
          }),
          splay,
        );
        assertCentredCover(genes, turn, { seed, splay });
        const [left, right] = footCorners(genes, size, turn);
        worst = Math.max(worst, Math.abs(left.y - right.y));
      }
    }
    assert.ok(worst < 1, `a foot rises ${worst.toFixed(1)} px across`);
  });

  it('presses darker under a foot wide against its cap, whatever the species', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const porcini = mushroomGenes({ seed, species: 'porcini' });
      for (const species of MUSHROOM_SPECIES) {
        if (species === 'porcini') continue;
        const slim = mushroomGenes({ seed, species });
        const label = `seed ${String(seed)}, ${species}`;
        // As grown, a porcini's barrel is the one foot that presses heavily.
        assert.ok(
          footDarkness(porcini, size, light) >=
            footDarkness(slim, size, light) + 0.1,
          label,
        );
        // The shadow follows the foot: swap the feet, and the darkness swaps.
        const wideSlim = footOf(slim, porcini);
        const slimPorcini = footOf(porcini, slim);
        assert.equal(
          footDarkness(wideSlim, size, light),
          footDarkness(porcini, size, light),
          label,
        );
        assert.equal(
          footDarkness(slimPorcini, size, light),
          footDarkness(slim, size, light),
          label,
        );
        for (const splay of splays) {
          for (const wide of [porcini, wideSlim]) {
            const { genes, turn } = splayed(wide, splay);
            assertCentredCover(genes, turn, { seed, species, splay });
          }
        }
      }
    }
  });

  /** Both ends of `genes`' foot, stood turned `turn`, inside every layer of its shadow centred on the foot. */
  function assertCentredCover(
    genes: MushroomGenes,
    turn: number,
    label: object,
  ): void {
    const centred = mushroomShadow(genes, size, light, turn).filter(
      ({ x }) => x === 0,
    );
    assert.ok(centred.length > 0);
    for (const { across, tall } of centred) {
      for (const corner of footCorners(genes, size, turn)) {
        const reach =
          (corner.x / (across / 2)) ** 2 + (corner.y / (tall / 2)) ** 2;
        assert.ok(
          reach < 1,
          JSON.stringify({ ...label, across, corner, reach }),
        );
      }
    }
  }
});

/** `genes` grown on `from`'s foot: its stem's width and bulge, and the cap width it is measured against. */
function footOf(genes: MushroomGenes, from: MushroomGenes): MushroomGenes {
  const { stemWidth, footBulge, capWidth } = from;
  return { ...genes, stemWidth, footBulge, capWidth };
}

/** Where the sides of `genes`' stem end on the ground, on a canvas `size` px to the unit, stood turned `turn`: up the right one, and back down the left. */
function footCorners(
  genes: MushroomGenes,
  size: number,
  turn: number,
): [Point, Point] {
  const drawn = stemOutline(genes, turn).map((point) =>
    placedAt({ x: 0, y: 0 }, turn, toCanvas(size)(point)),
  );
  const [right, left] = [drawn[0], drawn[CURVE_STEPS * 2 + 1]];
  assert.ok(right && left);
  return [right, left];
}

/**
 * A standing mushroom's shadow's darkness where the ground meets each end of
 * its foot, the lighter of the two: every ellipse painted over that spot,
 * stacked.
 */
function footDarkness(
  genes: MushroomGenes,
  size: number,
  light: Parameters<typeof mushroomShadow>[2],
): number {
  const layers = mushroomShadow(genes, size, light);
  return Math.min(
    ...footCorners(genes, size, 0).map((end) => {
      const over = layers.filter(
        ({ x, across, tall }) =>
          ((end.x - x) / (across / 2)) ** 2 + (end.y / (tall / 2)) ** 2 < 1,
      );
      return 1 - over.reduce((clear, { alpha }) => clear * (1 - alpha), 1);
    }),
  );
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
    const { sun, mushrooms, flowers } = layout;

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
    const { sun, mushrooms, flowers } = layout;
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
