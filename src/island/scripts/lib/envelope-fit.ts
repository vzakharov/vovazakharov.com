import { harmonicSlot } from '@/island/entities/terrain';

/**
 * A degree's rms amplitude per order, `A(l) = √(Σ_m c_lm² / (2l + 1))`: what
 * `env(l)·normal` gives a random world in expectation, so a fitted series and
 * an envelope compare directly. Index `l`, from 0 to `degree`.
 */
export function degreeAmplitudes(
  series: Float64Array,
  degree: number,
): Float64Array {
  const amplitudes = new Float64Array(degree + 1);
  for (let l = 0; l <= degree; l += 1) {
    let power = 0;
    for (let m = -l; m <= l; m += 1) {
      power += (series[harmonicSlot(l, m)] ?? 0) ** 2;
    }
    amplitudes[l] = Math.sqrt(power / (2 * l + 1));
  }
  return amplitudes;
}

/**
 * Every degree from 1 to `degree` counts the same. Weights, here and below,
 * are how much each degree counts in a fit, by `l`, index 0 unused.
 */
export function equalWeights(degree: number): Float64Array {
  const weights = new Float64Array(degree + 1).fill(1);
  weights[0] = 0;
  return weights;
}

/**
 * Bins equal in `log l`, in the limit of narrow bins: degree `l` counts the
 * span of `log l` it covers, `ln((l + ½)/(l − ½))`, so the knee's few degrees
 * weigh as much as the hundreds in the tail.
 */
export function logWeights(degree: number): Float64Array {
  const weights = new Float64Array(degree + 1);
  for (let l = 1; l <= degree; l += 1) {
    weights[l] = Math.log((l + 0.5) / (l - 0.5));
  }
  return weights;
}

export type EnvelopeFit = {
  knee: number;
  slope: number;
  /** `A(l) ≈ scale·(knee² + l²)^(−slope/2)`. */
  scale: number;
  /** The weighted rms of `ln A` about the fit. */
  residual: number;
};

/**
 * A given knee and slope held to `amplitudes`: only the scale is fitted, the
 * weighted mean of `ln A` over the envelope's.
 */
export function holdEnvelope(
  amplitudes: Float64Array,
  weights: Float64Array,
  knee: number,
  slope: number,
): EnvelopeFit {
  let w = 0;
  let sum = 0;
  let squares = 0;
  for (let l = 1; l < amplitudes.length; l += 1) {
    const a = amplitudes[l] ?? 0;
    const weight = weights[l] ?? 0;
    if (a <= 0 || weight <= 0) continue;
    const gap = Math.log(a) + (slope / 2) * Math.log(knee * knee + l * l);
    w += weight;
    sum += weight * gap;
    squares += weight * gap * gap;
  }
  const mean = sum / w;
  const residual = Math.sqrt(Math.max(0, squares / w - mean * mean));
  return { knee, slope, scale: Math.exp(mean), residual };
}

/** Knees tried, 0.1 to 40 in steps of 0.05. */
const KNEES = Array.from({ length: 799 }, (_, i) => 0.1 + 0.05 * i);

/**
 * The knee-and-slope envelope nearest `amplitudes` in `ln A`: for each knee
 * tried, weighted least squares of `ln A(l)` on `ln(knee² + l²)`, the slope
 * minus twice the coefficient; the knee whose residual is least wins. Degrees
 * with no amplitude or no weight are left out.
 */
export function fitEnvelope(
  amplitudes: Float64Array,
  weights: Float64Array,
  knees: readonly number[] = KNEES,
): EnvelopeFit {
  let best: EnvelopeFit | undefined;
  for (const knee of knees) {
    let w = 0;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    let syy = 0;
    for (let l = 1; l < amplitudes.length; l += 1) {
      const a = amplitudes[l] ?? 0;
      const weight = weights[l] ?? 0;
      if (a <= 0 || weight <= 0) continue;
      const x = Math.log(knee * knee + l * l);
      const y = Math.log(a);
      w += weight;
      sx += weight * x;
      sy += weight * y;
      sxx += weight * x * x;
      sxy += weight * x * y;
      syy += weight * y * y;
    }
    const varX = sxx / w - (sx / w) ** 2;
    const coVar = sxy / w - (sx / w) * (sy / w);
    const b = coVar / varX;
    const a = sy / w - b * (sx / w);
    const residual = Math.sqrt(
      Math.max(0, syy / w - (sy / w) ** 2 - b * coVar),
    );
    if (!best || residual < best.residual) {
      best = { knee, slope: -2 * b, scale: Math.exp(a), residual };
    }
  }
  if (!best) throw new Error('no knee to fit');
  return best;
}
