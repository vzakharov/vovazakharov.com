import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { pageFile, type SiteId } from '@/kernel/shared/config';
import {
  DEFAULT_LOCALE,
  type Locale,
  type WithOptionalLocale,
} from '@/kernel/shared/i18n';
import { withCause } from '@/kernel/shared/lib/error-class';
import {
  routeCardPath,
  type WithOptionalOgImageSize,
} from '@/kernel/shared/seo';
import type {
  DocumentFile,
  Routed,
  Sized,
  Sourced,
  WithFileName,
} from '@/kernel/shared/typings';

import {
  collectionAssetUrl,
  collectionDir,
  type CollectionId,
  COLLECTIONS,
  collectionsForSite,
  documentName,
  documentRoute,
  isDocumentFile,
  isTranslated,
  type Slugged,
  type Variant,
  VARIANTS,
  type WithCollectionId,
} from './collections';
import { firstImage } from './first-image';
import {
  type BaseFrontmatter,
  baseFrontmatterSchema,
  type Collection,
  type FrontmatterReader,
  type WithFrontmatter,
} from './frontmatter';
import { intrinsicDimensions } from './image-dimensions';
import { splitLocale } from './locale-suffix';
import { assertTranslated, translatedData } from './translations';

/** An address, and the one language it is in where it is in one. */
type LocaleRouted = Routed & WithOptionalLocale;

/** A collection's page — a document or a feed — at its address. */
export type RoutedInCollection = WithCollectionId & LocaleRouted;

/** Where `public/` serves the card and how big it is — resolved together so they cannot disagree. */
type ResolvedOgImage = WithOptionalOgImageSize & {
  /** Where `public/` serves the page's own card; absent where it unfurls as the site's. */
  ogImageUrl?: string;
};

/** A document's slug and which cut of it a file is. */
type SluggedCut = Slugged & {
  /** Absent on the full document; set on each shorter cut. */
  variant?: Variant;
};

/**
 * Generic over frontmatter rather than over the collection id, so a song page
 * reads `frontmatter.repo` while everything that works across collections —
 * the sitemap, the metadata builder — holds documents at the base shape.
 *
 * No PDF here: a song has none, so the article header, which does, derives the
 * print's file from the route itself.
 */
export type ContentDocument<F extends BaseFrontmatter = BaseFrontmatter> =
  SluggedCut &
    ProseSource &
    WithFrontmatter<F> &
    ResolvedOgImage &
    WithCardImage &
    // The language is this reading's: a translated collection's file is in
    // one, and its route names it; absent on a file as authored that carries
    // both.
    RoutedInCollection;

/** The collection a body's relative links resolve in, and the file they resolve beside. */
export type FileInCollection = WithCollectionId & WithFileName;

/** Where the authored markdown is served. */
export type ServedMarkdown = { markdown: DocumentFile };

/** What the pipeline reads to compile a body. */
export type ProseSource = FileInCollection &
  ServedMarkdown & {
    /** The markdown body with the frontmatter block removed. */
    body: string;
  };

/** A frontmatter image path, resolved to what an `<img>` needs of it. */
type ResolvedImage = Sized & Sourced;

type WithCardImage = {
  /** The frontmatter's `cardImage`, else the body's first image, resolved as `ogImageUrl` is. */
  cardImage?: ResolvedImage;
};

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
): WithCardImage {
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

type ParsedFileName = WithOptionalLocale &
  SluggedCut & {
    /** Whether the file is a translation, its frontmatter completed from its original's. */
    translation: boolean;
  };

/**
 * Splits `<slug>[.<variant>][.<locale>].md` into its parts. A trailing segment
 * that is not a known variant stays part of the slug, so `foo.bar.md` is the
 * document `foo.bar` rather than a variant nobody declared. A locale suffix is
 * read only in a translated collection, where every file names its language
 * and the default language's is the translation.
 */
function parseFileName(
  collection: CollectionId,
  fileName: string,
): ParsedFileName {
  const translated = isTranslated(collection);
  const bare = fileName.replace(/\.md$/, '');
  const { stem, locale } = translated ? splitLocale(bare) : { stem: bare };
  const variant = VARIANTS.find((candidate) => stem.endsWith(`.${candidate}`));
  const name = variant
    ? { slug: stem.slice(0, -(variant.length + 1)), variant }
    : { slug: stem };

  if (!translated) return { ...name, translation: false };

  if (locale === undefined) {
    throw new Error(
      `${fileName} names no language: a translated collection's files are <slug>.<locale>.md.`,
    );
  }

  return { ...name, locale, translation: locale === DEFAULT_LOCALE };
}

/** The file one locale's reading of a document is in. */
function documentFileName(
  collection: CollectionId,
  name: string,
  locale?: Locale,
): string {
  return isTranslated(collection)
    ? `${name}.${locale ?? DEFAULT_LOCALE}.md`
    : `${name}.md`;
}

function collectionFile(collection: CollectionId, fileName: string): string {
  return path.join(collectionDir(collection), fileName);
}

/**
 * A file's frontmatter, read by `schema`, and the body under it. `complete`
 * fills in what the file leaves to another — a translation's original.
 */
function readMatter<F>(
  collection: CollectionId,
  fileName: string,
  schema: FrontmatterReader<F>,
  complete: (data: Record<string, unknown>) => unknown = (data) => data,
): { frontmatter: F; content: string } {
  const raw = fs.readFileSync(collectionFile(collection, fileName), {
    encoding: 'utf8',
  });

  // Naming the file is the whole point of the rethrow: a build failure has to
  // say which document is malformed, and neither the YAML parser nor the
  // schema knows what it was handed.
  try {
    const { data, content } = matter(raw);

    return { frontmatter: schema.parse(complete(data)), content };
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${fileName}`, withCause(error));
  }
}

function readDocument<F extends BaseFrontmatter>(
  { id, schema }: Collection<F>,
  fileName: string,
): ContentDocument<F> {
  const { slug, variant, locale, translation } = parseFileName(id, fileName);
  const { frontmatter, content } = readMatter(
    id,
    fileName,
    schema,
    translation
      ? (data) => translatedData(collectionDir(id), fileName, data)
      : undefined,
  );
  // The card is one for every language, so it sits at the locale-less route.
  const cardRoute = documentRoute(id, slug, variant);
  const route = documentRoute(id, slug, variant, locale);

  return {
    collection: id,
    slug,
    variant,
    locale,
    frontmatter,
    body: content,
    fileName,
    markdown: pageFile(
      collectionAssetUrl(id, fileName.replace(/\.md$/, '')),
      'md',
    ),
    route,
    ...resolveOgImage(id, cardRoute, frontmatter.ogImage),
    ...resolveCardImage(id, frontmatter.cardImage ?? firstImage(content)),
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

/**
 * Every document in a collection, variants and every language's reading
 * included, in reading order.
 */
export function listDocuments<F extends BaseFrontmatter>(
  collection: Collection<F>,
): Array<ContentDocument<F>> {
  const fileNames = fs
    .readdirSync(collectionDir(collection.id))
    .filter((fileName) => isDocumentFile(fileName));

  if (isTranslated(collection.id)) assertTranslated(fileNames);

  return fileNames
    .map((fileName) => readDocument(collection, fileName))
    .toSorted(byReadingOrder);
}

/**
 * The full documents only, without the shorter cuts — in `locale` where a
 * collection keeps one file per language.
 */
export function listPrimaryDocuments<F extends BaseFrontmatter>(
  collection: Collection<F>,
  locale: Locale = DEFAULT_LOCALE,
): Array<ContentDocument<F>> {
  return listDocuments(collection).filter(
    (doc) =>
      !doc.variant && (!isTranslated(collection.id) || doc.locale === locale),
  );
}

// A build ignores the variable, which is what keeps one left in a shell out of
// a deploy.
const SHOW_HIDDEN =
  process.env.NODE_ENV === 'development' && process.env.SHOW_HIDDEN === '1';

/**
 * Whether a document may be listed. Applied where documents are offered to a
 * reader, never where they are routed — a hidden page is still built.
 * `SHOW_HIDDEN=1 pnpm dev <site>` lists every document, so a local session
 * browses the whole catalogue from the public pages.
 */
export function isListed({ frontmatter }: WithFrontmatter): boolean {
  return SHOW_HIDDEN || frontmatter.hidden !== true;
}

export function loadDocument<F extends BaseFrontmatter>(
  collection: Collection<F>,
  slug: string,
  variant?: Variant,
  locale?: Locale,
): ContentDocument<F> | undefined {
  const fileName = documentFileName(
    collection.id,
    documentName(slug, variant),
    locale,
  );
  return fs.existsSync(collectionFile(collection.id, fileName))
    ? readDocument(collection, fileName)
    : undefined;
}

/**
 * A collection's file of prose that is not a document of its own — a page sets
 * it under the heading it writes, and `schema` reads whatever frontmatter the
 * page wants beside it. `name` is its path inside the collection without the
 * `.md`, which is also its page's route there. `undefined` where none was
 * written.
 */
export function loadProse<F>(
  collection: CollectionId,
  name: string,
  schema: FrontmatterReader<F>,
): (ProseSource & { frontmatter: F }) | undefined {
  const fileName = `${name}.md`;

  if (!fs.existsSync(collectionFile(collection, fileName))) return undefined;

  const { frontmatter, content } = readMatter(collection, fileName, schema);

  return {
    collection,
    frontmatter,
    body: content,
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
      collectionFile(
        collection,
        documentFileName(collection, documentName(slug, variant)),
      ),
    ),
  );
}

/**
 * Every document the given site serves, read through the base schema: that is
 * all a caller across collections can rely on, and it drops whatever a
 * collection adds — a song's `title` among it. Another site's collections have
 * no directory here.
 */
export function listAllDocuments(site: SiteId): ContentDocument[] {
  return collectionsForSite(site).flatMap((id) =>
    listDocuments({ id, schema: baseFrontmatterSchema }),
  );
}
