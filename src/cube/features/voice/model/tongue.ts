import { among, between, type Dice, diceOf, type Some, under } from './chance';
import { spelt } from './letters';
import type { Uttered, Word } from './line';
import { CONSONANTS, isVowel, type Phone, VOWELS } from './phone';

/** The deepest floor that speaks plain English. */
export const PLAIN_TO = 8;

/** The first floor whose words are its own. */
export const COINED_FROM = 20;

/** Floors past `COINED_FROM` until no English word is left. */
const COINED_OVER = 5;

/** The vowels a vowel drifts to: its neighbours in the mouth. */
const NEAR: Partial<Record<Phone, Some<Phone>>> = {
  iy: ['ih', 'ey'],
  ih: ['iy', 'eh'],
  eh: ['ih', 'ae'],
  ae: ['eh', 'aa'],
  aa: ['ae', 'ao'],
  ao: ['aa', 'ow'],
  uh: ['uw', 'ah'],
  uw: ['uh', 'ow'],
  ah: ['aa', 'ax'],
  ax: ['ah', 'ih'],
  er: ['ax', 'ah'],
  ey: ['iy', 'ay'],
  ay: ['oy', 'ey'],
  ow: ['uw', 'aw'],
  aw: ['ow', 'aa'],
  oy: ['ay', 'ow'],
};

/** The consonant a consonant bends into: made in the same place, or the same way. */
const KIN: Partial<Record<Phone, Phone>> = {
  p: 'b',
  b: 'p',
  t: 'd',
  d: 't',
  k: 'g',
  g: 'k',
  s: 'sh',
  sh: 's',
  z: 'zh',
  zh: 'z',
  f: 'th',
  th: 'f',
  v: 'dh',
  dh: 'v',
  l: 'r',
  r: 'l',
  m: 'n',
  n: 'ng',
  w: 'v',
  ch: 'jh',
  jh: 'ch',
};

/** How many of the consonants that bend at all a fully drifted floor bends. */
const BENT_SHARE = 0.45;

/**
 * A floor's accent: the same sound becomes the same other sound all over the
 * floor, `drift` of the vowels and under half as many of the consonants.
 */
function accentOf(dice: Dice, drift: number): (phone: Phone) => Phone {
  const turned = (phone: Phone): Phone => {
    const near = NEAR[phone];
    if (near) {
      return dice(`drift/${phone}`) < drift
        ? among(near, dice(`drift/${phone}/to`))
        : phone;
    }
    return dice(`bend/${phone}`) < drift * BENT_SHARE
      ? (KIN[phone] ?? phone)
      : phone;
  };
  const accent = new Map(
    [...VOWELS, ...CONSONANTS].map((phone) => [phone, turned(phone)]),
  );
  return (phone) => accent.get(phone) ?? phone;
}

const bent =
  (accent: (phone: Phone) => Phone) =>
  (word: Word): Word => {
    const sounds = word.sounds.map((sound) => ({
      ...sound,
      phone: accent(sound.phone),
    }));
    const same = sounds.every(
      ({ phone }, n) => phone === word.sounds[n]?.phone,
    );
    return same ? word : { spelling: spelt(sounds), sounds };
  };

/** The first `count` of `phones` in the order the floor's dice put them. */
const kept = (phones: readonly Phone[], dice: Dice, count: number): Phone[] =>
  phones
    .map((phone) => ({ phone, rank: dice(`has/${phone}`) }))
    .toSorted((a, b) => a.rank - b.rank)
    .slice(0, count)
    .map(({ phone }) => phone);

const LEANS = ['first', 'last', 'penult'] as const;

const GLIDES: ReadonlySet<Phone> = new Set(['w', 'y', 'r', 'l']);

/**
 * A floor's own language: which sounds it has, how it builds a syllable from
 * them, and which syllable a word leans on.
 */
function coinageOf(dice: Dice): (word: Word) => Word {
  const consonants = kept(CONSONANTS, dice, between(6, 11, dice('consonants')));
  const vowels = kept(VOWELS, dice, between(3, 6, dice('vowels')));
  const onset = 0.55 + 0.4 * dice('onset');
  const coda = 0.1 + 0.5 * dice('coda');
  const cluster = 0.4 * dice('cluster');
  const lean = among(LEANS, dice('lean'));
  const one = (phones: readonly Phone[], draw: number): Phone =>
    phones[Math.floor(draw * phones.length)] ?? 'ax';

  const glides = consonants.filter((phone) => GLIDES.has(phone));

  // A second consonant only after a first, and only one that glides into the
  // vowel: any other pair is two syllables' worth of mouth.
  const syllable = (rolls: Dice, vowel: Uttered): Uttered[] => {
    const first =
      rolls('onset') < onset ? one(consonants, rolls('c')) : undefined;
    const second =
      first &&
      !GLIDES.has(first) &&
      glides.length > 0 &&
      rolls('cluster') < cluster
        ? one(glides, rolls('cc'))
        : undefined;
    return [
      ...(first ? [{ phone: first }] : []),
      ...(second ? [{ phone: second }] : []),
      vowel,
      ...(rolls('coda') < coda ? [{ phone: one(consonants, rolls('k')) }] : []),
    ];
  };

  return (word) => {
    const nuclei = word.sounds.filter(({ phone }) => isVowel(phone));
    const count = Math.max(1, nuclei.length);
    const leant = { first: 0, last: count - 1, penult: Math.max(0, count - 2) };
    const rolls = under(dice, `coin/${word.spelling.toLowerCase()}`);
    const sounds = Array.from({ length: count }, (_, n) => {
      const { note, beats } = nuclei[n] ?? {};
      return syllable(under(rolls, String(n)), {
        phone: one(vowels, rolls(`${n}/v`)),
        ...(n === leant[lean] && { stress: true }),
        ...(note !== undefined && { note }),
        ...(beats !== undefined && { beats }),
      });
    }).flat();
    return { spelling: spelt(sounds), sounds };
  };
}

const plain = (word: Word): Word => word;

/**
 * How floor `n` says a word: plain English to `PLAIN_TO`; then an accent that
 * thickens floor by floor; from `COINED_FROM` a language of the floor's own,
 * the same word for the same English word wherever it is said there, with the
 * last bent English gone a few floors on.
 */
export function tongueOf(n: number): (word: Word) => Word {
  if (n <= PLAIN_TO) return plain;
  const dice = diceOf(n);
  const drift = Math.min(1, (n - PLAIN_TO) / (COINED_FROM - PLAIN_TO));
  const accented = bent(accentOf(dice, drift));
  if (n < COINED_FROM) return accented;
  const coined = coinageOf(dice);
  const share = 0.5 + (0.5 * (n - COINED_FROM)) / COINED_OVER;
  return (word) =>
    dice(`coins/${word.spelling.toLowerCase()}`) < share
      ? coined(word)
      : accented(word);
}
