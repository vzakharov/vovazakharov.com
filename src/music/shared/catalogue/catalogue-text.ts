import 'server-only';

import type { Locale } from '@/kernel/shared/i18n';

import type { ProseSource, ServedMarkdown } from '@/blog/shared/content';

import { albumFile, artistFile } from './catalogue-files.ts';
import type { MusicAlbum, MusicProject } from './names.ts';
import {
  localePrelude,
  localeProse,
  type PreludePlacement,
} from './sections.ts';

/** A page's prose in its two parts, either of which may be missing. */
export type StoryParts = {
  /**
   * What is told beside the story: the world a concept album is set in, or
   * the story of the source a song rests on.
   */
  prelude?: (ProseSource & PreludePlacement) | undefined;
  /** The story proper — behind the scenes, where a `prelude` comes first. */
  story?: ProseSource | undefined;
};

export type CatalogueText = StoryParts &
  ServedMarkdown & {
    /** The line under the page's name. */
    hook: string | undefined;
  };

/** `body` as a source of its own, or `undefined` where it is empty. */
function part(
  source: ProseSource,
  body: string | undefined,
): ProseSource | undefined {
  return body === undefined || body === '' ? undefined : { ...source, body };
}

/** A page's prelude, where its file — an album's, a song's — tells one. */
export function preludeOf(
  source: ProseSource,
  locale: Locale,
): StoryParts['prelude'] {
  const prelude = localePrelude(source.body, locale);

  if (prelude === undefined) return undefined;
  const { text, ...placement } = prelude;

  return { ...source, body: text, ...placement };
}

/**
 * A catalogue page's own text in one language, from the markdown file at its
 * route plus `.md`, cut on markers as a song's story is.
 */
function catalogueText(
  {
    frontmatter,
    ...source
  }: ProseSource & { frontmatter: Record<Locale, { hook?: string }> },
  locale: Locale,
): CatalogueText {
  const { body, markdown } = source;
  const { hook } = frontmatter[locale];

  return {
    markdown,
    prelude: preludeOf(source, locale),
    story: part(source, localeProse(body, locale)),
    hook,
  };
}

export function albumText(album: MusicAlbum, locale: Locale): CatalogueText {
  return catalogueText(albumFile(album), locale);
}

export function artistText(
  artist: MusicProject,
  locale: Locale,
): CatalogueText {
  return catalogueText(artistFile(artist), locale);
}
