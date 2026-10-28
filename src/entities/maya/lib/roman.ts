const NUMERALS: ReadonlyArray<readonly [number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** A positive integer in Roman numerals. */
export function roman(value: number): string {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`No Roman numeral for ${value}.`);
  }

  let rest = value;
  let numeral = '';

  for (const [step, letters] of NUMERALS) {
    while (rest >= step) {
      numeral += letters;
      rest -= step;
    }
  }

  return numeral;
}
