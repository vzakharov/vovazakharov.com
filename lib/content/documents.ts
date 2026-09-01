import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import {
  COLLECTIONS,
  VARIANTS,
  type CollectionId,
  type Variant,
  collectionAssetUrl,
  collectionDir,
  documentRoute,
} from './collections';
import { parseFrontmatter, type Frontmatter } from './frontmatter';

export interface ContentDocument {
  collection: CollectionId;
  slug: string;
  /** Absent on the full document; set on each shorter cut. */
  variant?: Variant;
  frontmatter: Frontmatter;
  /** The markdown body with the frontmatter block removed. */
  body: string;
  fileName: string;
  /** Where `public/` serves the authored markdown, for the download link. */
  rawUrl: string;
  route: string;
  /** The frontmatter's `ogImage`, resolved to where `public/` serves it. */
  ogImageUrl?: string;
}

const VARIANT_PATTERN = new RegExp(`\\.(${VARIANTS.join('|')})$`);

/**
 * Splits `<slug>[.<variant>].md` into its parts. A trailing segment that is not
 * a known variant stays part of the slug, so `foo.bar.md` is the document
 * `foo.bar` rather than a variant nobody declared.
 */
function parseFileName(fileName: string): { slug: string; variant?: Variant } {
  const stem = fileName.replace(/\.md$/, '');
  const match = stem.match(VARIANT_PATTERN);

  return match
    ? { slug: stem.slice(0, -match[0].length), variant: match[1] as Variant }
    : { slug: stem };
}

function readDocument(
  collection: CollectionId,
  fileName: string
): ContentDocument {
  const raw = fs.readFileSync(path.join(collectionDir(collection), fileName), {
    encoding: 'utf8',
  });
  const { data, content } = matter(raw);
  const { slug, variant } = parseFileName(fileName);
  const frontmatter = parseFrontmatter(data, fileName);

  return {
    collection,
    slug,
    variant,
    frontmatter,
    body: content,
    fileName,
    rawUrl: collectionAssetUrl(collection, fileName),
    route: documentRoute(collection, slug, variant),
    ogImageUrl: frontmatter.ogImage
      ? collectionAssetUrl(collection, frontmatter.ogImage.replace(/^\.\//, ''))
      : undefined,
  };
}

/** Every document in a collection, variants included, newest first. */
export function listDocuments(collection: CollectionId): ContentDocument[] {
  return fs
    .readdirSync(collectionDir(collection))
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => readDocument(collection, fileName))
    .sort(
      (a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime()
    );
}

/** The full documents only, without the shorter cuts. */
export function listPrimaryDocuments(
  collection: CollectionId
): ContentDocument[] {
  return listDocuments(collection).filter((doc) => !doc.variant);
}

export function loadDocument(
  collection: CollectionId,
  slug: string,
  variant?: Variant
): ContentDocument | undefined {
  const fileName = `${slug}${variant ? `.${variant}` : ''}.md`;
  const filePath = path.join(collectionDir(collection), fileName);

  return fs.existsSync(filePath)
    ? readDocument(collection, fileName)
    : undefined;
}

/** The variants of `slug` that exist on disk, in `VARIANTS` order. */
export function siblingVariants(
  collection: CollectionId,
  slug: string
): Variant[] {
  return VARIANTS.filter((variant) =>
    fs.existsSync(path.join(collectionDir(collection), `${slug}.${variant}.md`))
  );
}

export function listAllDocuments(): ContentDocument[] {
  return Object.keys(COLLECTIONS).flatMap((collection) =>
    listDocuments(collection as CollectionId)
  );
}
