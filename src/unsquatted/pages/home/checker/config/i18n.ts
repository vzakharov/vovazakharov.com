import type en from './messages/en.json';

export type WithCopy = { copy: typeof en };

/**
 * The page's copy. The site is English-only, so there is one catalogue and no
 * locale to pick it by; a second language would turn this into kernel's
 * `catalogue`.
 */
export { default as COPY } from './messages/en.json';

/** The byline as plain words, where no note can open on them. */
export const plainByline = ({ copy }: WithCopy) =>
  copy.byline
    .replace('{private}', copy.private)
    .replace('{blazing}', copy.blazing);
