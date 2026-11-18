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

/** A login link's phrase, wherever in a text the link sits. */
const LINKED = new RegExp(`#${LOGIN}([a-z]+(?:-[a-z]+)*)`, 'i');

/**
 * The phrase in what a player gave to log in — a key file's text, a login
 * link, or the words themselves: the link's phrase where the text holds one,
 * else the text.
 */
export function pastedPhrase(text: string): string {
  const linked = LINKED.exec(text)?.[1];
  return linked === undefined ? text.trim() : linked.split('-').join(' ');
}
