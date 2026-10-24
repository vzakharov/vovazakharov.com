import type { Titled, WithId } from '@/kernel/shared/typings';

/** One song under test, `id` naming its directory of `mix.mp3`, `1.mp3`… */
type BlindPiece = Titled & WithId;

type BlindTest = Titled & {
  /** Where the pieces' directories are served from, with CORS, since the audio runs through Web Audio. */
  base: string;
  pieces: readonly BlindPiece[];
};

/** The positions `blind-abc.py split` writes, the unmastered mix first. */
export const VARIANTS = ['mix', '1', '2', '3'] as const;
export type Variant = (typeof VARIANTS)[number];

const variantUrl = (test: BlindTest, piece: BlindPiece, variant: Variant) =>
  `${test.base}/${piece.id}/${variant}.mp3`;

export const variantUrls = (
  test: BlindTest,
  piece: BlindPiece,
): Record<Variant, string> => ({
  mix: variantUrl(test, piece, 'mix'),
  1: variantUrl(test, piece, '1'),
  2: variantUrl(test, piece, '2'),
  3: variantUrl(test, piece, '3'),
});

/**
 * The test in progress. Its audio rides the album's branch and is swept when
 * the branch lands, so the next song's test takes this one's place.
 */
export const NOSTALGIA: BlindTest = {
  title: '«Ностальгия» и «Свеча горела»',
  base: 'https://raw.githubusercontent.com/vzakharov/vovazakharov.com/claude/nostalgia-album-0ar5hp/docs/remove-before-merging/nostalgia/blind',
  pieces: [
    {
      id: 'invitation-summer-gone',
      title: 'Приглашение в путешествие + Лето прошло',
    },
    { id: 'butterfly-rock', title: 'Бабочка' },
    { id: 'actor', title: 'Актёр' },
    { id: 'insomnia', title: 'Бессонница' },
    { id: 'candle-tarkovsky', title: 'Свеча' },
    { id: 'winter-in-the-forest', title: 'Зима в лесу' },
    { id: 'candle-burnt', title: 'Свеча горела' },
  ],
};

export type { BlindPiece, BlindTest };
