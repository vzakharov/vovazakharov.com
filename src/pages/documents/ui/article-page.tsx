import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import {
  ARTICLE_COLLECTIONS,
  type ArticleCollectionId,
  type ArticleFrontmatterOf,
  type Collection,
  collectionListingRoute,
  COLLECTIONS,
  documentName,
  listDocuments,
  loadDocument,
  renderDocument,
  siblingVariants,
  type Variant,
  VARIANTS,
} from '@/shared/content';
import { constructArticleMetadata } from '@/shared/seo/index.server-only';
import type { WithParams } from '@/shared/typings';
import { BackToHome, hoverDim, InternalLink } from '@/shared/ui';

import { ProseContent } from '@/entities/document';

import { ArticleHeader } from './article-header';
import { ARTICLE_SLOTS } from './article-slots';
import classes from './documents.module.scss';
import { PrintSheet } from './print-sheet';
import { TableOfContents } from './table-of-contents';

/**
 * The registry restated per key, which the compiler checks entry by entry; a
 * lookup by a generic id then reads as that collection's own frontmatter,
 * where one on `ARTICLE_COLLECTIONS` widens to the union of all three.
 */
const HANDLES: {
  [C in ArticleCollectionId]: Collection<ArticleFrontmatterOf<C>>;
} = ARTICLE_COLLECTIONS;

/** The catch-all's own segment: `<slug>[.<variant>]`, still to be split. */
type WithSlugSegments = { slug: string[] };

type Props = WithParams<WithSlugSegments>;

/**
 * Splits the single `<slug>[.<variant>]` segment. A trailing suffix that is not
 * a known variant stays part of the slug — the same rule `parseFileName`
 * applies to file names, which is what keeps route and file in agreement.
 */
function parseSegments(
  segments: string[],
): { slug: string; variant?: Variant } | undefined {
  const [name] = segments;

  if (segments.length !== 1 || name === undefined) return undefined;

  const variant = VARIANTS.find((candidate) => name.endsWith(`.${candidate}`));

  return variant === undefined
    ? { slug: name }
    : { slug: name.slice(0, -(variant.length + 1)), variant };
}

/**
 * One collection's article route, as the three exports Next reads off a route
 * module. A factory rather than a module-level constant because both sites'
 * articles are this one page — the collection is the only thing that differs,
 * and it arrives from whichever router mounted the page.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- `C` correlates HANDLES[collection] with ARTICLE_SLOTS[collection] (microsoft/TypeScript#47109); without it `slots.brief` takes no document type
export function articleRoute<C extends ArticleCollectionId>(collection: C) {
  const handle = HANDLES[collection];
  const slots = ARTICLE_SLOTS[collection];

  async function resolve(params: Props['params']) {
    const parsed = parseSegments((await params).slug);
    const document =
      parsed && loadDocument(handle, parsed.slug, parsed.variant);

    if (!document) notFound();

    return { document, rendered: await renderDocument(document) };
  }

  /**
   * One catch-all covers the full document and each of its cuts, so a new
   * markdown file in the collection is a new page with no route work.
   */
  function generateStaticParams() {
    return listDocuments(handle).map(({ slug, variant }) => ({
      slug: [documentName(slug, variant)],
    }));
  }

  async function generateMetadata({ params }: Props) {
    const { document, rendered } = await resolve(params);

    return constructArticleMetadata(document, rendered.title);
  }

  async function Page({ params }: Props) {
    const { document, rendered } = await resolve(params);
    const { route, slug } = document;
    const { title, readingMinutes, headings, tree } = rendered;

    return (
      <Box className={classes['articlePage']}>
        <Container size={1152} px={0}>
          <Stack gap={32}>
            <Group component="nav" className="print-hidden">
              <InternalLink
                href={collectionListingRoute(collection)}
                size="sm"
                className={hoverDim}
              >
                ← {COLLECTIONS[collection].label}
              </InternalLink>
            </Group>

            <PrintSheet {...{ route }}>
              {/*
                Three grid children rather than an article and a rail, so one
                DOM order serves both layouts: stacked, the reader gets the
                title, then the outline, then the prose; on a wide viewport the
                outline moves into its own column beside both.
              */}
              <Box component="article" className={classes['articleLayout']}>
                <Box className={classes['articleIntro']}>
                  <ArticleHeader
                    {...{ document, title, readingMinutes }}
                    availableVariants={siblingVariants(collection, slug)}
                  />
                  {slots?.brief?.(document)}
                </Box>

                <Box component="aside" className={classes['articleAside']}>
                  <TableOfContents {...{ headings }} />
                </Box>

                <Box className={classes['articleBody']}>
                  <ProseContent {...{ tree }} />
                  {slots?.coda?.(document)}
                </Box>
              </Box>
            </PrintSheet>

            <BackToHome />
          </Stack>
        </Container>
      </Box>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
