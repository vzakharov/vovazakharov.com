import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { insectGenes } from '../../model/insect-genes';
import { wingspan } from '../../model/insect-outline';
import { GENE_RANGES } from '../../model/mushroom-genes';
import { meadowLayout } from './layout';
import { VIEWPORTS, VISITS } from './viewports';

const SPANS = VISITS.map((seed) =>
  wingspan(insectGenes({ seed, kind: 'butterfly' })),
);
/** The least a fly's or a bee's open wings span on screen, in CSS px, to read on a phone. */
const LEAST_BUZZER = 30;
/** The least a butterfly's open wings span on screen, in CSS px, to read as one on a phone. */
const LEAST_SPAN = 52;

describe('the butterflies’ size', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`spans a butterfly wide enough to read, and narrower than any clump cap, on a ${name} screen`, () => {
      const { insectSize, mushrooms } = meadowLayout(width, height, 1);
      const narrowestCap = Math.min(
        ...mushrooms
          .slice(0, 2)
          .map(({ size }) => size * GENE_RANGES.capWidth[0]),
      );
      for (const span of SPANS) {
        assert.ok(
          span * insectSize >= LEAST_SPAN,
          `${(span * insectSize).toFixed(0)} px`,
        );
        assert.ok(span * insectSize < narrowestCap);
      }
    });
  }
});

describe('the flies’ and the bees’ size', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`draws a fly and a bee big enough to read, and smaller than any butterfly, on a ${name} screen`, () => {
      const { insectSize, insectSizes } = meadowLayout(width, height, 1);
      const narrowestButterfly = Math.min(...SPANS) * insectSize;
      for (const kind of ['fly', 'bee'] as const) {
        for (const seed of VISITS) {
          const span =
            wingspan(insectGenes({ seed, kind })) * insectSizes[kind];
          assert.ok(span >= LEAST_BUZZER, `a ${kind} ${span.toFixed(0)} px`);
          assert.ok(
            span < narrowestButterfly,
            `a ${kind} ${span.toFixed(0)} px`,
          );
        }
      }
    });
  }
});
