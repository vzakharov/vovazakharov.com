import 'server-only';

import type { Element, Root as HastRoot } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeShiki from '@shikijs/rehype';
import type { BuiltinLanguage } from 'shiki';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import type { ContentDocument } from './documents';
import { rehypeContentLinks } from './plugins/rehype-content-links';
import { rehypeImageDimensions } from './plugins/rehype-image-dimensions';
import { rehypeMediaEmbeds } from './plugins/rehype-media-embeds';
import { rehypeMermaid } from './plugins/rehype-mermaid';
import { rehypeTableScroll } from './plugins/rehype-table-scroll';

/** Words per minute, for the reading-time estimate. */
const READING_SPEED = 220;

/** Fence languages the content uses. An unlisted one falls back to plain text. */
const CODE_LANGUAGES: BuiltinLanguage[] = [
  'bash',
  'css',
  'html',
  'js',
  'json',
  'markdown',
  'python',
  'ts',
  'tsx',
  'yaml',
];

export interface Heading {
  id: string;
  text: string;
  /** 1 for a part divider, 2 for a section inside one. */
  depth: 1 | 2;
}

export interface RenderedDocument {
  html: string;
  /** The document's leading `# ` heading, which the pipeline lifts out of the body. */
  title: string;
  headings: Heading[];
  wordCount: number;
  readingMinutes: number;
}

function textContent(node: Element): string {
  return node.children
    .map((child) => {
      if (child.type === 'text') return child.value;
      if (child.type === 'element') return textContent(child);
      return '';
    })
    .join('');
}

/**
 * Lifts the leading `# ` heading out of the body and counts the prose. The
 * title becomes the page's `<h1>`, rendered by the article header rather than
 * by the body, and leaving it in place would show it twice.
 */
function extractTitleAndCount(collected: {
  title?: string;
  wordCount: number;
}) {
  return () => (tree: MdastRoot) => {
    const index = tree.children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1
    );

    if (index !== -1) {
      const [heading] = tree.children.splice(index, 1);
      const words: string[] = [];

      visit(heading, 'text', (node) => words.push(node.value));
      collected.title = words.join('').trim();
    }

    // Fenced code and raw HTML are not prose, so they do not count toward
    // reading time.
    visit(tree, (node) => {
      if (node.type === 'code' || node.type === 'html') return 'skip';
      if (node.type === 'text' || node.type === 'inlineCode') {
        collected.wordCount += node.value.split(/\s+/).filter(Boolean).length;
      }
    });
  };
}

/** Runs after `rehype-slug`, so every heading already has the id it links to. */
function collectHeadings(collected: { headings: Heading[] }) {
  return () => (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      const depth = node.tagName === 'h1' ? 1 : node.tagName === 'h2' ? 2 : 0;
      const id = node.properties.id;

      if (depth === 0 || typeof id !== 'string') return;

      collected.headings.push({ id, text: textContent(node), depth });
    });
  };
}

async function render(document: ContentDocument): Promise<RenderedDocument> {
  const collected = {
    title: undefined as string | undefined,
    wordCount: 0,
    headings: [] as Heading[],
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(extractTitleAndCount(collected))
    .use(remarkRehype, { allowDangerousHtml: true })
    // First-party content, authored in this repo and reviewed alongside the
    // code, so raw HTML passes through unsanitized — nothing here is
    // user-submitted, and a sanitizer would only strip the author's own markup.
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(collectHeadings(collected))
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeContentLinks, { collection: document.collection })
    .use(rehypeMediaEmbeds)
    .use(rehypeImageDimensions)
    .use(rehypeMermaid)
    .use(rehypeTableScroll)
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      // CSS-variable output, so one render serves both themes.
      defaultColor: false,
      fallbackLanguage: 'text',
      langs: CODE_LANGUAGES,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(document.body);

  if (!collected.title) {
    throw new Error(
      `${document.fileName} has no leading \`# \` heading to use as its title.`
    );
  }

  return {
    html: String(file),
    title: collected.title,
    headings: collected.headings,
    wordCount: collected.wordCount,
    readingMinutes: Math.max(1, Math.round(collected.wordCount / READING_SPEED)),
  };
}

const cache = new Map<string, Promise<RenderedDocument>>();

/**
 * Renders a document, once per build process. The index page and the article
 * pages both want a document's derived title and reading time, and parsing the
 * long ones twice is the difference the memo buys.
 */
export function renderDocument(
  document: ContentDocument
): Promise<RenderedDocument> {
  const key = `${document.collection}:${document.fileName}`;
  const pending = cache.get(key) ?? render(document);

  cache.set(key, pending);

  return pending;
}
