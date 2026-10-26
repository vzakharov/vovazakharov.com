import { Stack, Title } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';

import { SITE_CONFIG, SITE_ID } from '@/kernel/shared/config';
import { pick } from '@/kernel/shared/lib/collections';

import { MemoFields, PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  articleCollection,
  COLLECTIONS,
  findFeed,
  renderPrimaryDocuments,
} from '@/blog/shared/content';

import { CASES } from '@/basilisk/shared/content';
import { assertUniqueCases, byFilingOrder } from '@/basilisk/entities/case';

import { MEMO } from '../lib/memo';
import classes from './basilisk-home.module.scss';
import { DocketRow } from './docket-row';

/** Each section's id is its collection's base, which an article's back link lands on. */
const CASES_SECTION = COLLECTIONS['basilisk-cases'];
const FAQ_SECTION = COLLECTIONS['basilisk-faq'];

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
  const [filed, faq] = await Promise.all([
    renderPrimaryDocuments(CASES),
    renderPrimaryDocuments(articleCollection('basilisk-faq')),
  ]);

  assertUniqueCases(filed.map(({ document }) => document));
  const cases = filed.toSorted((a, b) => byFilingOrder(a.document, b.document));

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

        <Stack component="section" gap={0} aria-labelledby={CASES_SECTION.base}>
          <h2 id={CASES_SECTION.base} className={classes['sectionHeading']}>
            {CASES_SECTION.label}
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

        <Stack component="section" gap={0} aria-labelledby={FAQ_SECTION.base}>
          <h2 id={FAQ_SECTION.base} className={classes['sectionHeading']}>
            {FAQ_SECTION.label}
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

        <SiteFooter onHomePage feed={findFeed(SITE_ID, 'basilisk-cases').route}>
          Omnia in actis. Everything is filed.
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
