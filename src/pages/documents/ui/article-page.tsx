import { Box, Container, Group, Stack } from '@mantine/core';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/shared/config';
import {
  ARTICLE_COLLECTIONS,
  type ArticleCollectionId,
  type ArticleFrontmatterOf,
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
} from '@/shared/content';
import {
  DEFAULT_LOCALE,
  inLocale,
  isLocale,
  type Locale,
  localeTailAddresses,
} from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { constructArticleMetadata } from '@/shared/seo/index.server-only';
import type { WithParams } from '@/shared/typings';
import { hoverDim, TextLink } from '@/shared/ui';

import { ProseContent, SourceList } from '@/entities/document';

import { SiteFooter } from '@/widgets/site-footer';

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
 * module. A factory rather than a module-level constant because both sites'
 * articles are this one page — the collection is the only thing that differs,
 * and it arrives from whichever router mounted the page.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- `C` correlates HANDLES[collection] with ARTICLE_SLOTS[collection] (microsoft/TypeScript#47109); without it `slots.brief` takes no document type
export function articleRoute<C extends ArticleCollectionId>(collection: C) {
  const handle = HANDLES[collection];
  const slots = ARTICLE_SLOTS[collection];
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
                    {...{ document, title, readingMinutes }}
                    availableVariants={siblingVariants(collection, slug)}
                    eyebrow={slots?.eyebrow?.(document)}
                    mark={slots?.mark?.(document)}
                  />
                  {slots?.brief?.(document)}
                </Box>

                <Box component="aside" className={classes['articleAside']}>
                  <TableOfContents {...{ headings }} />
                </Box>

                <Box className={classes['articleBody']}>
                  <ProseContent
                    {...{ tree }}
                    afterLead={slots?.afterLead?.(document)}
                  />
                  {SITE_CONFIG.listsSources && (
                    <SourceList {...pick(frontmatter, 'sources')} />
                  )}
                </Box>
              </Box>
            </PrintSheet>

            <SiteFooter
              {...{ locale }}
              home={collectionRoute(collection, document.locale)}
              byline={slots?.byline?.(document)}
            />
          </Stack>
        </Container>
      </Box>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
