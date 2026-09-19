import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

import { hastText } from '../hast-text';
import { CONTENT_VIDEO } from '../markers';

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
 * Turns a paragraph that holds nothing but a link to a video into the marker
 * `ContentVideo` renders, so a document reads as a link on GitHub and plays
 * inline on the site. The link text becomes the player's accessible label; how
 * the video is drawn on screen and on paper is the component's to decide.
 */
function embedVideos(tree: Root) {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'p' || index === undefined || !parent) return;

    const link = soleElementChild(node);
    if (link?.tagName !== 'a' || !isVideoLink(link)) return;

    const href = link.properties.href;
    if (typeof href !== 'string') return;

    parent.children.splice(index, 1, {
      type: 'element',
      tagName: CONTENT_VIDEO,
      properties: { src: href, label: hastText(link).trim() },
      children: [],
    });

    return [SKIP, index + 1];
  });
}

export const rehypeMediaEmbeds: Plugin<[], Root> = () => embedVideos;
