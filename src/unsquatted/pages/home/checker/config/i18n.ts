import type en from './messages/en.json';

export type WithCopy = { copy: typeof en };

/** The byline as plain words, where no note can open on them. */
export const plainByline = ({ copy }: WithCopy) =>
  copy.byline
    .replace('{private}', copy.private)
    .replace('{blazing}', copy.blazing);

/**
 * The lede without its `*`, and the lede up to the end of the starred word:
 * the claim the social card's note answers and a taken typed domain undercuts.
 */
export function ledeParts({ copy }: WithCopy): {
  plain: string;
  marked: string;
} {
  const [marked = '', after = ''] = copy.lede.split('*');

  return { plain: `${marked}${after}`, marked };
}
