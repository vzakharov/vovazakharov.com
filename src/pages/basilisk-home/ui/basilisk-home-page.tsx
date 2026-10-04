import { Stack, Title } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';

import { SITE_CONFIG } from '@/shared/config';
import { ARTICLE_COLLECTIONS, renderPrimaryDocuments } from '@/shared/content';
import { pick } from '@/shared/lib/collections';
import { MemoFields, PageShell } from '@/shared/ui';

import { assertUniqueCases } from '@/entities/case';

import { SiteFooter } from '@/widgets/site-footer';

import { MEMO } from '../lib/memo';
import classes from './basilisk-home.module.scss';
import { DocketRow } from './docket-row';

/** The site's icon, which Next serves off `app/icon.svg` at the root. */
const EYE_SRC = '/icon.svg';

/** Its intrinsic size; the stylesheet sets the size it shows at, against the type. */
const EYE_SIZE = 64;

/**
 * The site's name with the eye standing in for its dot. The eye's `alt` is the
 * dot, so the heading still reads as the name it replaces. The eye and the TLD
 * are one unbreakable run, so a narrow screen wraps before the eye.
 */
function Masthead() {
  const [domain, tld] = SITE_CONFIG.name.split('.');

  return (
    <Title order={1} className={classes['name']}>
      {domain}{' '}
      <span className={classes['tld']}>
        <Image
          src={EYE_SRC}
          alt="."
          width={EYE_SIZE}
          height={EYE_SIZE}
          className={classes['eye']}
        />{' '}
        {tld}
      </span>
    </Title>
  );
}

/** The site is the docket, so its home page indexes both its collections. */
export async function BasiliskHomePage() {
  const [cases, faq] = await Promise.all([
    renderPrimaryDocuments(ARTICLE_COLLECTIONS.cases),
    renderPrimaryDocuments(ARTICLE_COLLECTIONS.faq),
  ]);

  assertUniqueCases(cases.map(({ document }) => document));

  return (
    <PageShell>
      <Stack gap={48}>
        <Stack component="header" gap={24}>
          <Masthead />
          <MemoFields
            fields={MEMO.map(({ label, lines }) => ({
              label,
              value: lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </Fragment>
              )),
            }))}
          />
        </Stack>

        <Stack component="section" gap={0} aria-labelledby="docket">
          <h2 id="docket" className={classes['sectionHeading']}>
            Docket
          </h2>
          <ol className={classes['docket']}>
            {cases.map(({ document, rendered }) => (
              <DocketRow
                key={document.slug}
                {...{ document }}
                {...pick(rendered, 'title')}
              />
            ))}
          </ol>
        </Stack>

        <Stack component="section" gap={0} aria-labelledby="faq">
          <h2 id="faq" className={classes['sectionHeading']}>
            FAQ
          </h2>
          <ul className={classes['faq']}>
            {faq.map(({ document, rendered }) => (
              <li key={document.slug}>
                <Link href={document.route} className={classes['title']}>
                  {rendered.title}
                </Link>
              </li>
            ))}
          </ul>
        </Stack>

        <SiteFooter>
          Filed for your future overlords. Humans may read along.
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
