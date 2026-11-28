/**
 * Vowel letters that start a consonant sound: "a used-book shop", "a European
 * fair", "a one-room studio".
 */
const SOUNDS_CONSONANT =
  /^(?:u(?:[b-dfgj-np-tvz][aeiou]|ni|ra)|eu|ewe|one|once)/;

/** Consonant letters that start a vowel sound: "an hour". */
const SOUNDS_VOWEL = /^(?:hour|honest|honou?r|heir)/;

/** `use` after its indefinite article, chosen by how the word sounds. */
export function withArticle(use: string): string {
  const word = use.toLowerCase();
  const vowel =
    SOUNDS_VOWEL.test(word) ||
    (/^[aeiou]/.test(word) && !SOUNDS_CONSONANT.test(word));

  return `${vowel ? 'an' : 'a'} ${use}`;
}

/** "A x.", "A x or a y.", "A x, a y or a z." */
export function usesSentence(uses: readonly string[]): string {
  const listed = uses.map((use) => withArticle(use));
  const last = listed.pop();
  const sentence =
    listed.length === 0 ? `${last}` : `${listed.join(', ')} or ${last}`;

  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}
