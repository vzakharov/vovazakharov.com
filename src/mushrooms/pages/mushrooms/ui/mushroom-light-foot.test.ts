import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { placedAt, type Point } from '@/mushrooms/shared/lib/geometry';
import {
  everyPlace,
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
  splayed,
  toCanvas,
  VIEWPORTS,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  CURVE_STEPS,
  mushroomShadow,
  stemOutline,
} from '@/mushrooms/entities/mushroom/index.test-only';

import { meadowLayout } from './layout';

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
