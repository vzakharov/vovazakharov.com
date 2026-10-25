import type { Spelled } from '@/music/shared/catalogue/index.node-safe';

/**
 * A name as text, in both spellings where the locale gets a Latin one, which
 * is set in italics. The stylesheet shows one by `<html>`'s `data-script`.
 */
export function Spelling({ original, latin }: Spelled) {
  if (latin === undefined) return original;

  return (
    <>
      <span data-spelling="original">{original}</span>
      <span data-spelling="latin">
        <em>{latin}</em>
      </span>
    </>
  );
}
