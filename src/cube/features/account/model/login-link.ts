/**
 * What a login link's fragment opens with. No walk's address carries `=`,
 * base64url having none, so the two never collide.
 */
const LOGIN = 'login=';

/**
 * A link logging another device in as `phrase`'s owner: `page` with the phrase
 * in its fragment, its words joined by hyphens. A fragment never reaches a
 * server, so the phrase stays between the two devices.
 */
export const loginLink = (page: string, phrase: string): string =>
  `${page}#${LOGIN}${phrase.split(' ').join('-')}`;

/** The phrase a login link's `fragment` (no `#`) carries, or null for any other. */
export const phraseIn = (fragment: string): string | null =>
  fragment.startsWith(LOGIN)
    ? fragment.slice(LOGIN.length).split('-').join(' ')
    : null;
