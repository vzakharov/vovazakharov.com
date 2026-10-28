import type {
  Described,
  Named,
  Rated,
  Summarized,
  Timed,
  Titled,
  WithLanguage,
} from '@/kernel/shared/typings';

/** What a feed and each of its items both state: a title and an absolute link. */
type RssEntry = Titled & { link: string };

/** A podcast's picture, absolute: the channel's square cover, or an episode's own. */
type WithImage = { image: string };

/**
 * What makes an item a podcast episode: the file an app plays — MP3, as every
 * podcast app takes — and what a directory lists beside it.
 */
type RssEpisode = Partial<WithImage> &
  Timed &
  Rated & { enclosure: { url: string; bytes: number } };

/**
 * An item before it has its absolute link. Its blurb is optional, as RSS has
 * it: a song may have none yet.
 */
export type UnlinkedRssItem = Titled &
  Partial<Described> & {
    published: Date;
    /** The body as HTML, which a reader shows in its reading pane. */
    content?: string;
    episode?: RssEpisode;
  };

type RssItem = RssEntry & UnlinkedRssItem;

/**
 * What Apple's directory, the strictest, requires of a podcast's channel. Its
 * `explicit` is derived from the episodes rather than stated.
 */
export type RssPodcast = WithImage & {
  owner: Named & { email: string };
  category: string;
};

export type RssChannel = RssEntry &
  Summarized &
  WithLanguage & {
    /** The feed's own absolute URL, which readers re-fetch it from. */
    self: string;
    /** Newest first, as the feed lists them. */
    items: RssItem[];
    podcast?: RssPodcast;
  };

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(text: string): string {
  return text.replaceAll(/["&'<>]/g, (char) => XML_ESCAPES[char] ?? char);
}

function element(name: string, text: string): string {
  return `<${name}>${escapeXml(text)}</${name}>`;
}

/** A `]]>` inside the text would close the section early, so it is split across two. */
function cdata(text: string): string {
  return `<![CDATA[${text.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

function itunesImage(href: string): string {
  return `<itunes:image href="${escapeXml(href)}"/>`;
}

function renderEpisode({
  enclosure,
  seconds,
  explicit,
  image,
}: RssEpisode): string[] {
  return [
    `<enclosure url="${escapeXml(enclosure.url)}" length="${enclosure.bytes}" type="audio/mpeg"/>`,
    element('itunes:duration', String(seconds)),
    element('itunes:explicit', String(explicit)),
    ...(image === undefined ? [] : [itunesImage(image)]),
    element('itunes:episodeType', 'full'),
  ];
}

function renderItem({
  title,
  link,
  description,
  published,
  content,
  episode,
}: RssItem): string {
  return [
    '<item>',
    element('title', title),
    element('link', link),
    `<guid isPermaLink="true">${escapeXml(link)}</guid>`,
    element('pubDate', published.toUTCString()),
    ...(description === undefined ? [] : [element('description', description)]),
    ...(content === undefined
      ? []
      : [`<content:encoded>${cdata(content)}</content:encoded>`]),
    ...(episode === undefined ? [] : renderEpisode(episode)),
    '</item>',
  ].join('');
}

function renderPodcast(
  { owner, image, category }: RssPodcast,
  items: readonly RssItem[],
): string[] {
  return [
    element('itunes:author', owner.name),
    `<itunes:owner>${element('itunes:name', owner.name)}${element('itunes:email', owner.email)}</itunes:owner>`,
    itunesImage(image),
    `<itunes:category text="${escapeXml(category)}"/>`,
    element(
      'itunes:explicit',
      String(items.some((item) => item.episode?.explicit === true)),
    ),
    element('itunes:type', 'episodic'),
  ];
}

const NAMESPACES = {
  atom: 'http://www.w3.org/2005/Atom',
  content: 'http://purl.org/rss/1.0/modules/content/',
  itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',
};

function namespaces(prefixes: ReadonlyArray<keyof typeof NAMESPACES>): string {
  return prefixes
    .map((prefix) => ` xmlns:${prefix}="${NAMESPACES[prefix]}"`)
    .join('');
}

/**
 * An RSS 2.0 document, and an Apple podcast where the channel states `podcast`.
 * `lastBuildDate` is the newest item's date rather than the clock, so a rebuild
 * with nothing new in it writes the same bytes.
 */
export function renderRss({
  title,
  link,
  description,
  language,
  self,
  items,
  podcast,
}: RssChannel): string {
  const [newest] = items;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<rss version="2.0"${namespaces(['atom', 'content', ...(podcast ? (['itunes'] as const) : [])])}>`,
    '<channel>',
    element('title', title),
    element('link', link),
    element('description', description),
    element('language', language),
    `<atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>`,
    ...(newest
      ? [element('lastBuildDate', newest.published.toUTCString())]
      : []),
    ...(podcast ? renderPodcast(podcast, items) : []),
    ...items.map((item) => renderItem(item)),
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}
