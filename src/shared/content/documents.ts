import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { pageFile } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import type { DocumentFile } from '@/shared/typings';

import {
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
  type BaseFrontmatter,
  type Collection,
  COLLECTION_SCHEMAS,
  type WithFrontmatter,
} from './frontmatter';
import {
  intrinsicDimensions,
  type WithOptionalOgImageSize,
} from './image-dimensions';

/** Where `public/` serves the card and how big it is — resolved together so they cannot disagree. */
type ResolvedOgImage = WithOptionalOgImageSize & {
  /** The frontmatter's `ogImage`, resolved to where `public/` serves it. */
  ogImageUrl?: string;
};

/**
 * Generic over frontmatter rather than over the collection id, so a song page
 * reads `frontmatter.audio` while everything that works across collections —
 * the sitemap, the metadata builder — holds documents at the base shape.
 */
export type ContentDocument<F extends BaseFrontmatter = BaseFrontmatter> =
  DocumentRef &
    Routed &
    WithFrontmatter<F> &
    ResolvedOgImage & {
      /** Absent on the full document; set on each shorter cut. */
      variant?: Variant;
      /**
       * Which language this reading of the document is in. Absent on the file
       * as authored — a localized collection carries both languages in one
       * file, and which one a page shows is the route's to decide.
       */
      locale?: Locale;
      /** The markdown body with the frontmatter block removed. */
      body: string;
      fileName: string;
      /** The authored markdown, as served. */
      markdown: DocumentFile;
    };

/** One function returns both, so the URL and the size cannot disagree. */
function resolveOgImage(
  collection: CollectionId,
  ogImage: string | undefined,
): ResolvedOgImage {
  if (ogImage === undefined) return {};

  const ogImageUrl = collectionAssetUrl(
    collection,
    ogImage.replace(/^\.\//, ''),
  );

  return { ogImageUrl, ogImageSize: intrinsicDimensions(ogImageUrl) };
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
    ...resolveOgImage(id, frontmatter.ogImage),
  };
}

/** Every document in a collection, variants included, newest first. */
export function listDocuments<F extends BaseFrontmatter>(
  collection: Collection<F>,
): Array<ContentDocument<F>> {
  return fs
    .readdirSync(collectionDir(collection.id))
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => readDocument(collection, fileName))
    .toSorted(
      (a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
    );
}

/** The full documents only, without the shorter cuts. */
export function listPrimaryDocuments<F extends BaseFrontmatter>(
  collection: Collection<F>,
): Array<ContentDocument<F>> {
  return listDocuments(collection).filter((doc) => !doc.variant);
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
  // Annotated rather than inferred: the registry's values are a union of
  // per-collection handles, and a union is what one inferred frontmatter type
  // cannot be. Widening to the base shape is all a caller across collections
  // wants from them anyway.
  const collections: Collection[] = Object.values(COLLECTION_SCHEMAS);

  return collections.flatMap((collection) => listDocuments(collection));
}
