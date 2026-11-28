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

const COUNT = new Intl.NumberFormat('en-US');

/**
 * A count of кубики, without their mark: grouped in thousands, as
 * `10,000,000`. Кубики come whole, so a fraction or a negative throws.
 */
export function formatCubes(count: number): string {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError(`Not a count of кубики: ${count}`);
  }
  return COUNT.format(count);
}

/**
 * A length in metres, without its unit: three significant figures, in
 * scientific form under a millimetre.
 */
export function formatLength(metres: number): string {
  assertPositive(metres, 'length');
  return metres >= MILLIMETRE ? significant(metres) : scientific(metres);
}
