import { among, type Dice, type Some, wholeBetween } from './chance';
import type { Line, Uttered } from './line';

/**
 * The visitor's own sounds: no words, only what a throat does on its own — a
 * breath, a hum, a vowel with the pitch going where a phrase's would.
 */
type Vocal = (dice: Dice) => { text: string; phones: readonly Uttered[] };

const breath = (beats: number, loud: number, ease = 0.08): Uttered => ({
  phone: 'hh',
  beats,
  loud,
  ease,
});

/** A voiced sound whose pitch goes from `note` to `slide` over `beats`. */
const voiced = (
  phone: Uttered['phone'],
  [note, slide]: readonly [number, number],
  beats: number,
  rest: Partial<Uttered> = {},
): Uttered => ({ phone, note, slide, beats, ...rest });

/** A startled question, asked twice, the second higher: "what the—?" */
const huh: Vocal = () => ({
  text: 'huh? huh?!',
  phones: [
    breath(0.2, 0.7, 0.03),
    voiced('ah', [-1, 8], 0.55),
    breath(0.5, 0.35, 0.12),
    { phone: 'pau', beats: 0.5 },
    breath(0.15, 0.8, 0.03),
    voiced('ah', [3, 13], 0.65),
    breath(0.6, 0.4, 0.15),
  ],
});

/** A long groan sinking into the air let out after it: "not this again". */
const groan: Vocal = (dice) => ({
  text: 'ugh…',
  phones: [
    voiced('ah', [2, -2], 0.5, { ease: 0.08 }),
    voiced('ax', [-2, -7 - 2 * dice('depth')], 1.1 + dice('long'), {
      ease: 0.25,
    }),
    breath(1.1, 0.6, 0.3),
  ],
});

/**
 * Coming to: a breath drawn, a low groan that wavers and sinks, and the air
 * let out after it.
 */
const stirring: Vocal = (dice) => ({
  text: 'mmh… ugh…',
  phones: [
    breath(0.5, 0.35, 0.2),
    voiced('m', [-3, -1], 0.6 + 0.4 * dice('hum'), { loud: 0.6, ease: 0.2 }),
    voiced('ax', [-1, -5], 0.7, { loud: 0.8, ease: 0.15 }),
    voiced('ah', [-4, -9 - 2 * dice('depth')], 1.2 + dice('long'), {
      ease: 0.3,
    }),
    breath(1.3, 0.5, 0.35),
  ],
});

const sigh: Vocal = (dice) => ({
  text: '(sigh)',
  phones: [breath(0.4, 0.5, 0.15), breath(1.3 + dice('long'), 0.9, 0.35)],
});

const exhale: Vocal = () => ({
  text: '(exhale)',
  phones: [breath(0.7, 0.5, 0.2)],
});

const hm: Vocal = () => ({
  text: 'hm.',
  phones: [breath(0.12, 0.5, 0.03), voiced('m', [1, -4], 0.7, { ease: 0.1 })],
});

const mm: Vocal = (dice) => ({
  text: 'mm',
  phones: [voiced('m', [-2, -6], 0.9 + dice('long'), { loud: 0.8, ease: 0.2 })],
});

const asked: Vocal = () => ({
  text: 'hm?',
  phones: [voiced('m', [-1, 6], 0.55, { ease: 0.06 })],
});

const pff: Vocal = () => ({
  text: 'pff',
  phones: [{ phone: 'p' }, { phone: 'f', beats: 1, loud: 1.6, ease: 0.15 }],
});

const tsk: Vocal = (dice) => ({
  text: 'tsk',
  phones: [
    { phone: 't' },
    { phone: 's', beats: 0.1 },
    { phone: 'pau', beats: 0.4 },
    ...sigh(dice).phones,
  ],
});

/** A laugh too short to mean it. */
const heh: Vocal = (dice) => {
  const count = wholeBetween(1, 2, dice('count'));
  return {
    text: Array.from({ length: count }, () => 'heh').join(' '),
    phones: Array.from({ length: count }, (_, n) => [
      breath(0.2, 0.9, 0.02),
      voiced('eh', [3 - 3 * n, 1 - 3 * n], 0.22, { loud: 0.8 }),
    ]).flat(),
  };
};

const oof: Vocal = () => ({
  text: 'oof',
  phones: [
    voiced('uh', [4, -3], 0.3),
    { phone: 'f', beats: 0.6, loud: 1.4, ease: 0.1 },
  ],
});

const hup: Vocal = () => ({
  text: 'hup',
  phones: [breath(0.12, 0.8, 0.02), voiced('ah', [5, 2], 0.2), { phone: 'p' }],
});

const mf: Vocal = () => ({
  text: 'mf',
  phones: [
    voiced('m', [2, -2], 0.3),
    { phone: 'f', beats: 0.35, loud: 1.3, ease: 0.06 },
  ],
});

const ah: Vocal = () => ({
  text: 'ah',
  phones: [voiced('aa', [3, -4], 0.35, { ease: 0.05 }), breath(0.4, 0.4, 0.12)],
});

/** Something hummed under the breath with a phrase's ups and downs. */
const hummed: Vocal = (dice) => {
  const count = wholeBetween(2, 5, dice('count'));
  const up = dice('asks') < 0.3;
  let pitch = wholeBetween(0, 3, dice('from'));
  const phones = Array.from({ length: count }, (_, n): Uttered[] => {
    const last = n === count - 1;
    const turn = last ? (up ? 6 : -5) : wholeBetween(-2, 2, dice(`turn/${n}`));
    const from = pitch;
    pitch += last ? turn : Math.round(turn / 2);
    return [
      voiced('m', [from, from], 0.14, { loud: 0.7 }),
      voiced('ax', [from, from + turn], last ? 0.5 : 0.28, {
        loud: 0.6,
        ease: 0.04,
      }),
    ];
  }).flat();
  return {
    text: `${Array.from({ length: count }, () => 'hm').join('-')}${up ? '?' : '…'}`,
    phones,
  };
};

/** A later shrink's sounds, from put out to worn out: the floor picks how far along. */
export const SHRINKS: Some<Vocal> = [
  asked,
  heh,
  groan,
  pff,
  tsk,
  hm,
  sigh,
  mm,
  exhale,
];

const LANDINGS: Some<Vocal> = [oof, hup, mf, ah, exhale];

const MUTTERS: Some<Vocal> = [hummed, hummed, hummed, hm, asked, sigh];

const line = ({ text, phones }: ReturnType<Vocal>): Line => ({
  text,
  phones,
  tune: 'flat',
});

export const waking = (dice: Dice): Line => line(stirring(dice));

export const firstShrink = (dice: Dice): Line => line(huh(dice));

export const secondShrink = (dice: Dice): Line => line(groan(dice));

export const landing = (dice: Dice): Line =>
  line(among(LANDINGS, dice('which'))(dice));

export const mutter = (dice: Dice): Line =>
  line(among(MUTTERS, dice('which'))(dice));

export const vocal = (sound: Vocal, dice: Dice): Line => line(sound(dice));
