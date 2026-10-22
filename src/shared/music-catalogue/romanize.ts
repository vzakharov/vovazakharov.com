/**
 * Russian in Latin letters by one fixed rule, BGN/PCGN-style: the spelling a
 * name or a line gets wherever the reader's locale does not read Cyrillic.
 * Anything that is not a Russian letter — Latin, digits, punctuation, another
 * script — passes through as it stands.
 */

/** Read before the single letters, which would spell them `yye` and `yy`. */
const PAIRS: Record<string, string> = { ые: 'ye', ый: 'y' };

const LETTERS: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ы: 'y',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  // The modifier apostrophe, a letter rather than punctuation, as Schadina
  // writes them.
  ь: 'ʼ',
  ъ: 'ʼ',
};

/** The letters after which `е` is a plain `e`; й counts as a vowel's glide, not one of them. */
const CONSONANTS = new Set('бвгджзклмнпрстфхцчшщ');

/** The letters after which `ё` is a plain `o`. */
const HUSHERS = new Set('жчшщ');

/** Every letter the rule spells, `е` and `ё` included. */
const RUSSIAN = new Set([...Object.keys(LETTERS), 'е', 'ё']);

function isRussianCapital(char: string | undefined): boolean {
  return (
    char !== undefined &&
    RUSSIAN.has(char.toLowerCase()) &&
    char !== char.toLowerCase()
  );
}

function spell(letter: string, previous: string | undefined): string {
  if (letter === 'е')
    return previous !== undefined && CONSONANTS.has(previous) ? 'e' : 'ye';
  if (letter === 'ё')
    return previous !== undefined && HUSHERS.has(previous) ? 'o' : 'yo';

  return LETTERS[letter] ?? letter;
}

/**
 * A capital spells its first Latin letter capitalized — Ш is `Sh` — unless a
 * neighbouring letter is a capital too, which makes it a word in capitals:
 * СССР is `SSSR`.
 */
function cased(
  latin: string,
  source: string,
  around: Array<string | undefined>,
): string {
  if (!isRussianCapital(source)) return latin;
  if (around.some((char) => isRussianCapital(char))) return latin.toUpperCase();

  return latin.charAt(0).toUpperCase() + latin.slice(1);
}

export function romanizeRussian(text: string): string {
  // Code points, not UTF-16 units: a letter outside the BMP passes through
  // whole.
  const chars = text.match(/[\s\S]/gu) ?? [];
  let out = '';

  for (let at = 0; at < chars.length; at += 1) {
    const char = chars[at] ?? '';
    const lower = char.toLowerCase();

    if (!RUSSIAN.has(lower)) {
      out += char;
      continue;
    }

    const previous = chars[at - 1]?.toLowerCase();
    const next = chars[at + 1];
    const pair = PAIRS[lower + (next?.toLowerCase() ?? '')];
    const around = [chars[at - 1], next];

    if (pair !== undefined) {
      out += cased(pair, char, around);
      at += 1;
      continue;
    }

    out += cased(spell(lower, previous), char, around);
  }

  return out;
}
