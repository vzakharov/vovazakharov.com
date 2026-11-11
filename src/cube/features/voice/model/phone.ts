/** The sounds the voice is made of, named as ARPAbet names them. */
export const PHONES = [
  'iy',
  'ih',
  'eh',
  'ae',
  'aa',
  'ao',
  'uh',
  'uw',
  'ah',
  'ax',
  'er',
  'ey',
  'ay',
  'ow',
  'aw',
  'oy',
  'w',
  'y',
  'r',
  'l',
  'm',
  'n',
  'ng',
  'f',
  'v',
  'th',
  'dh',
  's',
  'z',
  'sh',
  'zh',
  'hh',
  'p',
  'b',
  't',
  'd',
  'k',
  'g',
  'ch',
  'jh',
  'pau',
] as const;

export type Phone = (typeof PHONES)[number];

const MANNERS = [
  'vowel',
  'approximant',
  'nasal',
  'fricative',
  'stop',
  'affricate',
  'breath',
  'pause',
] as const;

export type Manner = (typeof MANNERS)[number];

/** The first three resonances of the throat, in hertz, for a grown man. */
export type Formants = readonly [number, number, number];

/** A band of noise, in hertz. */
export type Band = { centre: number; width: number };

/** The band a consonant hisses in, and how loud against a vowel. */
export type Hiss = Band & { level: number };

export type PhoneSpec = {
  manner: Manner;
  voiced: boolean;
  /**
   * Where the resonances sit: a vowel's or an approximant's own, and for any
   * other consonant the locus its neighbours' resonances bend toward.
   */
  formants: Formants;
  /** Where a diphthong ends up. */
  glide?: Formants;
  /** How long it lasts unhurried; a stop's is its closure. */
  ms: number;
  hiss?: Hiss;
};

const vowel = (
  f1: number,
  f2: number,
  f3: number,
  ms: number,
  glide?: Formants,
): PhoneSpec => ({
  manner: 'vowel',
  voiced: true,
  formants: [f1, f2, f3],
  ms,
  ...(glide && { glide }),
});

const LABIAL: Formants = [240, 900, 2200];
const ALVEOLAR: Formants = [240, 1700, 2700];
const PALATAL: Formants = [240, 2000, 2600];
const VELAR: Formants = [240, 2200, 2450];

const voicedAs = (manner: Manner, voiced: boolean) => ({ manner, voiced });

const HISS = {
  lip: { centre: 4000, width: 5000 },
  teeth: { centre: 4500, width: 4500 },
  ridge: { centre: 5200, width: 2200 },
  palate: { centre: 2700, width: 1300 },
  lipBurst: { centre: 1100, width: 2200 },
  ridgeBurst: { centre: 4300, width: 2600 },
  velumBurst: { centre: 2100, width: 1000 },
};

export const SPECS: Record<Phone, PhoneSpec> = {
  iy: vowel(270, 2290, 3010, 120),
  ih: vowel(390, 1990, 2550, 90),
  eh: vowel(530, 1840, 2480, 100),
  ae: vowel(660, 1720, 2410, 130),
  aa: vowel(730, 1090, 2440, 130),
  ao: vowel(570, 840, 2410, 130),
  uh: vowel(440, 1020, 2240, 90),
  uw: vowel(300, 870, 2240, 120),
  ah: vowel(640, 1190, 2390, 100),
  ax: vowel(500, 1500, 2500, 60),
  er: vowel(490, 1350, 1690, 120),
  ey: vowel(480, 1900, 2500, 170, [330, 2200, 2700]),
  ay: vowel(730, 1200, 2500, 180, [400, 2000, 2600]),
  ow: vowel(540, 1000, 2400, 170, [380, 800, 2300]),
  aw: vowel(730, 1250, 2500, 180, [430, 900, 2300]),
  oy: vowel(550, 850, 2400, 180, [380, 2000, 2600]),
  w: { ...voicedAs('approximant', true), formants: [290, 610, 2150], ms: 65 },
  y: { ...voicedAs('approximant', true), formants: [260, 2070, 3020], ms: 60 },
  r: { ...voicedAs('approximant', true), formants: [310, 1060, 1380], ms: 70 },
  l: { ...voicedAs('approximant', true), formants: [310, 1050, 2880], ms: 65 },
  m: { ...voicedAs('nasal', true), formants: [280, 900, 2200], ms: 75 },
  n: { ...voicedAs('nasal', true), formants: [280, 1700, 2700], ms: 70 },
  ng: { ...voicedAs('nasal', true), formants: [280, 2200, 2450], ms: 80 },
  f: {
    ...voicedAs('fricative', false),
    formants: LABIAL,
    ms: 95,
    hiss: { ...HISS.lip, level: 0.22 },
  },
  v: {
    ...voicedAs('fricative', true),
    formants: LABIAL,
    ms: 65,
    hiss: { ...HISS.lip, level: 0.12 },
  },
  th: {
    ...voicedAs('fricative', false),
    formants: ALVEOLAR,
    ms: 90,
    hiss: { ...HISS.teeth, level: 0.18 },
  },
  dh: {
    ...voicedAs('fricative', true),
    formants: ALVEOLAR,
    ms: 50,
    hiss: { ...HISS.teeth, level: 0.08 },
  },
  s: {
    ...voicedAs('fricative', false),
    formants: ALVEOLAR,
    ms: 110,
    hiss: { ...HISS.ridge, level: 1 },
  },
  z: {
    ...voicedAs('fricative', true),
    formants: ALVEOLAR,
    ms: 80,
    hiss: { ...HISS.ridge, level: 0.6 },
  },
  sh: {
    ...voicedAs('fricative', false),
    formants: PALATAL,
    ms: 115,
    hiss: { ...HISS.palate, level: 0.9 },
  },
  zh: {
    ...voicedAs('fricative', true),
    formants: PALATAL,
    ms: 80,
    hiss: { ...HISS.palate, level: 0.5 },
  },
  hh: { ...voicedAs('breath', false), formants: [500, 1500, 2500], ms: 70 },
  p: {
    ...voicedAs('stop', false),
    formants: LABIAL,
    ms: 60,
    hiss: { ...HISS.lipBurst, level: 0.5 },
  },
  b: {
    ...voicedAs('stop', true),
    formants: LABIAL,
    ms: 55,
    hiss: { ...HISS.lipBurst, level: 0.35 },
  },
  t: {
    ...voicedAs('stop', false),
    formants: ALVEOLAR,
    ms: 50,
    hiss: { ...HISS.ridgeBurst, level: 0.9 },
  },
  d: {
    ...voicedAs('stop', true),
    formants: ALVEOLAR,
    ms: 45,
    hiss: { ...HISS.ridgeBurst, level: 0.6 },
  },
  k: {
    ...voicedAs('stop', false),
    formants: VELAR,
    ms: 55,
    hiss: { ...HISS.velumBurst, level: 0.9 },
  },
  g: {
    ...voicedAs('stop', true),
    formants: VELAR,
    ms: 50,
    hiss: { ...HISS.velumBurst, level: 0.6 },
  },
  ch: {
    ...voicedAs('affricate', false),
    formants: PALATAL,
    ms: 40,
    hiss: { ...HISS.palate, level: 0.9 },
  },
  jh: {
    ...voicedAs('affricate', true),
    formants: PALATAL,
    ms: 35,
    hiss: { ...HISS.palate, level: 0.55 },
  },
  pau: { ...voicedAs('pause', false), formants: [500, 1500, 2500], ms: 180 },
};

export const isPhone = (name: string): name is Phone =>
  (PHONES as readonly string[]).includes(name);

export const isVowel = (phone: Phone): boolean =>
  SPECS[phone].manner === 'vowel';

export const VOWELS: readonly Phone[] = PHONES.filter(isVowel);

/** Every consonant, the pause left out. */
export const CONSONANTS: readonly Phone[] = PHONES.filter(
  (phone) => !isVowel(phone) && phone !== 'pau',
);
