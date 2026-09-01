import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

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

  return (
    typeof href === 'string' &&
    VIDEO_EXTENSIONS.some((extension) =>
      href.toLowerCase().split(/[?#]/)[0].endsWith(extension)
    )
  );
}

/** The paragraph's only meaningful child, ignoring the whitespace around it. */
function soleElementChild(node: Element): Element | undefined {
  const meaningful = node.children.filter(
    (child) => !(child.type === 'text' && child.value.trim() === '')
  );

  return meaningful.length === 1 && meaningful[0].type === 'element'
    ? meaningful[0]
    : undefined;
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
      className: ['content-video'],
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
 * the video reachable in a browser that cannot play the format.
 */
export const rehypeMediaEmbeds: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'p' || index === undefined || !parent) return;

      const link = soleElementChild(node);
      if (!link || link.tagName !== 'a' || !isVideoLink(link)) return;

      const href = link.properties.href;
      if (typeof href !== 'string') return;

      parent.children[index] = videoElement(href, hastText(link).trim());
    });
  };
};
