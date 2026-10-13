import 'server-only';

import type { ElementContent, Root } from 'hast';

import { getAbsoluteUrl } from '@/shared/config';
import {
  type FeedEntry,
  filedDate,
  isListed,
  listPrimaryDocuments,
  renderProse,
  SONGS,
} from '@/shared/content';
import { loadMessages, type Locale } from '@/shared/i18n';
import { feedHtml } from '@/shared/lib/feed-html';
import { textHook } from '@/shared/music-catalogue';

import { universeOf } from './catalogue-text';
import {
  type LocalizedSongDocument,
  localizeSong,
  type SongDocument,
} from './song-text';

function element(
  tagName: string,
  properties: Record<string, string>,
  text: string,
): ElementContent {
  return {
    type: 'element',
    tagName,
    properties,
    children: [{ type: 'text', value: text }],
  };
}

/**
 * The song's prose as its page's story shows it — the world first where it has
 * one, then the making-of under its label — and a link to the page for the
 * words and their notes, whose columns and popovers are the page's to lay out.
 */
async function songContent(
  document: SongDocument,
  localized: LocalizedSongDocument,
  locale: Locale,
): Promise<string> {
  const { makingOf, feedPageLink } = loadMessages(locale).music;
  const universe = universeOf(document, locale);
  const [world, told] = await Promise.all([
    universe && renderProse(universe),
    localized.body === '' ? undefined : renderProse(localized),
  ]);
  const root: Root = {
    type: 'root',
    children: [
      ...(world?.tree.children ?? []),
      ...(world && told ? [element('h2', {}, makingOf)] : []),
      ...(told?.tree.children ?? []),
      {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [element('a', { href: localized.route }, feedPageLink)],
      },
    ],
  };

  return feedHtml(root, getAbsoluteUrl);
}

/** A songs feed's items in one language, newest first. */
export async function songFeedEntries(locale: Locale): Promise<FeedEntry[]> {
  const entries = await Promise.all(
    listPrimaryDocuments(SONGS)
      .filter((document) => isListed(document))
      .map(async (document) => {
        const localized = localizeSong(document, locale);
        const { title, hook } = localized.frontmatter;

        return {
          title,
          description: hook === undefined ? undefined : textHook(hook),
          route: localized.route,
          published: filedDate(document.frontmatter),
          content: await songContent(document, localized, locale),
        };
      }),
  );

  return entries.toSorted(
    (a, b) => b.published.getTime() - a.published.getTime(),
  );
}
