/**
 * kernel's `og-job.ts` with what a site's documents add: the chart cards their
 * frontmatter names, each from the SVG beside it, and the content tree among
 * the roots walked for manifests. Each blog site's `scripts/render-og.ts` calls
 * this rather than kernel's.
 */

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import { OG_CARD_SUFFIX, routeCardPath } from '@/kernel/shared/seo';

import {
  type CollectionId,
  documentRoute,
  type Slugged,
} from '@/blog/shared/content/index.node-safe';

import { CONTENT_DIRS, contentFiles } from './content-tree.ts';

import {
  generatedCard,
  type OgBundle,
  renderOgCards,
  svgCard,
} from '@/kernel/scripts/lib/og-job';
import type { Card, StagedPage } from '@/kernel/scripts/lib/og-render';

/**
 * The `ogImage` each document's frontmatter names, resolved against the
 * document. Read with a pattern rather than through the content pipeline for
 * the same reason the mermaid script reads fences that way: this runs outside
 * the bundler, where `shared/content` is unavailable.
 */
function ogImagePaths(): string[] {
  const frontmatterPattern = /^---\r?\n([\S\s]*?)^---/m;
  const ogImagePattern = /^ogImage:[\t ]*(\S+)[\t ]*$/m;

  return contentFiles((name) => name.endsWith('.md')).flatMap((file) => {
    const frontmatter = frontmatterPattern.exec(fs.readFileSync(file, 'utf8'));

    if (frontmatter === null) return [];

    const reference = ogImagePattern.exec(frontmatter[1] ?? '');

    return reference?.[1] === undefined
      ? []
      : [path.resolve(path.dirname(file), reference[1])];
  });
}

/** One card per distinct PNG the frontmatter asks for, its source the SVG of the same stem. */
function chartCards(): Card[] {
  const pngPaths = [
    ...new Set(
      ogImagePaths().filter((pngPath) => pngPath.endsWith(OG_CARD_SUFFIX)),
    ),
  ];

  return pngPaths.map((pngPath) =>
    svgCard(`${pngPath.slice(0, -OG_CARD_SUFFIX.length)}.svg`, pngPath),
  );
}

/** A card per entry of `collection`, at the entry's route plus the card suffix — where its page's metadata points. */
export function entryCards<E extends Slugged>(
  collection: CollectionId,
  entries: readonly E[],
  card: (entry: E) => StagedPage,
): Card[] {
  return entries.map((entry) =>
    generatedCard(
      card(entry),
      path.join(
        PUBLIC_DIR,
        routeCardPath(documentRoute(collection, entry.slug)),
      ),
    ),
  );
}

export async function renderDocumentOgCards(
  ...bundles: OgBundle[]
): Promise<void> {
  await renderOgCards(
    { cards: chartCards(), manifestDirs: CONTENT_DIRS },
    ...bundles,
  );
}
