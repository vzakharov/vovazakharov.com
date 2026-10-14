import 'server-only';

import type { ElementContent, Root } from 'hast';

import { absoluteUrl, getAbsoluteUrl, SITE_CONFIG } from '@/shared/config';
import {
  type FeedEntry,
  filedDate,
  isListed,
  listPrimaryDocuments,
  renderProse,
  SONGS,
} from '@/shared/content';
import { loadMessages, type Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { feedHtml } from '@/shared/lib/feed-html';
import type { RssPodcast } from '@/shared/lib/rss';
import { textHook } from '@/shared/music-catalogue';

import { universeOf } from './catalogue-text';
import { PODCAST_COVER, songPicture } from './pictures';
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

/** The song as a podcast episode. */
function songEpisode(document: SongDocument): FeedEntry['episode'] {
  const { audio, podcast, seconds, explicit } = document.frontmatter;
  const picture = songPicture(document);

  return {
    enclosure: {
      url: absoluteUrl(podcast.url ?? audio),
      ...pick(podcast, 'bytes'),
    },
    seconds,
    explicit,
    ...(picture === undefined ? {} : { image: absoluteUrl(picture) }),
  };
}

/** What makes either songs feed a podcast: its owner and its square cover. */
export function songPodcast(): RssPodcast {
  return {
    owner: SITE_CONFIG.author,
    image: absoluteUrl(PODCAST_COVER),
    category: 'Music',
  };
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
          ...pick(localized, 'route'),
          published: filedDate(document.frontmatter),
          content: await songContent(document, localized, locale),
          episode: songEpisode(document),
        };
      }),
  );

  return entries.toSorted(
    (a, b) => b.published.getTime() - a.published.getTime(),
  );
}
