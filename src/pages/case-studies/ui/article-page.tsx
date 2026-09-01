import { notFound } from 'next/navigation';
import { Box, Container, Group, Stack } from '@mantine/core';

import { ThemeToggle } from '@/features/switch-theme';
import {
  COLLECTIONS,
  VARIANTS,
  listDocuments,
  loadDocument,
  renderDocument,
  siblingVariants,
  type Variant,
} from '@/shared/content';
import { constructArticleMetadata } from '@/shared/seo';
import { InternalLink } from '@/shared/ui';
import { ArticleBody } from './article-body';
import { ArticleHeader } from './article-header';
import { BackToHome } from './back-to-home';
import { TableOfContents } from './table-of-contents';
import classes from './case-studies.module.scss';

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
  segments: string[]
): { slug: string; variant?: Variant } | undefined {
  if (segments.length === 1) return { slug: segments[0] };

  if (segments.length === 2) {
    const [slug, variant] = segments;

    return (VARIANTS as readonly string[]).includes(variant)
      ? { slug, variant: variant as Variant }
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

  return (
    <Box className={classes.articlePage}>
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
              className={classes.hoverDim}
            >
              ← {COLLECTIONS[COLLECTION].label}
            </InternalLink>
            <ThemeToggle />
          </Group>

          <Box component="article" className={classes.articleLayout}>
            <Box className={classes.articleIntro}>
              <ArticleHeader
                document={document}
                title={rendered.title}
                readingMinutes={rendered.readingMinutes}
                availableVariants={siblingVariants(COLLECTION, document.slug)}
              />
            </Box>

            <Box component="aside" className={classes.articleAside}>
              <TableOfContents headings={rendered.headings} />
            </Box>

            <Box className={classes.articleBody}>
              <ArticleBody html={rendered.html} />
            </Box>
          </Box>

          <BackToHome />
        </Stack>
      </Container>
    </Box>
  );
}
