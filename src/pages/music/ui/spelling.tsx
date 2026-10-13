import type { Spelled } from '@/shared/music-catalogue/index.node-safe';

/**
 * A name as text, in both spellings where the locale gets a Latin one, which
 * is set in italics. The stylesheet shows one by `<html>`'s `data-script`;
 * a name that keeps its script shows it in either, the Latin beside it.
 */
export function Spelling({ original, latin, keepsScript = false }: Spelled) {
  if (latin === undefined) return original;

  const romanized = <em>{latin}</em>;

  return keepsScript ? (
    <>
      {original}
      <span data-spelling="latin"> {romanized}</span>
    </>
  ) : (
    <>
      <span data-spelling="original">{original}</span>
      <span data-spelling="latin">{romanized}</span>
    </>
  );
}
