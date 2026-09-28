import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
  RUSSULA_TONES,
  type Species,
} from '../../model/mushroom-genes';
import { contrast, luminance, mix, toHsv } from './colour';
import { inkFor } from './ink';
import {
  haloFor,
  heldHaze,
  mushroomTints,
  porciniMargin,
  russulaCentre,
} from './mushroom-tints';
import { PALETTE } from './palette';

/** Every haze a mushroom stands in, from none to the farthest slot's. */
const HAZES = [0, 0.1, 0.2, 0.3, 0.4];
const SEEDS = Array.from({ length: 2000 }, (_, index) => index + 1);
/**
 * The deepest single layer of cool shade each head's painter lays on a cap:
 * `SHADE_ALPHA` in `paint-dome.ts` and in `paint-trumpet.ts`.
 */
const CAP_SHADE = { dome: 0.26, trumpet: 0.22 } as const;

function grown(species: Species): MushroomGenes[] {
  return SEEDS.map((seed) => mushroomGenes({ seed, species }));
}

/** A hue in degrees, from -180 to 180, so a red nudged past 0° stays a red. */
function hueDegrees(colour: number): number {
  const degrees = toHsv(colour).h * 360;
  return degrees > 180 ? degrees - 360 : degrees;
}

/** A fill as it shows in one light, `where` naming that light and `label` the fill in it. */
type Shown = { label: string; where: string; shown: number };

/**
 * `fill` as `genes` shows it at every haze a mushroom stands in, each haze
 * held as `genes` holds it: in the light, and under its cap's deepest shade.
 */
function shownFills(
  genes: MushroomGenes,
  fill: number,
  shade: number,
): Shown[] {
  return HAZES.flatMap((haze) => {
    const held = heldHaze(genes, haze);
    const hazed = mix(fill, PALETTE.air, held);
    const shaded = mix(hazed, PALETTE.shadeCool, shade * (1 - held));
    return [
      [`hazed ${String(haze)}`, hazed],
      [`hazed ${String(haze)}, shaded`, shaded],
    ] as const;
  }).map(([where, shown]) => ({
    label: `${fill.toString(16)} ${where}`,
    where,
    shown,
  }));
}

/**
 * The luminances where a fill's ink stands off it by less than the edge the
 * ink rule lifts over the darkest fills, swept over every grey but black: the
 * fills too light for a lifted edge that no ink dark enough can stand off.
 */
function weakEdge(): readonly [number, number] {
  const edges = Array.from({ length: 255 }, (_, index) => {
    const fill = (index + 1) * 0x01_01_01;
    const ink = inkFor(fill);
    return {
      shown: luminance(fill),
      lifted: luminance(ink) > luminance(fill),
      edge: contrast(ink, fill),
    };
  });
  const bar = Math.min(
    ...edges.filter(({ lifted }) => lifted).map(({ edge }) => edge),
  );
  const weak = edges.filter(({ edge }) => edge < bar).map(({ shown }) => shown);
  const band = [Math.min(...weak), Math.max(...weak)] as const;
  // One band, with no fill inside it that reads.
  const inside = edges.filter(
    ({ shown }) => shown >= band[0] && shown <= band[1],
  );
  assert.ok(weak.length > 0 && inside.every(({ edge }) => edge < bar));
  return band;
}

describe('a porcini', () => {
  const porcini = grown('porcini').flatMap((genes) =>
    genes.species === 'porcini' ? [genes] : [],
  );

  it('keeps every fill, near and far, lit or shaded, out of the luminance where an edge reads weakly', () => {
    const [low, high] = weakEdge();
    const failing = porcini.flatMap((genes) =>
      [...Object.values(mushroomTints(genes)), porciniMargin(genes)].flatMap(
        (fill) =>
          shownFills(genes, fill, CAP_SHADE.dome).flatMap(({ label, shown }) =>
            luminance(shown) >= low && luminance(shown) <= high
              ? [`${label}: ${luminance(shown).toFixed(3)}`]
              : [],
          ),
      ),
    );
    assert.deepEqual([...new Set(failing)], []);
  });

  it('is brown, from tan to chestnut, under a paler margin, on a whitish stem', () => {
    const caps = porcini.map((genes) => mushroomTints(genes).cap);
    const lums = caps.map((cap) => luminance(cap));
    // A spread of browns, not one.
    assert.ok(Math.max(...lums) / Math.min(...lums) > 1.6);
    for (const genes of porcini) {
      const { cap, stem } = mushroomTints(genes);
      const hue = hueDegrees(cap);
      assert.ok(hue > 15 && hue < 40, hue.toFixed(1));
      assert.ok(toHsv(cap).s > 0.4 && toHsv(cap).v < 0.8);
      assert.ok(luminance(porciniMargin(genes)) > luminance(cap) * 1.3);
      assert.ok(luminance(stem) > 0.75);
    }
  });
});

describe('a chanterelle', () => {
  /** The hues, in degrees, a chanterelle keeps every fill to: orange, short of gold. */
  const ORANGE = [20, 30] as const;
  /** The least a chanterelle's hue stands above a fly agaric's in one light, in degrees. */
  const LEAST_GAP = 8;
  const chanterelles = grown('chanterelle');

  /**
   * Every fill a chanterelle shows near and far: its flesh and its ridges lit
   * or shaded, and its light, which lies only on the side toward the sun.
   */
  const shown = chanterelles.flatMap((genes) => {
    const { cap, capLit } = mushroomTints(genes);
    return [
      ...[cap, PALETTE.chanterelle.ridge].flatMap((fill) =>
        shownFills(genes, fill, CAP_SHADE.trumpet),
      ),
      ...shownFills(genes, capLit, 0),
    ];
  });

  it('is one egg-yolk orange from foot to rim, its ridges paler', () => {
    for (const genes of chanterelles) {
      const { stem, under, cap } = mushroomTints(genes);
      assert.equal(stem, cap);
      assert.equal(under, cap);
      assert.ok(toHsv(cap).s > 0.8 && toHsv(cap).v > 0.9);
    }
    const { flesh, ridge } = PALETTE.chanterelle;
    assert.ok(luminance(ridge) > luminance(flesh));
  });

  it('keeps its flesh, its ridges and its light orange, near and far, lit or shaded', () => {
    const failing = shown.flatMap(({ label, shown: colour }) => {
      const hue = hueDegrees(colour);
      return hue >= ORANGE[0] && hue <= ORANGE[1]
        ? []
        : [`${label}: ${hue.toFixed(1)}°`];
    });
    assert.deepEqual([...new Set(failing)], []);
  });

  it('stays apart from a fly agaric’s red, each as it stands in the meadow', () => {
    const fly = grown('fly-agaric').flatMap((genes) =>
      shownFills(genes, mushroomTints(genes).cap, CAP_SHADE.dome),
    );
    // A chanterelle's lowest hue against a fly agaric's highest, in each light.
    const gaps = [...new Set(fly.map(({ where }) => where))].map((where) => {
      const hues = (fills: readonly Shown[]) =>
        fills
          .filter((fill) => fill.where === where)
          .map(({ shown: colour }) => hueDegrees(colour));
      return {
        where,
        gap: Math.min(...hues(shown)) - Math.max(...hues(fly)),
      };
    });
    assert.deepEqual(
      gaps.filter(
        // A light with no chanterelle measured in it is infinitely apart: a failure too.
        ({ gap }) => !Number.isFinite(gap) || gap < LEAST_GAP,
      ),
      [],
    );
  });

  it('stays bright in the farthest haze', () => {
    for (const genes of chanterelles) {
      const hazed = mix(
        mushroomTints(genes).cap,
        PALETTE.air,
        heldHaze(genes, HAZES.at(-1) ?? 0),
      );
      assert.ok(toHsv(hazed).s > 0.65, toHsv(hazed).s.toFixed(2));
    }
  });
});

describe('a russula', () => {
  const russulas = grown('russula').flatMap((genes) =>
    genes.species === 'russula' ? [genes] : [],
  );

  it('grows every tone, each on a white stem over white gills', () => {
    const tones = new Set(russulas.map(({ tone }) => tone));
    assert.deepEqual([...tones].toSorted(), [...RUSSULA_TONES].toSorted());
    for (const genes of russulas) {
      const { stem, under } = mushroomTints(genes);
      assert.ok(luminance(stem) > 0.8 && luminance(under) > 0.8);
    }
  });

  it('is paler in its dip than at its rim', () => {
    for (const genes of russulas) {
      assert.ok(
        luminance(russulaCentre(genes)) >
          luminance(mushroomTints(genes).cap) * 1.1,
      );
    }
  });

  it('keeps its red apart from a fly agaric’s, and its rose lighter still', () => {
    const { red, rose } = PALETTE.russula;
    assert.ok(Math.abs(hueDegrees(red) - hueDegrees(PALETTE.capRed)) > 5);
    assert.ok(luminance(rose) > luminance(PALETTE.capRed) * 1.8);
  });
});

describe('a house on every species', () => {
  it('edges each window on the cap and the door on the stem, by the ink or a pale line round it', () => {
    const failing = MUSHROOM_SPECIES.flatMap((species) =>
      grown(species).flatMap((genes) => {
        const { cap, stem } = mushroomTints(genes);
        return [
          [PALETTE.wood, cap],
          [PALETTE.woodDeep, stem],
        ].flatMap(([fill = 0, behind = 0]) => {
          const edge = haloFor(fill, behind) ?? inkFor(fill);
          return contrast(edge, behind) >= 3
            ? []
            : [`${species} ${fill.toString(16)} on ${behind.toString(16)}`];
        });
      }),
    );
    assert.deepEqual([...new Set(failing)], []);
  });

  it('rings a window with a pale line on a porcini’s darker caps only', () => {
    const haloed = grown('porcini').filter(
      (genes) => haloFor(PALETTE.wood, mushroomTints(genes).cap) !== undefined,
    );
    assert.ok(haloed.length > 0 && haloed.length < SEEDS.length);
    const [fly] = grown('fly-agaric');
    assert.ok(fly);
    assert.equal(haloFor(PALETTE.wood, mushroomTints(fly).cap), undefined);
  });
});
