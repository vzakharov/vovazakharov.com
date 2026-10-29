import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/kernel/shared/config';
import {
  DEFAULT_LOCALE,
  inLocale,
  isLocale,
  type Locale,
  localeTailAddresses,
} from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import type { WithParams } from '@/kernel/shared/typings';

import { hoverDim, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import type { ArticleSlots } from '@/blog/shared/article-slots';
import {
  type ArticleFrontmatter,
  type Collection,
  collectionListingRoute,
  collectionRoute,
  COLLECTIONS,
  documentName,
  isTranslated,
  listDocuments,
  loadDocument,
  renderDocument,
  siblingVariants,
  type Variant,
  VARIANTS,
} from '@/blog/shared/content';
import { constructArticleMetadata } from '@/blog/shared/seo';
import { ProseContent } from '@/blog/shared/ui';
import { SourceList } from '@/blog/entities/document';

import classes from './article.module.scss';
import { ArticleHeader } from './article-header';
import { PrintSheet } from './print-sheet';
import { TableOfContents } from './table-of-contents';

/**
 * The catch-all's own segments: `<slug>[.<variant>]`, still to be split, and
 * the locale after it where the collection keeps one file per language.
 */
type WithSlugSegments = { slug: string[] };

type Props = WithParams<WithSlugSegments>;

/**
 * Splits the `<slug>[.<variant>]` segment. A trailing suffix that is not a
 * known variant stays part of the slug — the same rule `parseFileName` applies
 * to file names, which is what keeps route and file in agreement. A locale
 * segment after it is read only where `translated` says the collection has
 * one.
 */
function parseSegments(
  segments: string[],
  translated: boolean,
): { slug: string; variant?: Variant; locale?: Locale } | undefined {
  const [name, locale, ...rest] = segments;

  if (name === undefined || rest.length > 0) return undefined;
  if (locale !== undefined && !(translated && isLocale(locale))) {
    return undefined;
  }

  const variant = VARIANTS.find((candidate) => name.endsWith(`.${candidate}`));
  const parsed =
    variant === undefined
      ? { slug: name }
      : { slug: name.slice(0, -(variant.length + 1)), variant };

  return translated ? { ...parsed, locale: locale ?? DEFAULT_LOCALE } : parsed;
}

/**
 * One collection's article route, as the three exports Next reads off a route
 * module. A factory rather than a module-level constant because every site's
 * articles are this one page — the collection and what it adds to the page are
 * all that differs, and both arrive from whichever router mounted it.
 */
export function articleRoute<F extends ArticleFrontmatter>(
  handle: Collection<F>,
  slots: ArticleSlots<F> = () => ({}),
) {
  const { id: collection } = handle;
  const translated = isTranslated(collection);

  async function resolve(params: Props['params']) {
    const parsed = parseSegments((await params).slug, translated);
    const document =
      parsed &&
      loadDocument(handle, parsed.slug, parsed.variant, parsed.locale);

    if (!document) notFound();

    return { document, rendered: await renderDocument(document) };
  }

  /**
   * One catch-all covers the full document and each of its cuts, so a new
   * markdown file in the collection is a new page with no route work. A
   * translated document answers at its locale-less alias and once per
   * language, each language's file listed once.
   */
  function generateStaticParams() {
    return listDocuments(handle)
      .filter(({ locale }) => !translated || locale === DEFAULT_LOCALE)
      .flatMap(({ slug, variant }) => {
        const name = documentName(slug, variant);

        return translated ? localeTailAddresses(name) : [[name]];
      })
      .map((segments) => ({ slug: segments }));
  }

  async function generateMetadata({ params }: Props) {
    const { document, rendered } = await resolve(params);

    return constructArticleMetadata(document, rendered.title);
  }

  async function Page({ params }: Props) {
    const { document, rendered } = await resolve(params);
    const { route, slug, frontmatter } = document;
    const { title, readingMinutes, headings, tree } = rendered;
    const locale = document.locale ?? SITE_CONFIG.locale;
    const { eyebrow, mark, brief, afterLead, byline } = slots(document);

    return (
      <Box className={classes['articlePage']}>
        <Container size={1152} px={0}>
          <Stack gap={32}>
            <Group component="nav" className="print-hidden">
              <TextLink
                href={collectionListingRoute(collection, document.locale)}
                size="sm"
                className={hoverDim}
              >
                ← {inLocale(COLLECTIONS[collection].label, locale)}
              </TextLink>
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
                    {...{ document, title, readingMinutes, eyebrow, mark }}
                    availableVariants={siblingVariants(collection, slug)}
                  />
                  {brief}
                </Box>

                <Box component="aside" className={classes['articleAside']}>
                  <TableOfContents {...{ headings }} />
                </Box>

                <Box className={classes['articleBody']}>
                  <ProseContent {...{ tree, afterLead }} />
                  {SITE_CONFIG.listsSources && (
                    <SourceList {...pick(frontmatter, 'sources')} />
                  )}
                </Box>
              </Box>
            </PrintSheet>

            <SiteFooter
              {...{ locale, byline }}
              home={collectionRoute(collection, document.locale)}
            />
          </Stack>
        </Container>
      </Box>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
