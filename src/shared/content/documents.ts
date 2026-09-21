import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { pageFile, type SiteId } from '@/shared/config';
import type { DocumentFile } from '@/shared/typings';

import {
  collectionAssetUrl,
  collectionDir,
  type CollectionId,
  collectionsForSite,
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
  type Sized,
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
    /** The authored markdown, as served. */
    markdown: DocumentFile;
    /** The prebuilt PDF, produced by `pnpm content:pdf:<site>`. */
    pdf: DocumentFile;
    /** The frontmatter's `ogImage`, resolved to where `public/` serves it. */
    ogImageUrl?: string;
    /** The frontmatter's `cardImage`, resolved the same way. */
    cardImage?: ResolvedImage;
  };

/** A frontmatter image path, resolved to what an `<img>` needs of it. */
export type ResolvedImage = Sized & { src: string };

/**
 * A frontmatter image is authored relative to its document; `public/` serves
 * the collection's assets at one path. One function returns both, so the URL
 * and the size cannot disagree.
 */
function resolveImage(collection: CollectionId, authored: string) {
  const url = collectionAssetUrl(collection, authored.replace(/^\.\//, ''));

  return { url, size: intrinsicDimensions(url) };
}

function resolveOgImage(
  collection: CollectionId,
  ogImage: string | undefined,
): Pick<ContentDocument, 'ogImageUrl' | 'ogImageSize'> {
  if (ogImage === undefined) return {};

  const { url, size } = resolveImage(collection, ogImage);

  return { ogImageUrl: url, ogImageSize: size };
}

/**
 * Unlike the Open Graph card, a size that cannot be read throws: the field is
 * opt-in, and an index row that does not reserve its drawing's space lays out
 * twice.
 */
function resolveCardImage(
  collection: CollectionId,
  cardImage: string | undefined,
): Pick<ContentDocument, 'cardImage'> {
  if (cardImage === undefined) return {};

  const { url, size } = resolveImage(collection, cardImage);

  if (!size) {
    throw new Error(`No intrinsic dimensions in card image ${url}`);
  }

  return { cardImage: { src: url, ...size } };
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
    markdown: pageFile(route, 'md'),
    pdf: pageFile(route, 'pdf'),
    route,
    ...resolveOgImage(collection, frontmatter.ogImage),
    ...resolveCardImage(collection, frontmatter.cardImage),
  };
}

/**
 * The authored `order` first, then date, newest first. `MAX_SAFE_INTEGER`
 * rather than `Infinity` for the documents with none: subtracting two
 * infinities is `NaN`, which a sort reads as "leave them where they are".
 */
function byReadingOrder(a: ContentDocument, b: ContentDocument): number {
  const ordered =
    (a.frontmatter.order ?? Number.MAX_SAFE_INTEGER) -
    (b.frontmatter.order ?? Number.MAX_SAFE_INTEGER);

  return ordered || b.frontmatter.date.getTime() - a.frontmatter.date.getTime();
}

/** Every document in a collection, variants included, in reading order. */
export function listDocuments(collection: CollectionId): ContentDocument[] {
  return fs
    .readdirSync(collectionDir(collection))
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => readDocument(collection, fileName))
    .toSorted(byReadingOrder);
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

/** Every document the given site serves. Another site's collections have no directory here. */
export function listAllDocuments(site: SiteId): ContentDocument[] {
  return collectionsForSite(site).flatMap((collection) =>
    listDocuments(collection),
  );
}
