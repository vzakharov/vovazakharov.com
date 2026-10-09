import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { pageFile, type SiteId } from '@/shared/config';
import type { WithOptionalLocale } from '@/shared/i18n';
import { routeCardPath } from '@/shared/seo';
import type { DocumentFile, Sized } from '@/shared/typings';

import { COLLECTION_SCHEMAS } from './collection-schemas';
import {
  collectionAssetUrl,
  collectionDir,
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  documentName,
  type DocumentRef,
  documentRoute,
  isDocumentFile,
  type Routed,
  type Variant,
  VARIANTS,
} from './collections';
import type {
  BaseFrontmatter,
  Collection,
  WithFrontmatter,
} from './frontmatter';
import {
  intrinsicDimensions,
  type WithOptionalOgImageSize,
} from './image-dimensions';

/** An address, and the one language it is in where it is in one. */
export type LocaleRouted = Routed & WithOptionalLocale;

/** Where `public/` serves the card and how big it is — resolved together so they cannot disagree. */
type ResolvedOgImage = WithOptionalOgImageSize & {
  /** Where `public/` serves the page's own card; absent where it unfurls as the site's. */
  ogImageUrl?: string;
};

/**
 * Generic over frontmatter rather than over the collection id, so a song page
 * reads `frontmatter.audio` while everything that works across collections —
 * the sitemap, the metadata builder — holds documents at the base shape.
 *
 * No PDF here: a song has none, so the article header, which does, derives the
 * print's file from the route itself.
 */
export type ContentDocument<F extends BaseFrontmatter = BaseFrontmatter> =
  DocumentRef &
    WithFrontmatter<F> &
    ResolvedOgImage &
    // The language is this reading's; absent on the file as authored, which
    // carries both.
    LocaleRouted & {
      /** Absent on the full document; set on each shorter cut. */
      variant?: Variant;
      /** The markdown body with the frontmatter block removed. */
      body: string;
      fileName: string;
      /** The authored markdown, as served. */
      markdown: DocumentFile;
      /** The frontmatter's `cardImage`, resolved as `ogImageUrl` is. */
      cardImage?: ResolvedImage;
    };

/**
 * What the pipeline reads to compile a body: the text, the collection its
 * relative links resolve in, the file they resolve beside, and where that file
 * is served.
 */
export type ProseSource = Pick<
  ContentDocument,
  'collection' | 'body' | 'fileName' | 'markdown'
>;

/** A frontmatter image path, resolved to what an `<img>` needs of it. */
type ResolvedImage = Sized & { src: string };

/**
 * A frontmatter image is authored relative to its document; `public/` serves
 * the collection's assets at one path. One function returns both, so the URL
 * and the size cannot disagree.
 */
function resolveImage(collection: CollectionId, authored: string) {
  const url = collectionAssetUrl(collection, authored.replace(/^\.\//, ''));

  return { url, size: intrinsicDimensions(url) };
}

/** A generated card never rendered fails the build, as any broken image reference does. */
function resolveOgImage(
  collection: CollectionId,
  route: string,
  ogImage: string | undefined,
): ResolvedOgImage {
  if (ogImage !== undefined) {
    const { url, size } = resolveImage(collection, ogImage);

    return { ogImageUrl: url, ogImageSize: size };
  }

  if (!COLLECTIONS[collection].generatedCards) return {};

  const url = routeCardPath(route);

  return { ogImageUrl: url, ogImageSize: intrinsicDimensions(url) };
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

export type WithContentDocument<F extends BaseFrontmatter = BaseFrontmatter> = {
  document: ContentDocument<F>;
};

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

function readDocument<F extends BaseFrontmatter>(
  { id, schema }: Collection<F>,
  fileName: string,
): ContentDocument<F> {
  const raw = fs.readFileSync(path.join(collectionDir(id), fileName), {
    encoding: 'utf8',
  });
  const { slug, variant } = parseFileName(fileName);

  // Naming the file is the whole point of the rethrow: a build failure has to
  // say which document is malformed, and neither the YAML parser nor the
  // schema knows what it was handed.
  let frontmatter: F;
  let content: string;
  try {
    const parsed = matter(raw);
    frontmatter = schema.parse(parsed.data);
    content = parsed.content;
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${fileName}`, {
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }

  const route = documentRoute(id, slug, variant);

  return {
    collection: id,
    slug,
    variant,
    frontmatter,
    body: content,
    fileName,
    markdown: pageFile(route, 'md'),
    route,
    ...resolveOgImage(id, route, frontmatter.ogImage),
    ...resolveCardImage(id, frontmatter.cardImage),
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
export function listDocuments<F extends BaseFrontmatter>(
  collection: Collection<F>,
): Array<ContentDocument<F>> {
  return fs
    .readdirSync(collectionDir(collection.id))
    .filter((fileName) => isDocumentFile(fileName))
    .map((fileName) => readDocument(collection, fileName))
    .toSorted(byReadingOrder);
}

/** The full documents only, without the shorter cuts. */
export function listPrimaryDocuments<F extends BaseFrontmatter>(
  collection: Collection<F>,
): Array<ContentDocument<F>> {
  return listDocuments(collection).filter((doc) => !doc.variant);
}

// A build ignores the variable, which is what keeps one left in a shell out of
// a deploy.
const SHOW_HIDDEN =
  process.env.NODE_ENV === 'development' && process.env.SHOW_HIDDEN === '1';

/**
 * Whether a document may be listed. Applied where documents are offered to a
 * reader, never where they are routed — a hidden page is still built.
 * `SHOW_HIDDEN=1 pnpm dev:<site>` lists every document, so a local session
 * browses the whole catalogue from the public pages.
 */
export function isListed({ frontmatter }: WithFrontmatter): boolean {
  return SHOW_HIDDEN || frontmatter.hidden !== true;
}

export function loadDocument<F extends BaseFrontmatter>(
  collection: Collection<F>,
  slug: string,
  variant?: Variant,
): ContentDocument<F> | undefined {
  const fileName = `${documentName(slug, variant)}.md`;
  const filePath = path.join(collectionDir(collection.id), fileName);

  return fs.existsSync(filePath)
    ? readDocument(collection, fileName)
    : undefined;
}

/**
 * A collection's file of prose alone — no frontmatter, so no document of its
 * own — that a page sets under the heading it writes. `name` is its path inside
 * the collection without the `.md`, which is also its page's route there.
 * `undefined` where none was written.
 */
export function loadProse(
  collection: CollectionId,
  name: string,
): ProseSource | undefined {
  const fileName = `${name}.md`;
  const filePath = path.join(collectionDir(collection), fileName);

  if (!fs.existsSync(filePath)) return undefined;

  return {
    collection,
    body: fs.readFileSync(filePath, { encoding: 'utf8' }),
    fileName,
    markdown: pageFile(collectionAssetUrl(collection, name), 'md'),
  };
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
  return collectionsForSite(site).flatMap((id) => {
    // Annotated rather than inferred: the registry's values are a union of
    // per-collection handles, and a union is what one inferred frontmatter
    // type cannot be. Widening to the base shape is all a caller across
    // collections wants from them anyway.
    const collection: Collection = COLLECTION_SCHEMAS[id];

    return listDocuments(collection);
  });
}
