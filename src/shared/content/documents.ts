import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { SITE_CONFIG } from '@/shared/config';

import {
  COLLECTION_IDS,
  collectionAssetUrl,
  collectionDir,
  type CollectionId,
  documentName,
  type DocumentRef,
  documentRoute,
  type Routed,
  type Variant,
  VARIANTS,
} from './collections';
import {
  type Frontmatter,
  frontmatterSchema,
  type WithFrontmatter,
} from './frontmatter';
import {
  intrinsicDimensions,
  type WithOptionalOgImageSize,
} from './image-dimensions';

export type ContentDocument = DocumentRef &
  Routed &
  WithFrontmatter &
  WithOptionalOgImageSize & {
    /** Absent on the full document; set on each shorter cut. */
    variant?: Variant;
    /** The markdown body with the frontmatter block removed. */
    body: string;
    fileName: string;
    /** Where `public/` serves the authored markdown, for the download link. */
    rawUrl: string;
    /** Where `public/` serves the prebuilt PDF, produced by `pnpm content:pdf`. */
    pdfUrl: string;
    /**
     * What a saved copy of the markdown is called — the document's path under
     * the site, dot-joined, so the file says what it is and whose it is once it
     * has left the browser. Only an anchor's `download` can set it: a static
     * export serves fixed headers, so `Content-Disposition` is unavailable.
     */
    downloadName: string;
    /** The frontmatter's `ogImage`, resolved to where `public/` serves it. */
    ogImageUrl?: string;
  };

/** One function returns both, so the URL and the size cannot disagree. */
function resolveOgImage(
  collection: CollectionId,
  ogImage: string | undefined,
): Pick<ContentDocument, 'ogImageUrl' | 'ogImageSize'> {
  if (ogImage === undefined) return {};

  const ogImageUrl = collectionAssetUrl(
    collection,
    ogImage.replace(/^\.\//, ''),
  );

  return { ogImageUrl, ogImageSize: intrinsicDimensions(ogImageUrl) };
}

export type WithContentDocument = { document: ContentDocument };

/**
 * Splits `<slug>[.<variant>].md` into its parts. A trailing segment that is not
 * a known variant stays part of the slug, so `foo.bar.md` is the document
 * `foo.bar` rather than a variant nobody declared.
 */
function parseFileName(fileName: string): { slug: string; variant?: Variant } {
  const stem = fileName.replace(/\.md$/, '');
  const variant = VARIANTS.find((candidate) => stem.endsWith(`.${candidate}`));

  return variant
    ? { slug: stem.slice(0, -(variant.length + 1)), variant }
    : { slug: stem };
}

function readDocument(
  collection: CollectionId,
  fileName: string,
): ContentDocument {
  const raw = fs.readFileSync(path.join(collectionDir(collection), fileName), {
    encoding: 'utf8',
  });
  const { slug, variant } = parseFileName(fileName);

  // Naming the file is the whole point of the rethrow: a build failure has to
  // say which document is malformed, and neither the YAML parser nor the
  // schema knows what it was handed.
  let frontmatter: Frontmatter;
  let content: string;
  try {
    const parsed = matter(raw);
    frontmatter = frontmatterSchema.parse(parsed.data);
    content = parsed.content;
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${fileName}`, {
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }

  const route = documentRoute(collection, slug, variant);

  return {
    collection,
    slug,
    variant,
    frontmatter,
    body: content,
    fileName,
    rawUrl: `${route}.md`,
    pdfUrl: `${route}.pdf`,
    route,
    downloadName: `${SITE_CONFIG.downloadPrefix}${route.replaceAll('/', '.')}.md`,
    ...resolveOgImage(collection, frontmatter.ogImage),
  };
}

/** Every document in a collection, variants included, newest first. */
export function listDocuments(collection: CollectionId): ContentDocument[] {
  return fs
    .readdirSync(collectionDir(collection))
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => readDocument(collection, fileName))
    .toSorted(
      (a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
    );
}

/** The full documents only, without the shorter cuts. */
export function listPrimaryDocuments(
  collection: CollectionId,
): ContentDocument[] {
  return listDocuments(collection).filter((doc) => !doc.variant);
}

export function loadDocument(
  collection: CollectionId,
  slug: string,
  variant?: Variant,
): ContentDocument | undefined {
  const fileName = `${documentName(slug, variant)}.md`;
  const filePath = path.join(collectionDir(collection), fileName);

  return fs.existsSync(filePath)
    ? readDocument(collection, fileName)
    : undefined;
}

/** The variants of `slug` that exist on disk, in `VARIANTS` order. */
export function siblingVariants(
  collection: CollectionId,
  slug: string,
): Variant[] {
  return VARIANTS.filter((variant) =>
    fs.existsSync(
      path.join(collectionDir(collection), `${documentName(slug, variant)}.md`),
    ),
  );
}

export function listAllDocuments(): ContentDocument[] {
  return COLLECTION_IDS.flatMap((collection) => listDocuments(collection));
}
