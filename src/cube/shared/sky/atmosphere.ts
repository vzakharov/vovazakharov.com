import type { Sized } from '@/kernel/shared/typings';

import type { Rgb } from '../lib/colour';
import { clamp01 } from '../lib/ease';

/**
 * The air over the island, in kilometres and per-kilometre coefficients for
 * red, green and blue: Rayleigh air, a marine haze of Mie aerosol, and the
 * ozone layer, whose absorption of orange is what keeps the zenith blue under
 * a low sun. The numbers are the ones Bruneton and Hillaire publish, with the
 * haze at a clean ocean's aerosol optical depth of about 0.05.
 */
export const ATMOSPHERE = {
  ground: 6360,
  top: 6460,
  rayleigh: { scatter: [5.802e-3, 13.558e-3, 33.1e-3], height: 8 },
  mie: {
    scatter: [0.04, 0.043, 0.047],
    absorb: [0.004, 0.004, 0.0045],
    height: 1.2,
    /** The asymmetry of the broad lobe every scattering integral uses. */
    g: 0.7,
  },
  ozone: { absorb: [0.65e-3, 1.881e-3, 0.085e-3], centre: 25, half: 15 },
  /** What the sea gives back of the light falling on it, as a matte ground. */
  albedo: [0.04, 0.05, 0.065],
} as const satisfies Record<string, unknown>;

/** Sizes of the two tables the model keeps: transmittance, then multiple scattering. */
const TRANSMITTANCE_SIZE = { width: 128, height: 64 } as const;
const SCATTER_SIZE = { width: 8, height: 24 } as const;

const RG = ATMOSPHERE.ground;
const RT = ATMOSPHERE.top;
const REACH = Math.sqrt(RT * RT - RG * RG);

/** A colour whose every channel is what `of` gives for it. */
export const perChannel = (of: (channel: 0 | 1 | 2) => number): Rgb => [
  of(0),
  of(1),
  of(2),
];

type Densities = { rayleigh: number; mie: number; ozone: number };

/** How much of each constituent there is `h` km up, as a share of sea level's. */
export const densitiesAt = (h: number): Densities => ({
  rayleigh: Math.exp(-h / ATMOSPHERE.rayleigh.height),
  mie: Math.exp(-h / ATMOSPHERE.mie.height),
  ozone: Math.max(
    0,
    1 - Math.abs(h - ATMOSPHERE.ozone.centre) / ATMOSPHERE.ozone.half,
  ),
});

/** What a kilometre of air `h` km up scatters out of a beam, per channel. */
export const scatteringAt = (h: number): { rayleigh: Rgb; mie: Rgb } => {
  const d = densitiesAt(h);
  return {
    rayleigh: perChannel((c) => ATMOSPHERE.rayleigh.scatter[c] * d.rayleigh),
    mie: perChannel((c) => ATMOSPHERE.mie.scatter[c] * d.mie),
  };
};

/** What a kilometre of air `h` km up takes out of a beam, per channel. */
export const extinctionAt = (h: number): Rgb => {
  const d = densitiesAt(h);
  return perChannel(
    (c) =>
      ATMOSPHERE.rayleigh.scatter[c] * d.rayleigh +
      (ATMOSPHERE.mie.scatter[c] + ATMOSPHERE.mie.absorb[c]) * d.mie +
      ATMOSPHERE.ozone.absorb[c] * d.ozone,
  );
};

/** Kilometres from radius `r` along a ray of cosine `mu` to the top of the air. */
export const toTop = (r: number, mu: number): number =>
  -r * mu + Math.sqrt(Math.max(0, r * r * (mu * mu - 1) + RT * RT));

/** Kilometres to the ground along that ray, or `null` where it misses it. */
export const toGround = (r: number, mu: number): number | null => {
  const under = r * r * (mu * mu - 1) + RG * RG;
  return mu < 0 && under >= 0 ? -r * mu - Math.sqrt(under) : null;
};

/**
 * Bruneton's mapping of a ray that clears the ground onto the unit square,
 * which spends its rows near the horizon where transmittance turns fastest.
 */
export const transmittanceUv = (r: number, mu: number): [number, number] => {
  const rho = Math.sqrt(Math.max(0, r * r - RG * RG));
  const least = RT - r;
  const most = rho + REACH;
  return [(toTop(r, mu) - least) / (most - least), rho / REACH];
};

const rayOfUv = (u: number, v: number): { r: number; mu: number } => {
  const rho = v * REACH;
  const r = Math.hypot(rho, RG);
  const least = RT - r;
  const d = least + u * (rho + REACH - least);
  const mu = d === 0 ? 1 : (REACH * REACH - rho * rho - d * d) / (2 * r * d);
  return { r, mu: Math.min(1, Math.max(-1, mu)) };
};

const TRANSMITTANCE_STEPS = 40;

const opticalDepthToTop = (r: number, mu: number): Rgb => {
  const step = toTop(r, mu) / TRANSMITTANCE_STEPS;
  const sum = [0, 0, 0];
  for (let i = 0; i < TRANSMITTANCE_STEPS; i++) {
    const t = (i + 0.5) * step;
    const h = Math.sqrt(t * t + 2 * r * mu * t + r * r) - RG;
    const e = extinctionAt(Math.max(0, h));
    for (const c of [0, 1, 2] as const) sum[c] = (sum[c] ?? 0) + e[c] * step;
  }
  return perChannel((c) => sum[c] ?? 0);
};

/** A table of `width` by `height` texels, four floats each. */
export type Table = Sized & { data: Float32Array };

const tableOf = (
  { width, height }: Sized,
  texel: (u: number, v: number) => Rgb,
): Table => {
  const data = new Float32Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = texel(x / (width - 1), y / (height - 1));
      data.set([...value, 1], (y * width + x) * 4);
    }
  }
  return { width, height, data };
};

/** `table` at (`u`, `v`) in [0, 1]², texel centres on the edges, bilinear. */
export const sampleTable = (table: Table, u: number, v: number): Rgb => {
  const x = clamp01(u) * (table.width - 1);
  const y = clamp01(v) * (table.height - 1);
  const x0 = Math.min(Math.floor(x), table.width - 2);
  const y0 = Math.min(Math.floor(y), table.height - 2);
  const fx = x - x0;
  const fy = y - y0;
  const at = (dx: number, dy: number, c: number): number =>
    table.data[((y0 + dy) * table.width + x0 + dx) * 4 + c] ?? 0;
  return perChannel(
    (c) =>
      (at(0, 0, c) * (1 - fx) + at(1, 0, c) * fx) * (1 - fy) +
      (at(0, 1, c) * (1 - fx) + at(1, 1, c) * fx) * fy,
  );
};

const once = <T>(make: () => T): (() => T) => {
  let made: { value: T } | null = null;
  return () => (made ??= { value: make() }).value;
};

/** What reaches radius r from outside the air along cosine mu, by `transmittanceUv`. */
export const transmittanceTable = once(() =>
  tableOf(TRANSMITTANCE_SIZE, (u, v) => {
    const { r, mu } = rayOfUv(u, v);
    const depth = opticalDepthToTop(r, mu);
    return perChannel((c) => Math.exp(-depth[c]));
  }),
);

/** The share of the sun's light that reaches radius `r` when its cosine there is `mu`. */
export const sunTransmittance = (r: number, mu: number): Rgb => {
  if (toGround(r, mu) !== null) return [0, 0, 0];
  return sampleTable(transmittanceTable(), ...transmittanceUv(r, mu));
};

/** The step of a march from radius `r` along cosine `mu`, `t` km out. */
const along = (r: number, mu: number, t: number): number =>
  Math.sqrt(Math.max(0, t * t + 2 * r * mu * t + r * r));

export const ISOTROPIC = 1 / (4 * Math.PI);

type March = { light: Rgb; through: Rgb };

/**
 * Light scattered toward the start of a ray from radius `r`, cosine `mu`, over
 * `reach` km in `steps` slices growing with distance, under a sun of unit
 * irradiance at cosine `sun` there and `between` to the ray. `source` gives
 * what a slice at a radius and sun cosine sends along the ray per kilometre,
 * and is told what a unit of it weighs at the ray's start.
 */
export const march = (
  { r, mu, sun, between }: Record<'r' | 'mu' | 'sun' | 'between', number>,
  reach: number,
  steps: number,
  source: (radius: number, sunCosine: number, weigh: Rgb) => Rgb,
): March => {
  const light = [0, 0, 0];
  const through = [1, 1, 1];
  let before = 0;
  for (let i = 0; i < steps; i++) {
    const after = reach * ((i + 1) / steps) ** 2;
    const width = after - before;
    const t = before + width * 0.5;
    before = after;
    const radius = along(r, mu, t);
    const e = extinctionAt(Math.max(0, radius - RG));
    // What a unit of source in this slice adds at the ray's start, the slice
    // dimming its own light as it goes: Hillaire's closed form.
    const kept = perChannel((c) => Math.exp(-e[c] * width));
    const weigh = perChannel(
      (c) => ((through[c] ?? 0) * (1 - kept[c])) / Math.max(e[c], 1e-9),
    );
    const s = source(radius, (r * sun + t * between) / radius, weigh);
    for (const c of [0, 1, 2] as const) {
      light[c] = (light[c] ?? 0) + weigh[c] * s[c];
      through[c] = (through[c] ?? 0) * kept[c];
    }
  }
  return {
    light: perChannel((c) => light[c] ?? 0),
    through: perChannel((c) => through[c] ?? 0),
  };
};

/** How far a ray from radius `r` along cosine `mu` runs, and whether it ends on the ground. */
export const rayEnd = (
  r: number,
  mu: number,
): { reach: number; lands: boolean } => {
  const ground = toGround(r, mu);
  return ground === null
    ? { reach: toTop(r, mu), lands: false }
    : { reach: ground, lands: true };
};

/** What the matte sea at the ground sends up under a unit sun at cosine `sun`. */
export const groundGlow = (sun: number): Rgb => {
  const lit = sunTransmittance(RG, sun);
  return perChannel(
    (c) => (ATMOSPHERE.albedo[c] * lit[c] * Math.max(0, sun)) / Math.PI,
  );
};

const SCATTER_DIRECTIONS = 6;
const SCATTER_STEPS = 16;

/**
 * Hillaire's multiple scattering: the light a point `h` up under a sun at
 * cosine `sun` gets from every order of scattering past the first, as an
 * isotropic radiance per unit of sun irradiance.
 */
const multipleScattering = (r: number, sun: number): Rgb => {
  const second = [0, 0, 0];
  const share = [0, 0, 0];
  const count = SCATTER_DIRECTIONS * SCATTER_DIRECTIONS;
  for (let i = 0; i < SCATTER_DIRECTIONS; i++) {
    for (let j = 0; j < SCATTER_DIRECTIONS; j++) {
      const mu = 1 - (2 * (i + 0.5)) / SCATTER_DIRECTIONS;
      // Half a turn: the two hands of the sun's plane scatter alike.
      const turn = (Math.PI * (j + 0.5)) / SCATTER_DIRECTIONS;
      const between =
        mu * sun +
        Math.sqrt(Math.max(0, (1 - mu * mu) * (1 - sun * sun))) *
          Math.cos(turn);
      const { reach, lands } = rayEnd(r, mu);
      // One march carries both sums: the sunlit share in `light`'s place
      // would need a second pass, so the unlit one rides in a closure.
      const any = [0, 0, 0];
      const lit = march(
        { r, mu, sun, between },
        reach,
        SCATTER_STEPS,
        (radius, sunCosine, weigh) => {
          const s = scatteringAt(radius - RG);
          const t = sunTransmittance(radius, sunCosine);
          for (const c of [0, 1, 2] as const) {
            any[c] = (any[c] ?? 0) + weigh[c] * (s.rayleigh[c] + s.mie[c]);
          }
          return perChannel(
            (c) => (s.rayleigh[c] + s.mie[c]) * t[c] * ISOTROPIC,
          );
        },
      );
      const glow = lands
        ? groundGlow((r * sun + reach * between) / RG)
        : ([0, 0, 0] as const);
      for (const c of [0, 1, 2] as const) {
        second[c] =
          (second[c] ?? 0) + (lit.light[c] + lit.through[c] * glow[c]) / count;
        share[c] = (share[c] ?? 0) + (any[c] ?? 0) / count;
      }
    }
  }
  return perChannel(
    (c) => (second[c] ?? 0) / (1 - Math.min(0.95, share[c] ?? 0)),
  );
};

/**
 * The sun cosines the scatter table spans. The sun stands 9° up at the eye,
 * and along any ray the eye can cast through the air it stays inside this.
 */
export const SCATTER_SUN = { low: -0.2, high: 0.5 } as const;

/** Where the scatter table holds radius `r` under a sun at cosine `sun`. */
export const scatterUv = (r: number, sun: number): [number, number] => [
  (sun - SCATTER_SUN.low) / (SCATTER_SUN.high - SCATTER_SUN.low),
  Math.sqrt(clamp01((r - RG) / (RT - RG))),
];

/** Multiple scattering, laid out by `scatterUv`: rows crowd toward the ground. */
export const scatterTable = once(() =>
  tableOf(SCATTER_SIZE, (u, v) =>
    multipleScattering(
      RG + 0.01 + v * v * (RT - RG - 0.02),
      SCATTER_SUN.low + u * (SCATTER_SUN.high - SCATTER_SUN.low),
    ),
  ),
);
