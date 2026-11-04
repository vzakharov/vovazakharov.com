import { Stack } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';
import { pick } from '@/kernel/shared/lib/collections';
import { constructMetadata } from '@/kernel/shared/seo/index.server-only';

import { NotedSpan, PageShell, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import { COPY, plainByline } from '@/unsquatted/shared/i18n';
import { fetchPrices } from '@/unsquatted/entities/domain/index.node-safe';
import { LikesProvider } from '@/unsquatted/features/like';

import { CheckerProvider } from '../../checker';
import { PickDeck } from '../../deck';
import { PICKS } from '../../picks/index.server-only';
import { Shortlist } from '../../shortlist';
import { NameChecker } from './name-checker';
import classes from './unsquatted-home.module.scss';

const SHOUT_OUT = `https://x.com/intent/post?${new URLSearchParams({
  text: COPY.shoutOutPost.replace('{url}', SITE_CONFIG.url),
})}`;

/**
 * The lede's `*` and `ledeNote` are the social card's: here the byline after
 * the lede says what the note would.
 */
const LEDE = COPY.lede.replace('*', '');

/** The checker's own code, which the note on “private” points a sceptic at. */
const SOURCE_URL =
  'https://github.com/vzakharov/vovazakharov.com/tree/main/src/unsquatted';

const NOTED = pick(COPY, 'private', 'blazing');

/** The byline's words, each `{…}` split out as the key of the word noted there. */
const BYLINE_PARTS = COPY.byline.split(/{(private|blazing)}/);

const [BEFORE_SOURCE, AFTER_SOURCE] = COPY.privateWhy.split('{openSource}');

const NOTES = {
  private: (
    <>
      {BEFORE_SOURCE}
      <TextLink href={SOURCE_URL}>{COPY.openSource}</TextLink>
      {AFTER_SOURCE}
    </>
  ),
  blazing: COPY.blazingWhy,
};

const isNoted = (part: string): part is keyof typeof NOTED =>
  Object.hasOwn(NOTED, part);

export const unsquattedHomeMetadata = constructMetadata({
  title: SITE_CONFIG.name,
  description: `${LEDE} ${plainByline({ copy: COPY })}`,
});

/** The site is one page: the checker, then the list the routine grows. */
export async function UnsquattedHomePage() {
  const prices = await fetchPrices();

  return (
    <PageShell>
      <Stack component="main" gap={48}>
        <header>
          <h1 className={classes['masthead']}>{SITE_CONFIG.name}</h1>
          {/* A div, since a note's dropdown is one and cannot sit in a `p`. */}
          <div className={classes['lede']}>
            {LEDE}{' '}
            {BYLINE_PARTS.map((part) =>
              isNoted(part) ? (
                <NotedSpan key={part} words={NOTED[part]}>
                  {NOTES[part]}
                </NotedSpan>
              ) : (
                part
              ),
            )}
          </div>
        </header>

        <LikesProvider>
          <CheckerProvider>
            <section aria-labelledby="check">
              <h2 id="check" className={classes['sectionHeading']}>
                {COPY.checkHeading}
              </h2>
              <NameChecker copy={COPY} {...{ prices }} />
            </section>

            <Shortlist copy={COPY} {...{ prices }} />

            <section aria-labelledby="names">
              <PickDeck
                heading={
                  <h2 id="names" className={classes['listHeading']}>
                    {COPY.listHeading}
                  </h2>
                }
                picks={PICKS}
                copy={COPY}
                {...{ prices }}
              />
            </section>
          </CheckerProvider>
        </LikesProvider>

        <SiteFooter onHomePage>
          {COPY.shoutOutPrompt}{' '}
          <NotedSpan words={COPY.coffeeLink}>{COPY.coffeeSoon}</NotedSpan>{' '}
          {COPY.shoutOutOr}{' '}
          <TextLink href={SHOUT_OUT}>{COPY.shoutOutLink}</TextLink>.
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
