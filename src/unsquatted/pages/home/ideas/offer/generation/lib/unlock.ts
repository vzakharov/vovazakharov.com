/** The words in the field that bring the lightbulb out. */
const PHRASE = 'give me ai';

/**
 * Whether the field holds the phrase: word for word, but in any case and with
 * any spaces round it or between its words.
 */
export const unlocks = (typed: string) =>
  typed.trim().toLowerCase().split(/\s+/).join(' ') === PHRASE;
