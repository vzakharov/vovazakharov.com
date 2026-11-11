const MILLION = 1_000_000;
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

/**
 * A price in dollars as a person reads it: millions as `$10M` or `$1.25M`,
 * whole dollars as `$156,250`, cents as `$38.15`, and anything under a cent
 * in three significant figures of scientific form, `$9.31 × 10⁻³`, since the
 * deepest floors' prices have no other honest spelling.
 */
export function formatPrice(price: number): string {
  assertPositive(price, 'price');
  if (price >= MILLION) {
    return `$${String(Number((price / MILLION).toFixed(2)))}M`;
  }
  if (price >= CENT) {
    return Number.isInteger(price) ? WHOLE.format(price) : CENTS.format(price);
  }
  return `$${scientific(price)}`;
}

/**
 * A length in metres, without its unit: three significant figures, in
 * scientific form under a millimetre.
 */
export function formatLength(metres: number): string {
  assertPositive(metres, 'length');
  return metres >= MILLIMETRE ? significant(metres) : scientific(metres);
}
