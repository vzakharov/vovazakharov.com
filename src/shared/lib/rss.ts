import type { Described, Summarized, Titled } from '@/shared/typings';

/** What a feed and each of its items both state: a title and an absolute link. */
type RssEntry = Titled & { link: string };

/** An item's blurb is optional, as RSS has it: a song may have none yet. */
export type RssItem = RssEntry &
  Partial<Described> & {
    published: Date;
    /** The body as HTML, which a reader shows in its reading pane. */
    content?: string;
  };

export type RssChannel = RssEntry &
  Summarized & {
    language: string;
    /** The feed's own absolute URL, which readers re-fetch it from. */
    self: string;
    /** Newest first, as the feed lists them. */
    items: RssItem[];
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

function renderItem({
  title,
  link,
  description,
  published,
  content,
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
    '</item>',
  ].join('');
}

/**
 * An RSS 2.0 document. `lastBuildDate` is the newest item's date rather than
 * the clock, so a rebuild with nothing new in it writes the same bytes.
 */
export function renderRss({
  title,
  link,
  description,
  language,
  self,
  items,
}: RssChannel): string {
  const [newest] = items;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '<channel>',
    element('title', title),
    element('link', link),
    element('description', description),
    element('language', language),
    `<atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>`,
    ...(newest
      ? [element('lastBuildDate', newest.published.toUTCString())]
      : []),
    ...items.map((item) => renderItem(item)),
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}
