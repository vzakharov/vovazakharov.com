import type { Ranged, WithText } from '@/kernel/shared/typings';

import { CALL_SECONDS, CHANT, CHANT_SECONDS, VERSE_CALLS } from './calls';

/** One sung word: the published spelling and when it is sung. */
export type Word = Ranged & WithText;

/**
 * The lead vocal's words as `[text, from, to]`, a published line to an
 * array: the published lyrics' spelling on Whisper large-v3's timings, which
 * agree with the master's onsets to a frame through the first stanza and
 * with the vocal stem's to 0.2 s through the chorus. Where Whisper misheard
 * («Стирата не на паде») the published words share its span; where it heard
 * nothing, the span is read off its neighbours. «Не сдохнуть бы, как» closes
 * on a chanted «Хорошо» (`CHANT`), and the last «Хорошо!» is past the stem's
 * end, timed off the master alone.
 */
const SUNG: ReadonlyArray<ReadonlyArray<readonly [string, number, number]>> = [
  [
    ['Не', 0.6, 0.68],
    ['сдохнуть', 0.84, 1.32],
    ['бы', 1.4, 1.48],
    ['от', 1.68, 1.76],
    ['счастья', 1.88, 2.32],
  ],
  [
    ['В', 2.5, 2.62],
    ['серотонинопаде', 2.64, 4.36],
  ],
  [
    ['Здесь', 4.6, 4.84],
    ['есть', 4.96, 5.12],
    ['одно', 5.24, 5.44],
    ['ненастье', 5.64, 6.4],
  ],
  [
    ['И', 6.56, 6.6],
    ['то', 6.76, 6.84],
    ['лишь', 7.04, 7.24],
    ['рифмы', 7.36, 7.68],
    ['ради', 7.88, 8.32],
  ],
  [
    ['И', 8.52, 8.56],
    ['на', 8.72, 8.8],
    ['стене', 8.92, 9.28],
    ['дурдома', 9.48, 10.2],
  ],
  [
    ['Кто', 10.36, 10.52],
    ['б', 10.6, 10.64],
    ['не', 10.8, 10.88],
    ['подумал', 11.04, 11.52],
    ['шо', 11.68, 11.8],
  ],
  [
    ['Я', 12.4, 12.44],
    ['выскребу', 12.6, 13.2],
    ['три', 13.36, 13.48],
    ['слова', 13.64, 14.12],
  ],
  [
    ['Ногтём-', 14.32, 14.76],
    ['карандашом', 14.92, 15.8],
  ],
  [
    ['Как,', 16.12, 16.28],
    ['сука,', 16.6, 16.96],
    ['хорошо', 17.24, 17.88],
  ],
  [
    ['Когда', 28.28, 28.52],
    ['просыпаешься', 28.68, 29.28],
    ['ночью', 29.36, 29.64],
  ],
  [
    ['В', 30.08, 30.2],
    ['поту', 30.28, 30.6],
    ['прохладном', 30.8, 31.28],
    ['и', 31.36, 31.4],
    ['сочном', 31.52, 31.84],
  ],
  [
    ['И', 32.32, 32.36],
    ['призрачный', 32.48, 32.92],
    ['зайчик', 33.08, 33.4],
    ['с', 33.48, 33.52],
    ['обоев', 33.56, 34],
  ],
  [
    ['Погнаться', 34.36, 34.84],
    ['готов', 34.92, 35.24],
    ['за', 35.36, 35.44],
    ['тобою', 35.52, 35.8],
  ],
  [
    ['Даже', 36.52, 36.8],
    ['не', 36.92, 37],
    ['в', 37.08, 37.12],
    ['деревне', 37.2, 37.56],
    ['летом', 37.68, 38],
  ],
  [
    ['Ложка', 38.36, 38.68],
    ['новая', 38.84, 39.24],
    ['с', 39.36, 39.4],
    ['секретом', 39.52, 40],
  ],
  [
    ['И', 40.52, 40.56],
    ['все', 40.76, 40.88],
    ['отступают', 41, 41.48],
    ['напасти', 41.6, 42.12],
  ],
  [
    ['Так', 42.32, 42.44],
    ['хорошо-', 42.56, 42.88],
    ['шо-', 43.04, 43.16],
    ['шо', 43.32, 43.64],
    ['не', 43.68, 43.76],
    ['сдохнуть', 43.88, 44.32],
    ['бы', 44.4, 44.48],
    ['от', 44.68, 44.76],
    ['счастья', 44.84, 45.28],
  ],
  [
    ['В', 45.64, 45.8],
    ['серотонинопаде', 45.96, 47.4],
  ],
  [
    ['Здесь', 47.72, 47.96],
    ['есть', 48.04, 48.24],
    ['одно', 48.36, 48.56],
    ['ненастье', 48.76, 49.52],
  ],
  [
    ['И', 49.8, 49.84],
    ['то', 50, 50.08],
    ['лишь', 50.2, 50.4],
    ['рифмы', 50.6, 51],
    ['ради', 51.08, 51.6],
  ],
  [
    ['И', 51.84, 51.92],
    ['на', 52.04, 52.12],
    ['стене', 52.28, 52.64],
    ['дурдома', 52.84, 53.4],
  ],
  [
    ['Кто', 53.8, 53.96],
    ['б', 54, 54.04],
    ['не', 54.2, 54.28],
    ['подумал', 54.44, 55],
    ['шо', 55.16, 55.28],
  ],
  [
    ['Я', 55.92, 55.96],
    ['выскребу', 56.12, 56.72],
    ['три', 56.88, 57],
    ['слова', 57.04, 57.6],
  ],
  [
    ['Ногтём-', 57.96, 58.44],
    ['карандашом', 58.6, 59.48],
  ],
  [
    ['Как,', 59.76, 59.96],
    ['сука,', 60.28, 60.6],
    ['хорошо', 60.92, 61.88],
  ],
  [
    ['Не', 70.08, 70.16],
    ['сдохнуть', 70.4, 70.96],
    ['бы,', 71.12, 71.2],
    ['как', 71.64, 71.84],
  ],
  [['Хорошо!', 115.92, 117.32]],
];

const word = (text: string, from: number, to: number): Word => ({
  text,
  from,
  to,
});

/** The lead's words, a published line to an array. */
export const SUNG_LINES: ReadonlyArray<readonly Word[]> = SUNG.map((line) =>
  line.map(([text, from, to]) => word(text, from, to)),
);

/** The verse's seven shouted «(Хорошо!)». */
export const CALL_WORDS: readonly Word[] = VERSE_CALLS.map((from) =>
  word('Хорошо!', from, from + CALL_SECONDS),
);

/** Every chanted «Хорошо». */
export const CHANT_WORDS: readonly Word[] = CHANT.map((from) =>
  word('Хорошо', from, from + CHANT_SECONDS),
);

/**
 * Every word sung, in order of onset: the lead's, the verse's shouted calls
 * and the chant. A call overlaps the tail of the line before it.
 */
export const WORDS: readonly Word[] = [
  ...SUNG_LINES.flat(),
  ...CALL_WORDS,
  ...CHANT_WORDS,
].toSorted((a, b) => a.from - b.from);
