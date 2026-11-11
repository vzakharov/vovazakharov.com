import { sounded } from './letters';
import type { Uttered, Word } from './line';
import { isPhone } from './phone';

/**
 * How the words of the scripted lines sound: phones apart by spaces, a `1`
 * after the vowel the word leans on. English spelling says too little about
 * its sound for these to be left to `sounded`.
 */
export const LEXICON: Readonly<Record<string, string>> = {
  a: 'ax',
  again: 'ax g eh1 n',
  ah: 'aa1',
  am: 'ae m',
  and: 'ae n d',
  anyone: 'eh1 n iy w ah n',
  back: 'b ae1 k',
  before: 'b ih f ao1 r',
  built: 'b ih1 l t',
  carpet: 'k aa1 r p ax t',
  come: 'k ah1 m',
  course: 'k ao1 r s',
  deep: 'd iy1 p',
  does: 'd ah z',
  door: 'd ao1 r',
  eight: 'ey1 t',
  everyone: 'eh1 v r iy w ah n',
  fine: 'f ay1 n',
  five: 'f ay1 v',
  four: 'f ao1 r',
  go: 'g ow1',
  goes: 'g ow1 z',
  going: 'g ow1 ih ng',
  ha: 'hh aa1',
  hello: 'hh ax l ow1',
  here: 'hh iy1 r',
  how: 'hh aw1',
  huh: 'hh ah1',
  hup: 'hh ah1 p',
  i: 'ay1',
  is: 'ih z',
  it: 'ih t',
  la: 'l aa1',
  left: 'l eh1 f t',
  light: 'l ay1 t',
  loo: 'l uw1',
  me: 'm iy1',
  mm: 'm m m',
  more: 'm ao1 r',
  nice: 'n ay1 s',
  nine: 'n ay1 n',
  no: 'n ow1',
  not: 'n aa1 t',
  of: 'ax v',
  oh: 'ow1',
  okay: 'ow k ey1',
  on: 'aa1 n',
  one: 'w ah1 n',
  oof: 'uw1 f',
  or: 'ao r',
  ow: 'aw1',
  quiet: 'k w ay1 ax t',
  right: 'r ay1 t',
  room: 'r uw1 m',
  same: 's ey1 m',
  seriously: 's iy1 r iy ax s l iy',
  seven: 's eh1 v ax n',
  six: 's ih1 k s',
  smaller: 's m ao1 l er',
  so: 's ow1',
  someone: 's ah1 m w ah n',
  still: 's t ih1 l',
  sure: 'sh uh1 r',
  that: 'dh ae1 t',
  the: 'dh ax',
  there: 'dh eh1 r',
  this: 'dh ih1 s',
  three: 'th r iy1',
  two: 't uw1',
  was: 'w ah z',
  way: 'w ey1',
  we: 'w iy',
  what: 'w ah1 t',
  where: 'w eh1 r',
  who: 'hh uw1',
  why: 'w ay1',
  wtf: 'w ah1 t dh ax f ah1 k',
  yeah: 'y ae1',
  zero: 'z iy1 r ow',
};

function parsed(entry: string): Uttered[] {
  return entry.split(' ').map((token) => {
    const stress = token.endsWith('1');
    const phone = stress ? token.slice(0, -1) : token;
    if (!isPhone(phone)) throw new Error(`Not a phone: ${token}`);
    return stress ? { phone, stress } : { phone };
  });
}

/** A written word with its sound: the lexicon's, or read off its letters. */
export function worded(spelling: string): Word {
  const entry = LEXICON[spelling.toLowerCase()];
  return { spelling, sounds: entry ? parsed(entry) : sounded(spelling) };
}
