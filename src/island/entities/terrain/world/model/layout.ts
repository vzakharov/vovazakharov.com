/** The highest harmonic per axis: `|kx|, |ky| ≤ K`, waves down to ~80 km. */
export const K = 128;

/** The dome's words, in order: words 0–4. */
export const DOME_PARAMS = [
  'centreX',
  'centreY',
  'radiusA',
  'radiusB',
  'turn',
] as const;
export type DomeParam = (typeof DOME_PARAMS)[number];

/** The per-tile noise seed's word, read raw. */
export const SEED_WORD = DOME_PARAMS.length;

/** Each harmonic's two words, in this order. */
const HARMONIC_PARTS = ['phase', 'factor'] as const;
export type HarmonicPart = (typeof HARMONIC_PARTS)[number];

const FIRST_HARMONIC_WORD = SEED_WORD + 1;
const ROW = 2 * K + 1;

/**
 * The harmonics of the half-plane — `ky > 0`, or `ky = 0` and `kx ≥ 0` —
 * `k = 0` included: the `ky = 0` row from `kx = 0` up, then each row `ky ≥ 1`
 * from `kx = −K` up.
 */
export const HARMONIC_COUNT = K + 1 + K * ROW;

/** Every word a world has. */
export const WORD_COUNT =
  FIRST_HARMONIC_WORD + HARMONIC_PARTS.length * HARMONIC_COUNT;

/** An integer wave vector, cycles per side of the world's square. */
export type Wavevector = { kx: number; ky: number };

/** Harmonic `h`'s wave vector, `h` in `[0, HARMONIC_COUNT)`. */
export function wavevectorOf(h: number): Wavevector {
  if (!Number.isInteger(h) || h < 0 || h >= HARMONIC_COUNT) {
    throw new RangeError(`No harmonic ${h}`);
  }
  if (h <= K) return { kx: h, ky: 0 };
  const rest = h - (K + 1);
  return { kx: (rest % ROW) - K, ky: Math.floor(rest / ROW) + 1 };
}

/** The harmonic of wave vector `k`, which must lie in the half-plane. */
export function harmonicOf({ kx, ky }: Wavevector): number {
  const inSquare =
    Number.isInteger(kx) &&
    Number.isInteger(ky) &&
    Math.abs(kx) <= K &&
    ky <= K;
  if (!inSquare || ky < 0 || (ky === 0 && kx < 0)) {
    throw new RangeError(`No harmonic at (${kx}, ${ky})`);
  }
  return ky === 0 ? kx : K + 1 + (ky - 1) * ROW + kx + K;
}

/** What a word stands for. */
export type WordMeaning =
  | { kind: 'dome'; param: DomeParam }
  | { kind: 'seed' }
  | (Wavevector & { kind: 'harmonic'; part: HarmonicPart });

/** The word index of harmonic `h`'s `part`. */
export const harmonicWord = (h: number, part: HarmonicPart) =>
  FIRST_HARMONIC_WORD +
  HARMONIC_PARTS.length * h +
  HARMONIC_PARTS.indexOf(part);

/** What word `i` stands for, `i` in `[0, WORD_COUNT)`. */
export function meaningOf(i: number): WordMeaning {
  if (!Number.isInteger(i) || i < 0 || i >= WORD_COUNT) {
    throw new RangeError(`No word ${i}`);
  }
  const param = DOME_PARAMS[i];
  if (param !== undefined) return { kind: 'dome', param };
  if (i === SEED_WORD) return { kind: 'seed' };
  const offset = i - FIRST_HARMONIC_WORD;
  const part = HARMONIC_PARTS[offset % HARMONIC_PARTS.length] ?? 'phase';
  const h = Math.floor(offset / HARMONIC_PARTS.length);
  return { kind: 'harmonic', part, ...wavevectorOf(h) };
}

/** The word index standing for `meaning`. */
export function wordOf(meaning: WordMeaning): number {
  switch (meaning.kind) {
    case 'dome': {
      return DOME_PARAMS.indexOf(meaning.param);
    }
    case 'seed': {
      return SEED_WORD;
    }
    case 'harmonic': {
      return harmonicWord(harmonicOf(meaning), meaning.part);
    }
    default: {
      const unhandled: never = meaning;
      throw new Error(`No word for ${JSON.stringify(unhandled)}`);
    }
  }
}
