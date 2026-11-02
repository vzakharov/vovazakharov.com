import 'server-only';

import type { ElementContent, Root } from 'hast';

import {
  absoluteUrl,
  getAbsoluteUrl,
  SITE_CONFIG,
} from '@/kernel/shared/config';
import { feedHtml, type RssPodcast } from '@/kernel/shared/feed';
import type { Locale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import {
  type FeedEntry,
  type FeedSource,
  filedDate,
  isListed,
  listPrimaryDocuments,
  type ProseSource,
  renderProse,
} from '@/blog/shared/content';

import {
  assertWritten,
  type LocalizedSongDocument,
  localizeSong,
  mp3Url,
  PODCAST_COVER,
  preludeOf,
  type SongDocument,
  songDownloads,
  songPicture,
  SONGS,
  songTitle,
  spelledText,
  textHook,
} from '@/music/shared/catalogue';
import { storyOrder } from '@/music/shared/catalogue/index.node-safe';
import { messages } from '@/music/shared/i18n';

function text(value: string): ElementContent {
  return { type: 'text', value };
}

function element(
  tagName: string,
  properties: Record<string, string>,
  value: string,
): ElementContent {
  return { type: 'element', tagName, properties, children: [text(value)] };
}

function paragraph(children: ElementContent[]): ElementContent {
  return { type: 'element', tagName: 'p', properties: {}, children };
}

/** A feed reader has no switch, so each link is the locale's default spelling. */
function downloadLinks(
  document: SongDocument,
  locale: Locale,
): ElementContent[] {
  return songDownloads(document, locale).flatMap(
    ({ extension, href }, index) => [
      ...(index === 0 ? [] : [text(' · ')]),
      element('a', { href: spelledText(href) }, extension.toUpperCase()),
    ],
  );
}

/**
 * The song's prose as its page's story shows it — prelude and story in the
 * file's order, the second under its label — then a link to the page for the
 * words and their notes, whose columns and popovers are the page's to lay out,
 * and the song's files.
 */
async function songContent(
  document: SongDocument,
  localized: LocalizedSongDocument,
  locale: Locale,
): Promise<string> {
  const { feedPageLink, feedDownload, ...headings } = messages(locale);
  const parts = await Promise.all(
    storyOrder<ProseSource>(
      preludeOf(document, locale),
      localized.body === '' ? undefined : localized,
      headings,
    ).map(async ({ part, heading }) => ({
      rendered: await renderProse(part),
      heading,
    })),
  );
  const root: Root = {
    type: 'root',
    children: [
      ...parts.flatMap(({ rendered, heading }) => [
        ...(heading === undefined ? [] : [element('h2', {}, heading)]),
        ...rendered.tree.children,
      ]),
      paragraph([element('a', { href: localized.route }, feedPageLink)]),
      paragraph([
        text(`${feedDownload}: `),
        ...downloadLinks(document, locale),
      ]),
    ],
  };

  return feedHtml(root, getAbsoluteUrl);
}

function songEpisode(document: SongDocument): FeedEntry['episode'] {
  const { mp3Bytes, seconds, explicit } = document.frontmatter;
  const picture = songPicture(document);
  const url = mp3Url(document);

  assertWritten(document, [url]);

  return {
    enclosure: { url, bytes: mp3Bytes },
    seconds,
    explicit,
    ...(picture === undefined ? {} : { image: absoluteUrl(picture) }),
  };
}

/** What makes either songs feed a podcast: its owner and its square cover. */
function songPodcast(): RssPodcast {
  return {
    owner: SITE_CONFIG.author,
    image: absoluteUrl(PODCAST_COVER),
    category: 'Music',
  };
}

/** A songs feed's items in one language. */
async function songFeedEntries(locale: Locale): Promise<FeedEntry[]> {
  return Promise.all(
    listPrimaryDocuments(SONGS)
      .filter((document) => isListed(document))
      .map(async (document) => {
        const localized = localizeSong(document, locale);
        const { hook } = localized.frontmatter;

        return {
          // A feed reader has no switch, so the default spelling it is.
          title: spelledText(songTitle(document.frontmatter, locale)),
          description: hook === undefined ? undefined : textHook(hook),
          ...pick(localized, 'route'),
          published: filedDate(document.frontmatter),
          content: await songContent(document, localized, locale),
          episode: songEpisode(document),
        };
      }),
  );
}

/** Both songs feeds, one per language, each a podcast. */
export const SONG_FEED: FeedSource = {
  entries: songFeedEntries,
  description: (locale) => messages(locale).metaDescription,
  podcast: songPodcast,
};
