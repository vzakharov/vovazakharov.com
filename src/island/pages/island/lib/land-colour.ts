/**
 * The land's colour by height: shore sand, green lowland, brown upland, pale
 * peaks. Stops are metres above the sea and sRGB; the output is linear, as the
 * renderer reads vertex colours.
 */
const STOPS: ReadonlyArray<readonly [number, readonly [number, number, number]]> =
  [
    [0, [0.86, 0.8, 0.6]],
    [20, [0.84, 0.78, 0.57]],
    [60, [0.38, 0.57, 0.27]],
    [450, [0.27, 0.45, 0.2]],
    [800, [0.5, 0.4, 0.27]],
    [1150, [0.44, 0.35, 0.26]],
    [1400, [0.72, 0.7, 0.67]],
    [1650, [0.94, 0.94, 0.95]],
  ];

const linear = (c: number) =>
  c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/**
 * The colour at `height` into `out` at `offset`. Ground under the sea takes
 * the shore's sand, so a triangle crossing the coastline reads as beach.
 */
export function landColour(
  height: number,
  out: Float32Array,
  offset: number,
): void {
  let index = STOPS.findIndex(([level]) => level > height);
  if (index === -1) index = STOPS.length;
  const lower = STOPS[Math.max(0, index - 1)];
  const upper = STOPS[Math.min(STOPS.length - 1, index)];
  if (lower === undefined || upper === undefined) {
    throw new RangeError('no colour stops');
  }
  const span = upper[0] - lower[0];
  const t = span === 0 ? 0 : Math.min(1, Math.max(0, (height - lower[0]) / span));
  for (let i = 0; i < 3; i++) {
    const a = lower[1][i] ?? 0;
    const b = upper[1][i] ?? 0;
    out[offset + i] = linear(a + (b - a) * t);
  }
}

/** Linear RGB per height. */
export function landColours(
  heights: Float32Array,
): Float32Array<ArrayBuffer> {
  const colours = new Float32Array(heights.length * 3);
  for (const [v, height] of heights.entries()) {
    landColour(height, colours, v * 3);
  }
  return colours;
}
