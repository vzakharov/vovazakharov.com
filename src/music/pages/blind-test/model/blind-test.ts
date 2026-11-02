import type { Titled, WithId } from '@/kernel/shared/typings';

/** One song under test, `id` naming its directory of `mix.mp3`, `1.mp3`… */
type BlindPiece = Titled & WithId;

type BlindTest = Titled & {
  /** Where the pieces' directories are served from, with CORS, since the audio runs through Web Audio. */
  base: string;
  /** How many masters each piece has, the number `blind-abc.py build` was given. */
  masters: number;
  pieces: readonly BlindPiece[];
};

/** A position `blind-abc.py split` writes: the unmastered mix, or a master's number from 1. */
type Variant = 'mix' | `${number}`;

export const variants = ({ masters }: BlindTest): readonly Variant[] => [
  'mix',
  ...Array.from({ length: masters }, (_, index) => `${index + 1}` as const),
];

export const variantUrls = (
  test: BlindTest,
  piece: BlindPiece,
): ReadonlyMap<Variant, string> =>
  new Map(
    variants(test).map((variant) => [
      variant,
      `${test.base}/${piece.id}/${variant}.mp3`,
    ]),
  );

/**
 * The test in progress. Its audio rides the song's branch and is swept when
 * the branch lands, so the next song's test takes this one's place.
 */
export const HOROWO: BlindTest = {
  title: '«Хорошо»',
  base: 'https://raw.githubusercontent.com/vzakharov/vovazakharov.com/claude/horowo-song-mastering-oia0kq/docs/remove-before-merging/horowo/blind',
  masters: 4,
  pieces: [{ id: 'horowo', title: 'Хорошо' }],
};

export type { BlindPiece, BlindTest, Variant };
