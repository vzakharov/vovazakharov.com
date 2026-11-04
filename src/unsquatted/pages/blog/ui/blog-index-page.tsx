import { Stack } from '@mantine/core';
import Link from 'next/link';

import { SITE_CONFIG } from '@/kernel/shared/config';
import { pick } from '@/kernel/shared/lib/collections';

import { PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import { collectionRoute, renderPrimaryDocuments } from '@/blog/shared/content';
import { constructMetadata } from '@/blog/shared/seo';

import { postDomains, POSTS } from '@/unsquatted/shared/content';
import { COPY } from '@/unsquatted/shared/i18n';
import { OccasionStamp } from '@/unsquatted/entities/post';
import { Masthead } from '@/unsquatted/widgets/masthead';

import classes from './blog-index.module.scss';

/** The names a card shows before it counts the rest. */
const NAMES_SHOWN = 2;

/** The title as one string, where it travels without its subtitle under it. */
const WHOLE_TITLE = `${COPY.blog.title}${COPY.blog.subtitle}`;

export const blogIndexMetadata = constructMetadata({
  title: `${WHOLE_TITLE} - ${SITE_CONFIG.name}`,
  ...pick(COPY.blog, 'description'),
  path: collectionRoute(POSTS.id),
});

/** `letmeal.one · monachal.com · +4`. */
function namesLine(domains: readonly string[]): string {
  const rest = domains.length - NAMES_SHOWN;

  return [
    ...domains.slice(0, NAMES_SHOWN),
    ...(rest > 0 ? [`+${rest}`] : []),
  ].join(' · ');
}

/**
 * The Unnamed's blog: the title, its subtitle carrying the same sentence on,
 * his line, then the posts newest first, each stamped with its occasion's day
 * and showing the first names it picked.
 */
export async function BlogIndexPage() {
  const cards = await Promise.all(
    (await renderPrimaryDocuments(POSTS)).map(async (card) => ({
      ...card,
      names: namesLine(await postDomains(card.document)),
    })),
  );

  return (
    <PageShell>
      <Stack component="main" gap={40} className={classes['column']}>
        <Masthead />
        <header>
          <p className={classes['eyebrow']}>{COPY.blog.eyebrow}</p>
          <h1 className={classes['title']}>{COPY.blog.title}</h1>
          <p className={classes['subtitle']}>{COPY.blog.subtitle}</p>
          <p className={classes['intro']}>
            {COPY.blog.intro} — <i>{COPY.blog.signature}</i>
          </p>
        </header>

        <ol className={classes['posts']}>
          {cards.map(({ document, rendered, names }) => (
            <li key={document.slug} className={classes['post']}>
              <OccasionStamp
                {...pick(document.frontmatter, 'occasion')}
                href={document.route}
              />
              <div>
                <Link href={document.route} className={classes['postTitle']}>
                  {rendered.title}
                </Link>
                <p className={classes['description']}>
                  {document.frontmatter.description}
                </p>
                {names !== '' && <p className={classes['names']}>{names}</p>}
              </div>
            </li>
          ))}
        </ol>

        <SiteFooter />
      </Stack>
    </PageShell>
  );
}
