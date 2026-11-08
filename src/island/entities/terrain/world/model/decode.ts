/** How many values a 32-bit word takes. */
const WORDS = 2 ** 32;
const LAST_WORD = WORDS - 1;

/** A word's place in `(0, 1)`: the middle of its `1 / 2^32` slot, exact. */
const slotCentre = (word: number) => (word + 0.5) / WORDS;

/** Evaluates `c[0] + c[1]·r + … + c[n]·r^n` by Horner's rule. */
const poly = (c: readonly number[], r: number) =>
  c.reduceRight((sum, coefficient) => sum * r + coefficient, 0);

// Wichura's AS 241 (PPND16): relative error about 1e-16 over the whole range,
// so it needs no refinement step.
const CENTRAL_NUM = [
  3.387_132_872_796_366_5, 133.141_667_891_784_38, 1971.590_950_306_551_3,
  13_731.693_765_509_46, 45_921.953_931_549_87, 67_265.770_927_008_7,
  33_430.575_583_588_13, 2509.080_928_730_122_7,
] as const;
const CENTRAL_DEN = [
  1, 42.313_330_701_600_91, 687.187_007_492_057_9, 5394.196_021_424_751,
  21_213.794_301_586_597, 39_307.895_800_092_71, 28_729.085_735_721_943,
  5226.495_278_852_854,
] as const;
const NEAR_NUM = [
  1.423_437_110_749_683_5, 4.630_337_846_156_546, 5.769_497_221_460_691,
  3.647_848_324_763_204_5, 1.270_458_252_452_368_4, 0.241_780_725_177_450_6,
  0.022_723_844_989_269_184, 0.000_774_545_014_278_341_4,
] as const;
const NEAR_DEN = [
  1, 2.053_191_626_637_759, 1.676_384_830_183_803_8, 0.689_767_334_985_1,
  0.148_103_976_427_480_08, 0.015_198_666_563_616_457,
  0.000_547_593_808_499_534_5, 1.050_750_071_644_416_9e-9,
] as const;
const FAR_NUM = [
  6.657_904_643_501_103, 5.463_784_911_164_114, 1.784_826_539_917_291_3,
  0.296_560_571_828_504_87, 0.026_532_189_526_576_124,
  0.001_242_660_947_388_078_4, 2.711_555_568_743_487_6e-5,
  2.010_334_399_292_288_1e-7,
] as const;
const FAR_DEN = [
  1, 0.599_832_206_555_888, 0.136_929_880_922_735_8, 0.014_875_361_290_850_615,
  0.000_786_869_131_145_613_3, 1.846_318_317_510_054_8e-5,
  1.421_511_758_316_446e-7, 2.044_263_103_389_939_7e-15,
] as const;

/**
 * The standard normal quantile of `p` in `(0, 1)`. The tails are computed
 * from `min(p, 1 − p)` and signed, so the map is antisymmetric about ½ to the
 * bit for the words' `p`, whose `1 − p` is exact.
 */
export function inverseNormal(p: number): number {
  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180_625 - q * q;
    return (q * poly(CENTRAL_NUM, r)) / poly(CENTRAL_DEN, r);
  }
  let r = Math.sqrt(-Math.log(Math.min(p, 1 - p)));
  let z: number;
  if (r <= 5) {
    r -= 1.6;
    z = poly(NEAR_NUM, r) / poly(NEAR_DEN, r);
  } else {
    r -= 5;
    z = poly(FAR_NUM, r) / poly(FAR_DEN, r);
  }
  return q < 0 ? -z : z;
}

/** A word read as a uniform value on `[lo, hi)`. */
export const decodeUniform = (word: number, lo: number, hi: number) =>
  lo + (hi - lo) * slotCentre(word);

/** A word read as a unit normal value, by the inverse CDF of its slot. */
export const decodeNormal = (word: number) => inverseNormal(slotCentre(word));

/**
 * The word whose decoded value lies nearest `value`, for any decoder rising
 * strictly over the words: a binary search for the last word at or under it,
 * then the closer of that word and the next. Values past either end take the
 * end word.
 */
function nearestWord(decode: (word: number) => number, value: number) {
  if (Number.isNaN(value)) throw new Error(`nearestWord: NaN`);
  let low = 0;
  let high = LAST_WORD;
  if (decode(low) >= value) return low;
  if (decode(high) <= value) return high;
  // Invariant: decode(low) < value < decode(high).
  while (high - low > 1) {
    const middle = low + Math.floor((high - low) / 2);
    if (decode(middle) <= value) low = middle;
    else high = middle;
  }
  return value - decode(low) <= decode(high) - value ? low : high;
}

/** The word `decodeUniform` reads nearest `value`. */
export const encodeUniform = (value: number, lo: number, hi: number) =>
  nearestWord((word) => decodeUniform(word, lo, hi), value);

/** The word `decodeNormal` reads nearest `value`. */
export const encodeNormal = (value: number) => nearestWord(decodeNormal, value);
