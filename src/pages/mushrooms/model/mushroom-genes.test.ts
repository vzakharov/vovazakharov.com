import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { placeOf } from '../ui/scene/clump-layout';
import { meadowLayout } from '../ui/scene/layout';
import { ZOOM_FLOOR } from '../ui/scene/meadow-camera';
import { TAP_RADIUS } from '../ui/scene/tap-reach';
import { FLOOR_HELD, VIEWPORTS } from '../ui/scene/viewports';
import {
  domeHeight,
  firstMushrooms,
  GENE_RANGES,
  MUSHROOM_SPECIES,
  mushroomGenes,
  OPENING_SPECIES,
  RUSSULA_HOLLOW,
  RUSSULA_TONES,
  type Species,
  SPOT_MARGIN,
  TRUMPET_RANGES,
} from './mushroom-genes';
import { capOutlines, headOutlines } from './mushroom-outline';
import { stemAt } from './mushroom-pose';
import { stemHalfWidth } from './mushroom-profile';
import { OPENING_FOOTING } from './placement';
import { mulberry32 } from './random';

const SEEDS = Array.from({ length: 400 }, (_, index) => index * 7919 + 1);
const median = (values: readonly number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)] ?? Number.NaN;
/** Enough seeds that each gene comes near either end of its range. */
const WIDE_SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);

/** How far through its range each of `species`' genes with room to vary was drawn for `seed`. */
function along(seed: number, species: Species): Map<string, number> {
  const genes: Record<string, unknown> = mushroomGenes({ seed, species });
  return new Map(
    Object.entries(GENE_RANGES[species]).flatMap(([name, [min, max]]) => {
      const value = genes[name];
      return max > min && typeof value === 'number'
        ? [[name, (value - min) / (max - min)] as const]
        : [];
    }),
  );
}

/**
 * The median stem as a child sees it, over `WIDE_SEEDS`: from the foot to the
 * lowest of the cap and what shows under it over the stem's top, in the
 * cap's width.
 */
const visibleStem = (species: Species) =>
  median(
    WIDE_SEEDS.map((seed) => {
      const genes = mushroomGenes({ seed, species });
      const top = stemAt(genes, 1);
      const half = stemHalfWidth(genes, 1);
      const over = capOutlines(genes)
        .flat()
        .filter(({ x }) => Math.abs(x - top.x) <= half);
      return Math.min(...over.map(({ y }) => y)) / genes.capWidth;
    }),
  );

describe('mushroomGenes', () => {
  it('grows the same mushroom from the same seed', () => {
    for (const species of MUSHROOM_SPECIES) {
      assert.deepEqual(
        mushroomGenes({ seed: 42, species }),
        mushroomGenes({ seed: 42, species }),
      );
    }
  });

  it('grows different mushrooms from neighbouring seeds', () => {
    const a = mushroomGenes({ seed: 1, species: 'porcini' });
    const b = mushroomGenes({ seed: 2, species: 'porcini' });
    assert.notEqual(a.capWidth, b.capWidth);
  });

  it('keeps every gene inside its species’ range', () => {
    for (const species of MUSHROOM_SPECIES) {
      for (const seed of SEEDS) {
        const genes: Record<string, unknown> = mushroomGenes({ seed, species });
        const ranges: Record<string, readonly [number, number]> = {
          ...GENE_RANGES[species],
          ...(species === 'chanterelle' ? TRUMPET_RANGES : {}),
          ...(species === 'russula' ? { hollow: RUSSULA_HOLLOW } : {}),
        };
        for (const [name, [min, max]] of Object.entries(ranges)) {
          const value = genes[name];
          assert.ok(
            typeof value === 'number' && value >= min && value <= max,
            `${species} ${name} = ${String(value)}`,
          );
        }
      }
    }
  });

  it('draws the same seed’s shape from the same place in each species’ ranges', () => {
    for (const seed of SEEDS.slice(0, 50)) {
      const reference = along(seed, 'fly-agaric');
      for (const species of MUSHROOM_SPECIES) {
        for (const [name, share] of along(seed, species)) {
          const expected = reference.get(name);
          assert.ok(expected !== undefined, name);
          assert.ok(Math.abs(share - expected) < 1e-9, `${species} ${name}`);
        }
      }
    }
  });

  it('grows each species its own, from the same seed', () => {
    const grown = MUSHROOM_SPECIES.map((species) =>
      mushroomGenes({ seed: 9, species }),
    );
    assert.deepEqual(
      grown.map(({ species }) => species),
      [...MUSHROOM_SPECIES],
    );
    assert.equal(new Set(grown.map(({ capHeight }) => capHeight)).size, 4);
  });

  it('makes the opening clump’s narrowest drawn cap a finger’s target on every screen the zoom floor holds it on', (t) => {
    // The cap and what shows under it as drawn and tapped, across its own
    // frame, which a turn only turns: a finger's circle fits it the same.
    const narrowest = Math.min(
      ...WIDE_SEEDS.map((seed) => {
        const xs = headOutlines(
          mushroomGenes({ seed, species: OPENING_SPECIES }),
        )
          .flat()
          .map(({ x }) => x);
        return Math.max(...xs) - Math.min(...xs);
      }),
    );
    const screens = [...VIEWPORTS, FLOOR_HELD];
    const held: string[] = [];
    const drawn: string[] = [];
    for (const [name, width, height] of screens) {
      const { camera } = meadowLayout(width, height, 1).mushrooms;
      // A short screen stands the clump under the floor; the finger pad holds
      // its caps there (`mushroom-tap.test.ts`).
      if (camera.unit < ZOOM_FLOOR - 1e-9) continue;
      if (camera.unit - ZOOM_FLOOR < 1e-9) held.push(name);
      const smallest = Math.min(
        ...OPENING_FOOTING.map((footed) => placeOf(camera, footed).size),
      );
      const across = narrowest * smallest;
      drawn.push(`${name} ${across.toFixed(0)} px`);
      // A pixel's slack for the rim's rounding, which cuts its corner.
      assert.ok(across >= 2 * TAP_RADIUS - 1, `${name}: ${across.toFixed(1)}`);
    }
    assert.deepEqual(held, [FLOOR_HELD[0]]);
    t.diagnostic(`narrowest clump cap: ${drawn.join(', ')}`);
  });

  it('stands a porcini on a stem short against its cap, shorter than a fly agaric’s', (t) => {
    const [porcini, flyAgaric] = [
      visibleStem('porcini'),
      visibleStem('fly-agaric'),
    ];
    assert.ok(
      porcini <= 0.6,
      `a porcini's stem ${porcini.toFixed(2)} of its cap`,
    );
    assert.ok(porcini < flyAgaric);
    t.diagnostic(
      `median stem in sight, of the cap's width: porcini ${porcini.toFixed(2)}, fly agaric ${flyAgaric.toFixed(2)}`,
    );
  });

  it('gives a chanterelle whole lobes and ridges, and a russula every tone', () => {
    const tones = new Set<string>();
    for (const seed of SEEDS) {
      const chanterelle = mushroomGenes({ seed, species: 'chanterelle' });
      assert.ok(chanterelle.species === 'chanterelle');
      assert.ok(
        Number.isInteger(chanterelle.lobes) &&
          chanterelle.lobes >= 3 &&
          chanterelle.lobes <= 5,
      );
      assert.ok(
        Number.isInteger(chanterelle.ridges) &&
          chanterelle.ridges >= 7 &&
          chanterelle.ridges <= 11,
      );
      const russula = mushroomGenes({ seed, species: 'russula' });
      assert.ok(russula.species === 'russula');
      tones.add(russula.tone);
    }
    assert.deepEqual([...tones].toSorted(), [...RUSSULA_TONES].toSorted());
  });

  it('spots only the fly agaric', () => {
    for (const species of MUSHROOM_SPECIES.filter(
      (kind) => kind !== 'fly-agaric',
    )) {
      assert.equal(mushroomGenes({ seed: 3, species }).spots.length, 0);
    }
    for (const seed of SEEDS) {
      assert.ok(
        mushroomGenes({ seed, species: 'fly-agaric' }).spots.length >= 3,
      );
    }
  });

  it('keeps spots inside the cap and off the rim', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, species: 'fly-agaric' });
      for (const { x, y, r } of genes.spots) {
        assert.ok(y - r >= SPOT_MARGIN, `seed ${seed}: a spot on the rim`);
        assert.ok(
          y + r <= domeHeight(genes, x),
          `seed ${seed}: a spot past the dome`,
        );
      }
    }
  });

  it('never overlaps two spots', () => {
    for (const seed of SEEDS) {
      const { spots } = mushroomGenes({ seed, species: 'fly-agaric' });
      for (const [i, a] of spots.entries()) {
        for (const b of spots.slice(i + 1)) {
          assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r);
        }
      }
    }
  });
});

describe('firstMushrooms', () => {
  it('opens the meadow with two distinct fly agarics', () => {
    const [first, second, ...rest] = firstMushrooms(mulberry32(5));
    assert.equal(rest.length, 0);
    assert.ok(first && second);
    assert.notEqual(first.id, second.id);
    assert.notEqual(first.seed, second.seed);
    assert.equal(first.species, 'fly-agaric');
  });
});
