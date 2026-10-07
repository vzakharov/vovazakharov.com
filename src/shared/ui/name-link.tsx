import { TextLink, type TextLinkProps } from './text-link';

/**
 * A link that is the name of the thing it opens — a song on a list, an artist
 * in a line of facts. Underlined only under the pointer, so a run of names
 * reads as text first; a link inside prose keeps `TextLink`'s underline.
 */
export function NameLink(props: Omit<TextLinkProps, 'underline'>) {
  return <TextLink underline="hover" {...props} />;
}
