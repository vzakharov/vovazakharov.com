import 'server-only';

import rehypeShiki from '@shikijs/rehype';
import type { Element, Root as HastRoot } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import type { BuiltinLanguage } from 'shiki';
import { unified } from 'unified';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

import { getAbsoluteUrl } from '@/shared/config';
import type { MaybeTitled, Titled, WithId, WithText } from '@/shared/typings';

import type { CollectionId, Variant } from './collections';
import {
  type ContentDocument,
  listPrimaryDocuments,
  siblingVariants,
  type WithContentDocument,
} from './documents';
import { hastText } from './hast-text';
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

export type Heading = WithId &
  WithText & {
    /** 1 for a part divider, 2 for a section inside one. */
    depth: 1 | 2;
  };

export type WithHeadings = { headings: Heading[] };

/** Compiled from first-party markdown at build time, so it is safe to inject raw. */
export type WithHtml = { html: string };

export type WithReadingMinutes = { readingMinutes: number };

export type WithWordCount = { wordCount: number };

/**
 * What a reader sees above the body: the document's leading `# ` heading,
 * lifted out of it, and how long the prose takes.
 */
export type Headlined = Titled & WithReadingMinutes;

export type RenderedDocument = WithHtml &
  Headlined &
  WithHeadings &
  WithWordCount;

type ExtractTitleAndCountCollected = MaybeTitled & WithWordCount;

/**
 * Lifts the leading `# ` heading out of the body and counts the prose. The
 * article header renders that heading, so leaving it in shows the title twice.
 */
function extractTitleAndCount(collected: ExtractTitleAndCountCollected) {
  return () => (tree: MdastRoot) => {
    const index = tree.children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1,
    );

    if (index !== -1) {
      const [heading] = tree.children.splice(index, 1);
      const words: string[] = [];

      if (heading) visit(heading, 'text', (node) => words.push(node.value));
      collected.title = words.join('').trim();
    }

    // Fenced code and raw HTML are not prose, so they do not count toward
    // reading time.
    visit(tree, (node) => {
      if (node.type === 'code' || node.type === 'html') return SKIP;
      if (node.type === 'text' || node.type === 'inlineCode') {
        collected.wordCount += node.value.split(/\s+/).filter(Boolean).length;
      }

      return CONTINUE;
    });
  };
}

/** Runs after `rehype-slug`, so every heading already has the id it links to. */
function collectHeadings(collected: WithHeadings) {
  return () => (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      const depth = node.tagName === 'h1' ? 1 : node.tagName === 'h2' ? 2 : 0;
      const id = node.properties.id;

      if (depth === 0 || typeof id !== 'string') return;

      collected.headings.push({ id, text: hastText(node), depth });
    });
  };
}

async function render(document: ContentDocument): Promise<RenderedDocument> {
  const { collection, rawUrl, body, fileName } = document;
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
    .use(rehypeContentLinks, { collection })
    .use(rehypeMediaEmbeds)
    // Before the image pass, so the diagrams it produces are sized like any
    // other image and do not collapse the page until their SVG loads.
    .use(rehypeMermaid, { sourceUrl: getAbsoluteUrl(rawUrl) })
    .use(rehypeImageDimensions)
    .use(rehypeTableScroll)
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      // CSS-variable output, so one render serves both themes.
      defaultColor: false,
      fallbackLanguage: 'text',
      langs: CODE_LANGUAGES,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(body);

  const { title, headings, wordCount } = collected;

  if (title === undefined || title.length === 0) {
    throw new Error(
      `${fileName} has no leading \`# \` heading to use as its title.`,
    );
  }

  return {
    html: String(file),
    title,
    headings,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / READING_SPEED)),
  };
}

const cache = new Map<string, Promise<RenderedDocument>>();

/** Renders a document, memoized per build process — several pages want the same one. */
export async function renderDocument(
  document: ContentDocument,
): Promise<RenderedDocument> {
  const key = `${document.collection}:${document.fileName}`;
  const pending = cache.get(key) ?? render(document);

  cache.set(key, pending);

  return pending;
}

export type DocumentCard = WithContentDocument & {
  rendered: RenderedDocument;
  /** The shorter cuts that exist beside it, in `VARIANTS` order. */
  variants: Variant[];
};

/**
 * The full documents of a collection, rendered — what a list of cards needs.
 * Rendering just to read a title is free: `renderDocument` memoizes.
 */
export async function renderPrimaryDocuments(
  collection: CollectionId,
): Promise<DocumentCard[]> {
  return Promise.all(
    listPrimaryDocuments(collection).map(async (document) => ({
      document,
      rendered: await renderDocument(document),
      variants: siblingVariants(collection, document.slug),
    })),
  );
}
