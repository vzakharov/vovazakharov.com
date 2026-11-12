import type { Line, Uttered } from './line';
import { type Band, type Formants, type PhoneSpec, SPECS } from './phone';
import { lasting, type Piece, PIECES, quiet, voices } from './pieces';
import type { Voice } from './voice';

/** What the synthesizer is steered by, each a curve over the line. */
const CURVES = [
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
export const FRAME_SECONDS = 0.001;

/** A line laid out in time: every curve's value at every frame. */
export type Track = { ticks: number; curves: Record<Curve, Float32Array> };

type Key = readonly [at: number, value: number];

/** Seconds a beat of a sung vowel lasts at an unhurried pace. */
const BEAT = 0.45;

/** A phone with where it falls in the line. */
type Placed = {
  sound: Uttered;
  spec: PhoneSpec;
  starts: number;
  pieces: readonly Piece[];
};

/** How much longer an `l` or an `r` lasts with no vowel after it. */
const CODA = 1.6;

function secondsOf(
  sound: Uttered,
  spec: PhoneSpec,
  last: boolean,
  after?: PhoneSpec,
): number {
  if (sound.beats !== undefined) return sound.beats * BEAT;
  if (spec.manner !== 'vowel') {
    const coda = spec.manner === 'approximant' && !voices(after);
    return (spec.millis / 1000) * (last ? 1.15 : 1) * (coda ? CODA : 1);
  }
  const leant = sound.stress === true ? 1.2 : 0.85;
  return (spec.millis / 1000) * leant * (last ? 1.35 : 1);
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
      secondsOf(sound, spec, lastVowel !== -1 && n >= lastVowel, specs[n + 1]) /
      pace;
    const { loud = 1, ease = 0 } = sound;
    const pieces = PIECES[spec.manner](spec, seconds, {
      before: specs[n - 1],
      after: specs[n + 1],
    }).map((piece) => ({
      ...piece,
      voicing: piece.voicing * loud,
      breath: piece.breath * loud,
      hiss: piece.hiss * loud,
      melt: ease,
    }));
    const at = from;
    from += lasting(pieces);
    return { sound, spec, starts: at, pieces };
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
    const at = (share: number) => phone.starts + share * whole;
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
  return phones.flatMap(({ sound, spec, starts: from, pieces }, n): Key[] => {
    const seconds = lasting(pieces);
    if (sound.note !== undefined) {
      return [
        [from, sound.note],
        [from + seconds, sound.slide ?? sound.note],
      ];
    }
    if (spec.manner !== 'vowel') return [];
    const drift = TOP + (BOTTOM - TOP) * (from / whole);
    const level = sway * (drift + (sound.stress === true ? ACCENT : 0));
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
        Math.max(Math.min(piece.ramp, before.ramp), piece.melt, before.melt),
        piece.seconds / 2,
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
    const at = frame * FRAME_SECONDS;
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
  const phones = placed(line, voice.tempo);
  const said = phones.flatMap((phone) => phone.pieces);
  const pieces = [
    quiet(LEAD),
    ...said,
    quiet(Math.max(TAIL, 2 * (said.at(-1)?.melt ?? 0))),
  ];
  const whole = lasting(pieces);
  const frames = Math.ceil(whole / FRAME_SECONDS);
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
    ticks: frames,
    curves: {
      f1: formant('f1', 500),
      f2: formant('f2', 1500),
      f3: formant('f3', 2500),
      damp: level((piece) => piece.damp, 1),
      voicing: level((piece) => piece.voicing, 0),
      breath: level((piece) => piece.breath, 0),
      hiss: level((piece) => piece.hiss, 0),
      hissCentre: sampled(
        bandKeys(pieces, (band) => band.core),
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
