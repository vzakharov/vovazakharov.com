import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { latLonToUnit } from '@/island/shared/globe';

import { sampleSphereField } from './coast-field';
import { detailedCoast, heightAtSphere, sandAtSphere } from './height';
import { openSphereWorld, rollWorld } from './world';

// Worlds #0–#7 as the game rolls and opens them, pinned exactly: `seed` is
// the raw word `H(N, "noise/seed")`, `sea` and `harmonic` decode the words at
// `land/sea` and `land/harmonic/2/-1`, and `height` is the ground in metres at
// 10° N on the +X meridian, from the built world's coast, bent by its seed (#0
// and #1 from their pinned rows). A change to the hash, the decoders or the
// build moves one of them.
const PINNED = [
  {
    seed: 247_022_437,
    sea: -1.088_077_881_487_739_4,
    harmonic: 1.000_639_024_882_370_9,
    height: 1993.682_055_046_812,
  },
  {
    seed: 956_322_652,
    sea: 0.647_143_055_717_067_1,
    harmonic: -2.028_191_200_384_666,
    height: 310.061_812_651_369_1,
  },
  {
    seed: 419_119_805,
    sea: -0.817_731_935_004_934_5,
    harmonic: 0.704_656_718_903_818_6,
    height: -3572.088_724_408_745_3,
  },
  {
    seed: 1_976_890_843,
    sea: -0.576_342_877_458_781_8,
    harmonic: 0.628_560_341_941_027_6,
    height: -3261.065_902_647_055_7,
  },
  {
    seed: 930_165_241,
    sea: 0.487_413_850_749_488_34,
    harmonic: 0.381_235_707_441_019_53,
    height: -3298.175_685_745_792_6,
  },
  {
    seed: 1_116_413_068,
    sea: 0.373_074_285_498_926_24,
    harmonic: 0.105_924_603_896_278_93,
    height: -3367.222_412_454_533_7,
  },
  {
    seed: 1_862_583_293,
    sea: 0.984_067_768_447_368_9,
    harmonic: 0.123_087_086_251_453_94,
    height: -3250.661_901_297_037,
  },
  {
    seed: 4_229_433_299,
    sea: -1.595_925_558_600_684_2,
    harmonic: 0.286_876_912_811_595_2,
    height: -3363.902_996_967_299,
  },
];

const POINT = latLonToUnit({ lat: (10 * Math.PI) / 180, lon: 0 });

describe('worlds #0–#7', () => {
  for (const [n, pinned] of PINNED.entries()) {
    const world = String(n);

    it(`rolls and opens #${world} as pinned`, async () => {
      const { land, noise } = rollWorld(world, 2);
      const built = await openSphereWorld(world);
      assert.equal(noise.seed, pinned.seed);
      assert.equal(built.seed, pinned.seed);
      assert.equal(land.sea, pinned.sea);
      assert.equal(land.harmonic.at({ l: 2, m: -1 }), pinned.harmonic);
      const height = heightAtSphere(
        detailedCoast((p) => sampleSphereField(built.field, p), built.seed),
        built.seed,
        POINT,
      );
      assert.equal(height, pinned.height);
    });
  }
});

/** The share of sand at a place on world #0, degrees. */
async function sandOnWorld0(lat: number, lon: number) {
  const { field, seed } = await openSphereWorld('0');
  const coast = detailedCoast((p) => sampleSphereField(field, p), seed);
  const p = latLonToUnit({
    lat: (lat * Math.PI) / 180,
    lon: (lon * Math.PI) / 180,
  });
  return sandAtSphere(coast, p, heightAtSphere(coast, seed, p));
}

describe('sand on world #0', () => {
  it('is whole on a dune belt, and none inland or at sea', async () => {
    assert.equal(await sandOnWorld0(44.015, 10.048), 1);
    assert.equal(await sandOnWorld0(49.5, 20), 0);
    assert.equal(await sandOnWorld0(10, 0), 0);
  });
});
