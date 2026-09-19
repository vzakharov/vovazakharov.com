import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

import { printedUrl } from '@/shared/config';

import { hastText } from '../hast-text';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'] as const;

/**
 * A link is a video when its URL says so, or when the author says so with a
 * `video` link title. The title is the escape hatch for a URL that carries no
 * file extension:
 *
 * ```markdown
 * [What the recording shows](https://example.com/opaque-id 'video')
 * ```
 */
function isVideoLink(node: Element): boolean {
  const href = node.properties.href;
  const title = node.properties.title;

  if (title === 'video') return true;
  if (typeof href !== 'string') return false;

  const [base = ''] = href.toLowerCase().split(/[#?]/);

  return VIDEO_EXTENSIONS.some((extension) => base.endsWith(extension));
}

/** The paragraph's only meaningful child, ignoring the whitespace around it. */
function soleElementChild(node: Element): Element | undefined {
  const meaningful = node.children.filter(
    (child) => !(child.type === 'text' && child.value.trim() === ''),
  );

  const [only] = meaningful;

  return meaningful.length === 1 && only?.type === 'element' ? only : undefined;
}

/**
 * What the player leaves behind on paper. A printed video is a blank rectangle,
 * so the page prints where to watch it instead — which is only useful if the
 * URL can be typed off the page.
 */
function printedVideoNote(src: string): Element {
  const { href, text } = printedUrl(src);

  return {
    type: 'element',
    tagName: 'p',
    properties: { className: ['print-only', 'content-video-note'] },
    children: [
      {
        type: 'element',
        tagName: 'em',
        properties: {},
        children: [
          // TODO: localize, along with the player's fallback text below. Both
          // are English because content pages are; they need the document's
          // locale once the `<slug>.<locale>.md` seam is built.
          { type: 'text', value: 'See video at ' },
          {
            type: 'element',
            tagName: 'a',
            properties: { href },
            children: [{ type: 'text', value: text }],
          },
        ],
      },
    ],
  };
}

function videoElement(href: string, label: string): Element {
  return {
    type: 'element',
    tagName: 'video',
    properties: {
      src: href,
      controls: true,
      preload: 'metadata',
      playsInline: true,
      className: ['content-video', 'print-hidden'],
      'aria-label': label,
    },
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          { type: 'text', value: 'Your browser can’t play this video — ' },
          {
            type: 'element',
            tagName: 'a',
            properties: { href, download: true },
            children: [{ type: 'text', value: 'download it' }],
          },
          { type: 'text', value: ' instead.' },
        ],
      },
    ],
  };
}

/**
 * Turns a paragraph that holds nothing but a link to a video into a player, so
 * a document reads as a link on GitHub and plays inline on the site. The link
 * text becomes the player's accessible label, and the fallback inside it keeps
 * the video reachable in a browser that cannot play the format. A printed copy
 * gets the note beside it instead, since the player prints as nothing.
 */
function embedVideos(tree: Root) {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'p' || index === undefined || !parent) return;

    const link = soleElementChild(node);
    if (link?.tagName !== 'a' || !isVideoLink(link)) return;

    const href = link.properties.href;
    if (typeof href !== 'string') return;

    parent.children.splice(
      index,
      1,
      videoElement(href, hastText(link).trim()),
      printedVideoNote(href),
    );

    return [SKIP, index + 2];
  });
}

export const rehypeMediaEmbeds: Plugin<[], Root> = () => embedVideos;
