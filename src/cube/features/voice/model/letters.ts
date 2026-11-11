import type { Uttered } from './line';
import { isVowel, type Phone } from './phone';

/**
 * Spellings and what they say, the longer before the shorter they begin with:
 * a word is read by the first that matches where the reading stands.
 */
const READINGS: ReadonlyArray<readonly [string, readonly Phone[]]> = [
  ['tion', ['sh', 'ax', 'n']],
  ['ough', ['ow']],
  ['igh', ['ay']],
  ['tch', ['ch']],
  ['th', ['th']],
  ['sh', ['sh']],
  ['ch', ['ch']],
  ['ph', ['f']],
  ['wh', ['w']],
  ['ck', ['k']],
  ['ng', ['ng']],
  ['qu', ['k', 'w']],
  ['ee', ['iy']],
  ['ea', ['iy']],
  ['oo', ['uw']],
  ['ou', ['aw']],
  ['ow', ['ow']],
  ['oi', ['oy']],
  ['oy', ['oy']],
  ['ai', ['ey']],
  ['ay', ['ey']],
  ['au', ['ao']],
  ['aw', ['ao']],
  ['ar', ['aa', 'r']],
  ['or', ['ao', 'r']],
  ['er', ['er']],
  ['ir', ['er']],
  ['ur', ['er']],
  ['ce', ['s', 'eh']],
  ['ci', ['s', 'ih']],
  ['a', ['ae']],
  ['b', ['b']],
  ['c', ['k']],
  ['d', ['d']],
  ['e', ['eh']],
  ['f', ['f']],
  ['g', ['g']],
  ['h', ['hh']],
  ['i', ['ih']],
  ['j', ['jh']],
  ['k', ['k']],
  ['l', ['l']],
  ['m', ['m']],
  ['n', ['n']],
  ['o', ['aa']],
  ['p', ['p']],
  ['q', ['k']],
  ['r', ['r']],
  ['s', ['s']],
  ['t', ['t']],
  ['u', ['ah']],
  ['v', ['v']],
  ['w', ['w']],
  ['x', ['k', 's']],
  ['y', ['iy']],
  ['z', ['z']],
];

/** What a vowel letter says when a silent `e` closes its syllable. */
const LONG: Readonly<Record<string, Phone>> = {
  a: 'ey',
  e: 'iy',
  i: 'ay',
  o: 'ow',
  u: 'uw',
};

/** A vowel letter, one consonant letter and a final `e`: "same", "fine". */
const SILENT_E = /^(?<head>[a-z]*)(?<vowel>[aeiou])(?<last>[^aeiouwy])e$/;

const readingAt = (letters: string, at: number) =>
  READINGS.find(([spelling]) => letters.startsWith(spelling, at));

function phonesOf(letters: string): Phone[] {
  const phones: Phone[] = [];
  let at = letters.startsWith('y') ? 1 : 0;
  if (at === 1) phones.push('y');
  while (at < letters.length) {
    const reading = readingAt(letters, at);
    if (reading) phones.push(...reading[1]);
    at += reading ? reading[0].length : 1;
  }
  // A doubled letter says its sound once.
  return phones.filter((phone, n) => isVowel(phone) || phone !== phones[n - 1]);
}

function read(letters: string): Phone[] {
  const silent = SILENT_E.exec(letters)?.groups;
  if (!silent) return phonesOf(letters);
  const { head = '', vowel = '', last = '' } = silent;
  return [...phonesOf(head), LONG[vowel] ?? 'ax', ...phonesOf(last)];
}

/**
 * A word nobody wrote down the sound of, read off its letters by the commonest
 * English habits and leaning on its first vowel.
 */
export function sounded(word: string): Uttered[] {
  const phones = read(word.toLowerCase().replaceAll(/[^a-z]/g, ''));
  const stressed = phones.findIndex((phone) => isVowel(phone));
  return phones.map((phone, n) =>
    n === stressed ? { phone, stress: true } : { phone },
  );
}

const SPELLINGS: Record<Phone, string> = {
  iy: 'ee',
  ih: 'i',
  eh: 'e',
  ae: 'a',
  aa: 'ah',
  ao: 'aw',
  uh: 'u',
  uw: 'oo',
  ah: 'u',
  ax: 'a',
  er: 'ur',
  ey: 'ay',
  ay: 'ai',
  ow: 'o',
  aw: 'ow',
  oy: 'oi',
  w: 'w',
  y: 'y',
  r: 'r',
  l: 'l',
  m: 'm',
  n: 'n',
  ng: 'ng',
  f: 'f',
  v: 'v',
  th: 'th',
  dh: 'dh',
  s: 's',
  z: 'z',
  sh: 'sh',
  zh: 'zh',
  hh: 'h',
  p: 'p',
  b: 'b',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  ch: 'ch',
  jh: 'j',
  pau: '',
};

/** How a word that has no spelling is written down from its sound. */
export const spelt = (sounds: readonly Uttered[]): string =>
  sounds.map(({ phone }) => SPELLINGS[phone]).join('');
