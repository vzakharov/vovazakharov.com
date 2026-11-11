const HUNDRED = 100;
const CENT = 0.01;
/** Lengths under a millimetre are spelt in scientific form. */
const MILLIMETRE = 0.001;

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';

const superscript = (exponent: number): string =>
  `${exponent < 0 ? '⁻' : ''}${String(Math.abs(exponent)).replaceAll(
    /\d/g,
    (digit) => SUPERSCRIPT[Number(digit)] ?? digit,
  )}`;

/** `value` to three significant figures, trailing zeros dropped. */
const significant = (value: number): string =>
  String(Number(value.toPrecision(3)));

/** A positive `value` to three significant figures as `9.31 × 10⁻³`. */
function scientific(value: number): string {
  const exponent = Math.floor(Math.log10(value));
  const mantissa = Number((value / 10 ** exponent).toPrecision(3));
  // Rounding can carry 9.995 up to 10, which reads as one more power.
  const [shown, power] =
    mantissa >= 10 ? [mantissa / 10, exponent + 1] : [mantissa, exponent];
  return `${String(shown)} × 10${superscript(power)}`;
}

function assertPositive(value: number, what: string): void {
  if (!(value > 0) || !Number.isFinite(value)) {
    throw new RangeError(`Not a ${what}: ${value}`);
  }
}

const dollars = (fractionDigits: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

const WHOLE = dollars(0);
const CENTS = dollars(2);

/** Cents end in 9.99 rather than .99 from here up. */
const TEN = 10;
const THOUSAND = 1000;

/**
 * The positive count of `unit`s nearest `value` that leaves `step - 1` over a
 * multiple of `step`: the 99 or 999 a tag ends in.
 */
function nearestNines(value: number, unit: number, step: number): number {
  const nines = step - 1;
  const steps = Math.round((value / unit - nines) / step);
  return Math.max(steps, 0) * step + nines;
}

/**
 * A price as a shop would tag it: the nearest price ending in nines, above or
 * below. Whole dollars ending in 99 while that stays at $100 or more
 * (`$9,999,999` for $10M, `$19,499` for $19,531.25); else cents ending in 9.99
 * from $10 up (`$39.99` for $38.15) and in .99 below (`$4.99` for $4.77).
 * Nothing sells under a dollar, so nothing under one is a price.
 */
export function formatPrice(price: number): string {
  if (!(price >= 1) || !Number.isFinite(price)) {
    throw new RangeError(`Not a price: ${price}`);
  }
  const whole = nearestNines(price, 1, HUNDRED);
  if (whole >= HUNDRED) return WHOLE.format(whole);
  const step = price >= TEN ? THOUSAND : HUNDRED;
  return CENTS.format(nearestNines(price, CENT, step) * CENT);
}

/**
 * A length in metres, without its unit: three significant figures, in
 * scientific form under a millimetre.
 */
export function formatLength(metres: number): string {
  assertPositive(metres, 'length');
  return metres >= MILLIMETRE ? significant(metres) : scientific(metres);
}
