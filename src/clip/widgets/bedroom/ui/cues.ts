/**
 * The sung words the bedroom's pictures turn on, as `words.ts` in the score
 * times them (its table is not exported): the onsets of «просыпаешься»,
 * «зайчик», «Так» and the three «шо» of «Так хорошо-шо-шо».
 */
export const CUES = {
  wake: 28.68,
  bunny: 33.08,
  soGood: 42.32,
  sho: [42.56, 43.04, 43.32],
} as const;
