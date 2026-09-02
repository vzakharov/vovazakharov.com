import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import {
  COLLECTIONS,
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
    slug: variant ? [slug, variant] : [slug],
  }));
}

/** `[slug]` is the full document, `[slug, variant]` one of its shorter cuts. */
function parseSegments(
  segments: string[],
): { slug: string; variant?: Variant } | undefined {
  const [first] = segments;

  if (segments.length === 1 && first !== undefined) return { slug: first };

  if (segments.length === 2) {
    const [slug, suffix] = segments;
    const variant = VARIANTS.find((candidate) => candidate === suffix);

    return slug !== undefined && variant !== undefined
      ? { slug, variant }
      : undefined;
  }

  return undefined;
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
              href={COLLECTIONS[COLLECTION].routeBase}
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
                availableVariants={siblingVariants(COLLECTION, document.slug)}
              />
            </Box>

            <Box component="aside" className={classes['articleAside']}>
              <TableOfContents {...{ headings }} />
            </Box>

            <Box className={classes['articleBody']}>
              <ArticleBody {...{ html }} />
            </Box>
          </Box>

          <BackToHome />
        </Stack>
      </Container>
    </Box>
  );
}
