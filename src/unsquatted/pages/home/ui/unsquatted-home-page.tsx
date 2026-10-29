import { Stack } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';

import { PageShell, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import { COPY } from '../i18n';
import { fetchPrices } from '../lib/prices';
import { PICKS } from '../model/picks';
import { CheckerProvider } from './checker-state';
import { Hint } from './hint';
import { NameChecker } from './name-checker';
import { PickRow } from './pick-row';
import classes from './unsquatted-home.module.scss';

const SHOUT_OUT = `https://x.com/intent/post?${new URLSearchParams({
  text: COPY.shoutOutPost.replace('{url}', SITE_CONFIG.url),
})}`;

/** The site is one page: the checker, then the list the routine grows. */
export async function UnsquattedHomePage() {
  const prices = await fetchPrices();

  return (
    <PageShell>
      <Stack component="main" gap={48}>
        <header>
          <h1 className={classes['masthead']}>{SITE_CONFIG.name}</h1>
          <p className={classes['lede']}>
            {COPY.lede} <Hint label={COPY.blazingWhy}>{COPY.blazing}</Hint>.
          </p>
          <p className={classes['lede']}>
            {COPY.pledge} {COPY.coffeePrompt}{' '}
            <Hint label={COPY.coffeeSoon}>{COPY.coffeeLink}</Hint>.
          </p>
        </header>

        <CheckerProvider>
          <section aria-labelledby="check">
            <h2 id="check" className={classes['sectionHeading']}>
              {COPY.checkHeading}
            </h2>
            <NameChecker copy={COPY} {...{ prices }} />
          </section>

          <section aria-labelledby="names">
            <h2 id="names" className={classes['sectionHeading']}>
              {COPY.listHeading}
            </h2>
            <ul className={classes['picks']}>
              {PICKS.map(({ domain, category, blurb }) => (
                <PickRow
                  key={domain}
                  {...{ domain, category, blurb }}
                  copy={COPY}
                />
              ))}
            </ul>
          </section>
        </CheckerProvider>

        <SiteFooter onHomePage>
          {COPY.shoutOutPrompt}{' '}
          <TextLink href={SHOUT_OUT}>{COPY.shoutOutLink}</TextLink>.
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
