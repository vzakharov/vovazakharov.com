import type { Line, Uttered } from './line';
import {
  type Band,
  type Formants,
  type Manner,
  type PhoneSpec,
  SPECS,
} from './phone';
import type { Voice } from './voice';

/** What the synthesizer is steered by, each a curve over the line. */
export const CURVES = [
  'f1',
  'f2',
  'f3',
  'damp',
  'voicing',
  'breath',
  'hiss',
  'hissCentre',
  'hissWidth',
  'semitones',
] as const;

export type Curve = (typeof CURVES)[number];

/** Seconds between two frames of a track. */
export const FRAME = 0.001;

/** A line laid out in time: every curve's value at every frame. */
export type Track = { frames: number; curves: Record<Curve, Float32Array> };

type Key = readonly [at: number, value: number];

/**
 * How loud each source is, and how many times wider than a vowel's the
 * resonances over the first ring: a murmur's are wide, so only the first sounds.
 */
type Level = { voicing: number; breath: number; hiss: number; damp: number };

/** A stretch of a phone over which its levels hold. */
type Piece = Level & { seconds: number; ramp: number; band?: Band };

const QUIET: Level = { voicing: 0, breath: 0, hiss: 0, damp: 1 };

type Around = { before?: PhoneSpec; after?: PhoneSpec };

const voices = (spec?: PhoneSpec): boolean =>
  spec?.manner === 'vowel' || spec?.manner === 'approximant';

const VELARS: ReadonlySet<PhoneSpec> = new Set([SPECS.k, SPECS.g]);

/** A velar's burst sits just over the second resonance of what follows. */
const bandOf = (spec: PhoneSpec, { after }: Around): Band | undefined =>
  VELARS.has(spec) && after && voices(after)
    ? {
        centre: Math.min(2800, Math.max(1300, after.formants[1] * 1.1)),
        width: 900,
      }
    : spec.hiss;

const held =
  (level: Partial<Level>, ramp: number) =>
  (_: PhoneSpec, seconds: number): Piece[] => [
    { ...QUIET, ...level, seconds, ramp },
  ];

const closure = (spec: PhoneSpec, seconds: number): Piece => ({
  ...QUIET,
  voicing: spec.voiced ? 0.18 : 0,
  damp: 4,
  seconds,
  ramp: 0.008,
});

const hissed = (
  spec: PhoneSpec,
  around: Around,
  seconds: number,
  ramp: number,
  voicing: number,
): Piece => {
  const band = bandOf(spec, around);
  return {
    ...QUIET,
    hiss: spec.hiss?.level ?? 0,
    voicing: spec.voiced ? voicing : 0,
    seconds,
    ramp,
    ...(band && { band }),
  };
};

/** The air let go after a voiceless stop, longest before a vowel. */
const puff = ({ before, after }: Around): Piece => {
  const open = voices(after);
  const brief = before === SPECS.s;
  return {
    ...QUIET,
    breath: open ? 0.7 : 0.35,
    damp: 1.6,
    seconds: open && !brief ? 0.04 : 0.02,
    ramp: 0.006,
  };
};

const PIECES: Record<
  Manner,
  (spec: PhoneSpec, seconds: number, around: Around) => Piece[]
> = {
  vowel: held({ voicing: 1 }, 0.012),
  approximant: held({ voicing: 0.8 }, 0.012),
  nasal: held({ voicing: 0.8, damp: 14 }, 0.006),
  breath: held({ breath: 0.8, damp: 1.6 }, 0.015),
  pause: held({}, 0.01),
  fricative: (spec, seconds, around) => [
    {
      ...hissed(spec, around, seconds, 0.012, 0.4),
      damp: spec.voiced ? 1.5 : 1,
    },
  ],
  stop: (spec, seconds, around) => [
    closure(spec, seconds),
    hissed(spec, around, spec.voiced ? 0.008 : 0.012, 0.002, 0.3),
    ...(spec.voiced ? [] : [puff(around)]),
  ],
  affricate: (spec, seconds, around) => [
    closure(spec, seconds),
    hissed(spec, around, spec.voiced ? 0.055 : 0.075, 0.004, 0.3),
  ],
};

/** Seconds a beat of a sung vowel lasts at an unhurried pace. */
const BEAT = 0.45;

/** A phone with where it falls in the line. */
type Placed = {
  sound: Uttered;
  spec: PhoneSpec;
  from: number;
  pieces: readonly Piece[];
};

const lasting = (pieces: readonly Piece[]): number =>
  pieces.reduce((sum, { seconds }) => sum + seconds, 0);

/** How much longer an `l` or an `r` lasts with no vowel after it. */
const CODA = 1.6;

function secondsOf(
  sound: Uttered,
  spec: PhoneSpec,
  last: boolean,
  after?: PhoneSpec,
): number {
  if (spec.manner !== 'vowel') {
    const coda = spec.manner === 'approximant' && !voices(after);
    return (spec.ms / 1000) * (last ? 1.15 : 1) * (coda ? CODA : 1);
  }
  if (sound.beats !== undefined) return sound.beats * BEAT;
  return (spec.ms / 1000) * (sound.stress ? 1.2 : 0.85) * (last ? 1.35 : 1);
}

/** Silence before the first phone and after the last, where the throat rings out. */
const LEAD = 0.02;
const TAIL = 0.06;

function placed(line: Line, pace: number): Placed[] {
  const specs = line.phones.map(({ phone }) => SPECS[phone]);
  const lastVowel = specs.findLastIndex(({ manner }) => manner === 'vowel');
  let from = LEAD;
  return line.phones.map((sound, n) => {
    const spec = specs[n] ?? SPECS.pau;
    const seconds =
      secondsOf(sound, spec, lastVowel >= 0 && n >= lastVowel, specs[n + 1]) /
      pace;
    const pieces = PIECES[spec.manner](spec, seconds, {
      before: specs[n - 1],
      after: specs[n + 1],
    });
    const at = from;
    from += lasting(pieces);
    return { sound, spec, from: at, pieces };
  });
}

/** An `l` with no vowel after it, said with the tongue drawn back: "still". */
const DARK_L: Formants = [430, 800, 2700];

/** An `r` with no vowel after it, held like a vowel: "door". */
const VOWEL_R: Formants = [470, 1270, 1600];

/** How far a consonant's resonances lean from its locus to the vowel beside it. */
const LEAN = 0.4;

/** Where the resonances sit over a phone, or nowhere: breath takes its neighbours'. */
function aimOf(phones: readonly Placed[], n: number): Formants | undefined {
  const spec = phones[n]?.spec;
  if (!spec || spec.manner === 'breath' || spec.manner === 'pause') {
    return undefined;
  }
  const after = phones[n + 1]?.spec;
  if (spec === SPECS.l && !voices(after)) return DARK_L;
  if (spec === SPECS.r && !voices(after)) return VOWEL_R;
  if (voices(spec)) return spec.formants;
  const before = phones[n - 1]?.spec;
  const beside = voices(after)
    ? after?.formants
    : voices(before)
      ? (before?.glide ?? before?.formants)
      : undefined;
  const [f1, f2, f3] = spec.formants;
  if (!beside) return spec.formants;
  return [f1, f2 + LEAN * (beside[1] - f2), f3 + LEAN * (beside[2] - f3)];
}

const nasal = (phone?: Placed): boolean => phone?.spec.manner === 'nasal';

/**
 * The part of a phone, as shares of its length, resonance `band` holds still
 * over. Beside a nasal the first resonance crosses at once, as it does when
 * the nose shuts: a slow crossing is heard as an `l`.
 */
function plateau(
  phones: readonly Placed[],
  n: number,
  band: number,
): readonly [number, number] {
  const phone = phones[n];
  if (!phone) return [0, 1];
  const { spec, pieces } = phone;
  const first = band === 0;
  if (voices(spec)) {
    return [
      first && nasal(phones[n - 1]) ? 0.08 : 0.3,
      first && nasal(phones[n + 1]) ? 0.92 : 0.72,
    ];
  }
  if (spec.manner === 'nasal' && first) return [0.03, 0.97];
  const [shut, burst] = pieces;
  if (spec.manner === 'stop' && shut && burst) {
    const whole = lasting(pieces);
    return [
      (0.1 * shut.seconds) / whole,
      (shut.seconds + burst.seconds) / whole,
    ];
  }
  return [0.15, 0.85];
}

function formantKeys(phones: readonly Placed[], band: 0 | 1 | 2): Key[] {
  return phones.flatMap((phone, n): Key[] => {
    const aim = aimOf(phones, n);
    if (!aim) return [];
    const whole = lasting(phone.pieces);
    const at = (share: number) => phone.from + share * whole;
    const [from, to] = plateau(phones, n, band);
    const { glide } = phone.spec;
    if (glide) {
      return [
        [at(Math.min(from, 0.2)), aim[band]],
        [at(0.45), aim[band]],
        [at(Math.max(to, 0.9)), glide[band]],
      ];
    }
    return [
      [at(from), aim[band]],
      [at(to), aim[band]],
    ];
  });
}

/** Semitones the pitch stands over the voice's own as a line starts and ends. */
const TOP = 1.5;
const BOTTOM = -2.5;
const ACCENT = 2.5;

function pitchKeys(
  phones: readonly Placed[],
  line: Line,
  lilt: number,
  whole: number,
): Key[] {
  const sway = line.tune === 'flat' ? 0 : lilt;
  const last = phones.findLastIndex(({ spec }) => spec.manner === 'vowel');
  return phones.flatMap(({ sound, spec, from, pieces }, n): Key[] => {
    if (spec.manner !== 'vowel') return [];
    const seconds = lasting(pieces);
    if (sound.note !== undefined) {
      return [
        [from, sound.note],
        [from + seconds, sound.note],
      ];
    }
    const drift = TOP + (BOTTOM - TOP) * (from / whole);
    const level = sway * (drift + (sound.stress ? ACCENT : 0));
    if (n !== last) return [[from + seconds / 2, level]];
    return line.tune === 'rise'
      ? [
          [from + 0.2 * seconds, level - sway],
          [from + seconds, level + 7 * Math.max(sway, 0.5)],
        ]
      : [
          [from + 0.3 * seconds, level],
          [from + seconds, level - 4 * sway],
        ];
  });
}

/** Keys that cross from each piece's level to the next over the shorter ramp. */
function levelKeys(
  pieces: readonly Piece[],
  level: (piece: Piece) => number,
): Key[] {
  const keys: Key[] = [];
  let at = 0;
  for (const [n, piece] of pieces.entries()) {
    const before = pieces[n - 1];
    if (before) {
      const edge = Math.min(
        piece.ramp,
        piece.seconds / 2,
        before.ramp,
        before.seconds / 2,
      );
      keys.push([at - edge, level(before)], [at + edge, level(piece)]);
    }
    at += piece.seconds;
  }
  return keys;
}

function bandKeys(
  pieces: readonly Piece[],
  side: (band: Band) => number,
): Key[] {
  const keys: Key[] = [];
  let at = 0;
  for (const { band, seconds } of pieces) {
    if (band) keys.push([at, side(band)], [at + seconds, side(band)]);
    at += seconds;
  }
  return keys;
}

/** `keys` read at every frame: straight lines between them, level beyond. */
function sampled(
  keys: readonly Key[],
  frames: number,
  fallback: number,
): Float32Array {
  const curve = new Float32Array(frames).fill(keys[0]?.[1] ?? fallback);
  let next = 0;
  for (let frame = 0; frame < frames; frame += 1) {
    const at = frame * FRAME;
    while (next < keys.length && (keys[next]?.[0] ?? 0) <= at) next += 1;
    const [from, low] = keys[next - 1] ?? keys[0] ?? [0, fallback];
    const [to, high] = keys[next] ?? [from, low];
    curve[frame] =
      to > from ? low + ((high - low) * (at - from)) / (to - from) : low;
  }
  return curve;
}

const BANDS = { f1: 0, f2: 1, f3: 2 } as const;

/**
 * `line` as `voice` says it, laid out in time: each phone's length at the
 * voice's pace, the resonances gliding between phones, each source's level,
 * and the pitch the line's tune and the voice's lilt give it.
 */
export function trackOf(line: Line, voice: Voice): Track {
  const phones = placed(line, voice.pace);
  const quiet = (seconds: number): Piece => ({ ...QUIET, seconds, ramp: 0.01 });
  const pieces = [
    quiet(LEAD),
    ...phones.flatMap((phone) => phone.pieces),
    quiet(TAIL),
  ];
  const whole = lasting(pieces);
  const frames = Math.ceil(whole / FRAME);
  const formant = (curve: keyof typeof BANDS, fallback: number) =>
    sampled(
      formantKeys(phones, BANDS[curve]).map(
        ([at, hertz]): Key => [at, hertz * voice.tract],
      ),
      frames,
      fallback * voice.tract,
    );
  const level = (pick: (piece: Piece) => number, fallback: number) =>
    sampled(levelKeys(pieces, pick), frames, fallback);
  return {
    frames,
    curves: {
      f1: formant('f1', 500),
      f2: formant('f2', 1500),
      f3: formant('f3', 2500),
      damp: level((piece) => piece.damp, 1),
      voicing: level((piece) => piece.voicing, 0),
      breath: level((piece) => piece.breath, 0),
      hiss: level((piece) => piece.hiss, 0),
      hissCentre: sampled(
        bandKeys(pieces, (band) => band.centre),
        frames,
        3000,
      ),
      hissWidth: sampled(
        bandKeys(pieces, (band) => band.width),
        frames,
        2000,
      ),
      semitones: sampled(pitchKeys(phones, line, voice.lilt, whole), frames, 0),
    },
  };
}
