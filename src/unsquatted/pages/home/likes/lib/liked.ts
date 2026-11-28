/**
 * The visitor's liked names. A like is the name as the field would hold it:
 * `foxedpage` alone, or `foxedpage.com` where a zone was typed with it, that
 * zone being the one the visitor prefers. One per name.
 */

import { cleanLabel, host, typedZone } from '../../checker';

/** The name a like is for: `foxedpage` of `foxedpage.com`. */
export const nameOf = (like: string) => cleanLabel(like);

/** The domain a like prefers, if it names a zone. */
export const preferredOf = (like: string) =>
  typedZone(like) === undefined ? undefined : like;

/** `likes` with one like per name, the first of each kept in its place. */
export function deduped(likes: readonly string[]): string[] {
  const seen = new Set<string>();

  return likes.filter((like) => {
    const name = nameOf(like);

    if (seen.has(name)) return false;
    seen.add(name);

    return true;
  });
}

/** `likes` with `like` in place of its name's, or ahead of the rest. */
export function withLike(likes: readonly string[], like: string): string[] {
  const name = nameOf(like);
  const index = likes.findIndex((each) => nameOf(each) === name);

  return index === -1 ? [like, ...likes] : likes.with(index, like);
}

const LIKE = /^[\da-z](?:[\da-z-]*[\da-z])?(?:\.[a-z][\d.a-z-]*[\da-z])?$/;

/** What a pasted list holds, and the lines in it that are no name or domain. */
export type ParsedLikes = { liked: string[]; invalid: string[] };

/**
 * A liked list from text, one name or domain per line, each cleaned as the
 * field cleans what is typed. Blank lines go, and a name's later lines; a
 * line that is neither is named in `invalid`, not dropped.
 */
export function parseLiked(text: string): ParsedLikes {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const cleaned = lines.map((line) => ({ line, like: host(line) }));

  return {
    liked: deduped(
      cleaned.filter(({ like }) => LIKE.test(like)).map(({ like }) => like),
    ),
    invalid: cleaned
      .filter(({ like }) => !LIKE.test(like))
      .map(({ line }) => line),
  };
}
