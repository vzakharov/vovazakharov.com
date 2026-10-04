import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MUSHROOM_SPECIES, mushroomGenes } from '../../model/mushroom-genes';
import { DUSK_TONES } from './backdrop-tones';
import { luminance } from './colour';
import { hazeAir, hazeTone } from './haze-tone';
import { heldHaze, mushroomTints } from './mushroom-tints';
import { PALETTE } from './palette';

/** A back-row mushroom's haze in flight: the ground's furthest haze and the brow's paling. */
const FAR = 0.6;

describe('the haze toward the air', () => {
  it('goes toward the day air by day and the dusk air at dusk', () => {
    assert.equal(hazeAir(0), PALETTE.air);
    assert.equal(hazeAir(1), PALETTE.airDusk);
    assert.equal(hazeTone(0.5, 0)(PALETTE.air), PALETTE.air);
  });

  it('turns to an air darker than every dusk range and the ground at their foot', () => {
    const behind = [
      ...Object.values(DUSK_TONES.ranges).map(({ lit }) => lit),
      DUSK_TONES.ground[0]?.[1] ?? 0,
    ];
    for (const colour of behind) {
      assert.ok(
        luminance(PALETTE.airDusk) < luminance(colour),
        `the dusk air ${PALETTE.airDusk.toString(16)} over ${colour.toString(16)}`,
      );
    }
  });

  it('takes a far spore and a far mouse darker at dusk than by day, never past the dusk air', () => {
    for (const colour of [PALETTE.spore, PALETTE.mouse, PALETTE.mouseLight]) {
      const [day, dusk] = [0, 1].map((at) =>
        luminance(hazeTone(FAR, at)(colour)),
      );
      assert.ok(
        luminance(PALETTE.airDusk) < (dusk ?? 0) && (dusk ?? 0) < (day ?? 0),
        `${colour.toString(16)}: day ${String(day)}, dusk ${String(dusk)}`,
      );
    }
  });

  // A chanterelle holds back most of its haze (`heldHaze`), its orange being what tells it apart far off.
  it('leaves a far cap at full dusk no lighter than the ground behind it, but a chanterelle', () => {
    const ground = luminance(DUSK_TONES.ground[0]?.[1] ?? 0);
    const hazed = MUSHROOM_SPECIES.filter((one) => one !== 'chanterelle');
    for (const [species, seed] of hazed.flatMap((one) =>
      [1, 42, 99].map((each) => [one, each] as const),
    )) {
      const genes = mushroomGenes({ species, seed });
      const { cap } = mushroomTints(genes);
      const toned = hazeTone(heldHaze(genes, FAR), 1)(cap);
      assert.ok(
        luminance(toned) <= ground,
        `${species} ${String(seed)}: cap ${toned.toString(16)} over ${String(ground)}`,
      );
    }
  });
});
