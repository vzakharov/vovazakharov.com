import type { Nodes } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

/**
 * How long an excerpt runs before it is cut. Longer than the radio page's
 * story box holds at its widest measure, so the cut always lies under the fade.
 */
export const EXCERPT_LENGTH = 600;

/** Whole blocks of markdown that are not the prose a reader reads on. */
const SKIPPED: ReadonlySet<string> = new Set([
  'code',
  'html',
  'footnoteDefinition',
  'footnoteReference',
  'definition',
  'image',
  'imageReference',
]);

function textOf(node: Nodes): string {
  if (SKIPPED.has(node.type)) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return ' ';
  if (!('children' in node)) return '';

  const parts: string[] = node.children.map((child) => textOf(child));
  const isBlocks = node.type === 'root' || node.type === 'blockquote';

  return isBlocks ? parts.filter(Boolean).join(' ') : parts.join('');
}

/** Markdown as the words a reader sees, its blocks run together into one line. */
export function plainText(markdown: string): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  return textOf(tree).replaceAll(/\s+/gu, ' ').trim();
}

/**
 * The opening of a song's story, cut at a word past `EXCERPT_LENGTH`; a
 * shorter one whole, and none for a story with no words.
 */
export function songExcerpt(story: string): string | undefined {
  const text = plainText(story);

  if (text === '') return undefined;
  if (text.length <= EXCERPT_LENGTH) return text;

  const cut = text.indexOf(' ', EXCERPT_LENGTH);

  return cut === -1 ? text : text.slice(0, cut);
}
