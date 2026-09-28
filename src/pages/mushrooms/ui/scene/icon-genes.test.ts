import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MOUTH_LINE, mouthEdges } from '../../model/chanterelle-outline';
import type { Point } from '../../model/geometry';
import { inkWidth } from '../../model/mushroom-outline';
import { capBase, capSurface } from '../../model/mushroom-profile';
import { iconGenes, iconSize, SPECIES_ICON_HEIGHT } from './icon-genes';
import { TAP_RADIUS } from './sky-layout';

/** The height of the middle point of a mouth's `edge`. */
const middleY = (edge: readonly Point[]) =>
  edge[Math.floor(edge.length / 2)]?.y ?? 0;

describe('the chanterelle pictogram', () => {
  it('opens its mouth over at most half its lip, the edges’ ink counted, on the smallest button', () => {
    const genes = iconGenes('chanterelle');
    assert.ok(genes.species === 'chanterelle');
    const size = iconSize(genes, TAP_RADIUS * SPECIES_ICON_HEIGHT);
    const { far, near } = mouthEdges(genes);
    // Each stroke along an edge reaches half its width out past the edge.
    const strokes = ((MOUTH_LINE.near + MOUTH_LINE.far) / 2) * inkWidth(size);
    const mouth = (middleY(far) - middleY(near)) * size + strokes;
    const lip = (capSurface(genes, 0) - capBase(genes, 0)) * size;
    assert.ok(
      mouth <= lip * 0.5,
      `mouth ${mouth.toFixed(1)} px of a ${lip.toFixed(1)} px lip`,
    );
  });
});
