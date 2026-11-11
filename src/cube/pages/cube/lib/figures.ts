const HUNDRED = 100;
const CENT = 0.01;
/** Absorbs float noise in `price / unit`, so an exact $0.60 stays 60 cents. */
const EPSILON = 1e-9;
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

/** Whole `unit`s strictly below `value`: the charm price's count of them. */
const justBelow = (value: number, unit: number): number =>
  Math.ceil(value / unit - EPSILON) - 1;

/**
 * A positive `value` to three significant figures as `9.31 × 10⁻³`; with
 * `charm`, the mantissa is the hundredth just below it, `1.99 × 10⁻³` for 2.
 */
function scientific(value: number, charm = false): string {
  const exponent = Math.floor(Math.log10(value));
  const scaled = value / 10 ** exponent;
  if (charm && justBelow(scaled, CENT) < HUNDRED) {
    // A mantissa of exactly 1 has its step below in the power under it.
    return `9.99 × 10${superscript(exponent - 1)}`;
  }
  const mantissa = charm
    ? justBelow(scaled, CENT) / HUNDRED
    : Number(scaled.toPrecision(3));
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
 * A price as a shop would tag it, one step under its last shown digit: whole
 * dollars from $100 (`$9,999,999` for $10M), cents below it (`$0.59` for
 * $0.60), and under a cent the scientific form's last hundredth
 * (`$9.31 × 10⁻³`), since the deepest floors' prices have no other spelling.
 */
export function formatPrice(price: number): string {
  assertPositive(price, 'price');
  if (price > HUNDRED) return WHOLE.format(justBelow(price, 1));
  if (price > CENT) return CENTS.format(justBelow(price, CENT) * CENT);
  return `$${scientific(price, true)}`;
}

/**
 * A length in metres, without its unit: three significant figures, in
 * scientific form under a millimetre.
 */
export function formatLength(metres: number): string {
  assertPositive(metres, 'length');
  return metres >= MILLIMETRE ? significant(metres) : scientific(metres);
}
