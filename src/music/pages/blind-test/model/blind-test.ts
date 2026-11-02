import type { Titled, WithId } from '@/kernel/shared/typings';

/** One song under test, `id` naming its directory of `mix.mp3`, `1.mp3`… */
type BlindPiece = Titled &
  WithId & {
    /** How many masters it has, the number `blind-abc.py build` was given. */
    masters: number;
  };

type BlindTest = Titled & {
  /** Where the pieces' directories are served from, with CORS, since the audio runs through Web Audio. */
  base: string;
  pieces: readonly BlindPiece[];
};

/** A position `blind-abc.py split` writes: the unmastered mix, or a master's number from 1. */
type Variant = 'mix' | `${number}`;

export const variants = ({ masters }: BlindPiece): readonly Variant[] => [
  'mix',
  ...Array.from({ length: masters }, (_, index) => `${index + 1}` as const),
];

export const variantUrls = (
  test: BlindTest,
  piece: BlindPiece,
): ReadonlyMap<Variant, string> =>
  new Map(
    variants(piece).map((variant) => [
      variant,
      `${test.base}/${piece.id}/${variant}.mp3`,
    ]),
  );

/**
 * The test in progress. Its audio rides the songs' branch and is swept when
 * the branch lands, so the next test takes this one's place.
 */
export const LOST_SONGS: BlindTest = {
  title: 'Потерянные песни Грёбаного бала',
  base: 'https://raw.githubusercontent.com/vzakharov/vovazakharov.com/claude/horowo-song-mastering-oia0kq/docs/remove-before-merging/horowo-song-mastering-oia0kq/blind',
  pieces: [
    { id: 'horowo', title: 'Хорошо', masters: 4 },
    { id: 'talk-about-life', title: 'За жизнь', masters: 4 },
    { id: 'last-snow', title: 'Последний снег', masters: 4 },
    { id: 'unnoticed-things', title: 'Незаметные штуки', masters: 3 },
    { id: 'too-late', title: 'Поздно', masters: 4 },
  ],
};

export type { BlindPiece, BlindTest, Variant };
