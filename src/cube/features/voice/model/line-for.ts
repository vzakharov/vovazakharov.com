import { among, between, type Dice, diceOf, type Some, under } from './chance';
import { worded } from './lexicon';
import { type Line, PAUSE, type Tune, type Uttered, type Word } from './line';
import { isVowel } from './phone';
import { DIGITS, type Moment, SCRIPT, type Scripted } from './script';
import { tongueOf } from './tongue';

/** A word of a line, the punctuation after it, and whether a pause follows. */
type Token = { word: Word; mark: string; rest: boolean };

const TOKEN = /^(?<letters>[^?,.!]*)(?<mark>[?,.!]*)$/;

const tokens = (text: string): Token[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const { letters = raw, mark = '' } = TOKEN.exec(raw)?.groups ?? {};
      return { word: worded(letters), mark, rest: mark !== '' };
    });

function assembled(said: readonly Token[], tune?: Tune): Line {
  const text = said.map(({ word, mark }) => word.spelling + mark).join(' ');
  const phones = said.flatMap(({ word, rest }, n) =>
    rest && n < said.length - 1 ? [...word.sounds, PAUSE] : word.sounds,
  );
  return { text, phones, tune: tune ?? (text.endsWith('?') ? 'rise' : 'fall') };
}

const inTongue = (said: readonly Token[], n: number): Token[] => {
  const tongue = tongueOf(n);
  return said.map((token) => ({ ...token, word: tongue(token.word) }));
};

/**
 * `text` as floor `n` says it: its words from the lexicon or read off their
 * letters, then through the floor's tongue. A `?` at the end raises the pitch
 * there unless `tune` says otherwise.
 */
export const spoken = (text: string, n = 1, tune?: Tune): Line =>
  assembled(inTongue(tokens(text), n), tune);

/** How many of a list's lines a floor draws among. */
const WINDOW = 5;

/** The floor by which the visitor is as worn out as the lines get. */
const WORN_OUT_BY = 33;

/** One of `lines`, from further along the list the deeper the floor. */
function wearied(lines: Some<string>, n: number, draw: number): string {
  const span = Math.min(WINDOW, lines.length);
  const worn = Math.min(1, Math.max(0, (n - 3) / (WORN_OUT_BY - 3)));
  const from = Math.round(worn * (lines.length - span));
  return lines[from + Math.floor(draw * span)] ?? lines[0];
}

const scripted =
  (moment: Scripted) =>
  (n: number, dice: Dice): Line =>
    spoken(among(SCRIPT[moment], dice('line')), n);

/** `word` with every vowel sung at `note` for `beats`. */
const sung = (word: Word, note: number, beats: number): Word => ({
  ...word,
  sounds: word.sounds.map(
    (sound): Uttered =>
      isVowel(sound.phone) ? { ...sound, note, beats } : sound,
  ),
});

/** Five digits read out flat, a pause after each. */
function numbers(n: number, dice: Dice): Line {
  const said = Array.from({ length: 5 }, (_, at) => ({
    word: worded(among(DIGITS, dice(`digit/${at}`))),
    mark: '',
    rest: true,
  }));
  return assembled(inTongue(said, n), 'flat');
}

/** A few syllables stepping down, in no language: a laugh is a laugh. */
function laugh(_: number, dice: Dice): Line {
  const count = between(3, 6, dice('count'));
  const said = Array.from({ length: count }, (__, at) => ({
    word: sung(
      worded('ha'),
      8 - 2 * at + between(-1, 1, dice(`step/${at}`)),
      0.35,
    ),
    mark: '',
    rest: false,
  }));
  return assembled(said, 'flat');
}

/** The notes a lullaby walks over, in semitones: a pentatonic scale. */
const SCALE = [0, 2, 4, 7, 9, 12, 14] as const;

/** How a bar of three beats may be cut. */
const BARS: Some<readonly number[]> = [[2, 1], [1, 1, 1], [1, 2], [3]];

const STEPS: Some<number> = [-2, -1, -1, 0, 1, 1, 2];

/** Two bars in three, sung on the floor's own nonsense syllables. */
function lullaby(n: number, dice: Dice): Line {
  const beats = [0, 1].flatMap((bar) => among(BARS, dice(`bar/${bar}`)));
  let degree = between(2, 4, dice('from'));
  const said = beats.map((length, at) => {
    const step = among(STEPS, dice(`step/${at}`));
    degree = Math.min(SCALE.length - 1, Math.max(0, degree + step));
    const syllable = dice(`syllable/${at}`) < 0.6 ? 'la' : 'loo';
    return {
      word: sung(worded(syllable), SCALE[degree] ?? 0, length),
      mark: '',
      rest: false,
    };
  });
  return assembled(inTongue(said, n), 'flat');
}

const LINES: Record<Moment, (n: number, dice: Dice) => Line> = {
  'first-shrink': scripted('first-shrink'),
  'second-shrink': scripted('second-shrink'),
  shrink: (n, dice) => spoken(wearied(SCRIPT.shrink, n, dice('line')), n),
  landing: scripted('landing'),
  mutter: scripted('mutter'),
  hello: scripted('hello'),
  numbers,
  laugh,
  lullaby,
};

/**
 * What is said at `moment` on floor `n`, in the floor's tongue; `grain` — a
 * room's, or any other word two viewers share — picks among the variants.
 */
export const lineFor = (moment: Moment, n: number, grain: number): Line =>
  LINES[moment](n, under(diceOf(grain), `${n}/${moment}`));
