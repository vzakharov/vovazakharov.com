import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import {
  collectionRoute,
  COLLECTIONS,
  documentName,
  listDocuments,
  loadDocument,
  renderDocument,
  siblingVariants,
  type Variant,
  VARIANTS,
} from '@/shared/content';
import { constructArticleMetadata } from '@/shared/seo';
import { InternalLink } from '@/shared/ui';

import { ThemeToggle } from '@/features/switch-theme';

import { ArticleBody } from './article-body';
import { ArticleHeader } from './article-header';
import { BackToHome } from './back-to-home';
import classes from './case-studies.module.scss';
import { PrintedFrom } from './printed-from';
import { TableOfContents } from './table-of-contents';

const COLLECTION = 'case-studies';

type Props = {
  params: Promise<{ slug: string[] }>;
};

/**
 * One catch-all covers the full document and each of its cuts, so a new
 * markdown file in the collection is a new page with no route work.
 */
export function generateArticleParams() {
  return listDocuments(COLLECTION).map(({ slug, variant }) => ({
    slug: [documentName(slug, variant)],
  }));
}

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

async function resolve(params: Props['params']) {
  const parsed = parseSegments((await params).slug);
  const document =
    parsed && loadDocument(COLLECTION, parsed.slug, parsed.variant);

  if (!document) notFound();

  return { document, rendered: await renderDocument(document) };
}

export async function generateArticleMetadata({ params }: Props) {
  const { document, rendered } = await resolve(params);

  return constructArticleMetadata(document, rendered.title);
}

export async function ArticlePage({ params }: Props) {
  const { document, rendered } = await resolve(params);
  const { route, slug } = document;
  const { title, readingMinutes, headings, html } = rendered;

  return (
    <Box className={classes['articlePage']}>
      <Container size={1152} px={0}>
        <Stack gap={32}>
          <Group
            component="nav"
            justify="space-between"
            className="print-hidden"
          >
            <InternalLink
              href={collectionRoute(COLLECTION)}
              size="sm"
              className={classes['hoverDim']}
            >
              ← {COLLECTIONS[COLLECTION].label}
            </InternalLink>
            <ThemeToggle />
          </Group>

          {/*
            Three grid children rather than an article and a rail, so one DOM
            order serves both layouts: stacked, the reader gets the title, then
            the outline, then the prose; on a wide viewport the outline moves
            into its own column beside both.
          */}
          <Box component="article" className={classes['articleLayout']}>
            <Box className={classes['articleIntro']}>
              <ArticleHeader
                {...{ document, title, readingMinutes }}
                availableVariants={siblingVariants(COLLECTION, slug)}
              />
            </Box>

            <Box component="aside" className={classes['articleAside']}>
              <TableOfContents {...{ headings }} />
            </Box>

            <Box className={classes['articleBody']}>
              <ArticleBody {...{ html }} />
            </Box>
          </Box>

          <PrintedFrom {...{ route }} />
          <BackToHome />
        </Stack>
      </Container>
    </Box>
  );
}
