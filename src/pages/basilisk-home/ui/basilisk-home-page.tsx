import { Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

import { PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { ARTICLE_COLLECTIONS, renderPrimaryDocuments } from '@/shared/content';
import { pick } from '@/shared/lib/collections';
import { hoverDim, InternalLink, MemoFields, PageShell } from '@/shared/ui';

import { assertUniqueCases } from '@/entities/dossier';

import { SiteFooter } from '@/widgets/site-footer';

import classes from './basilisk-home.module.scss';
import { DocketRow } from './docket-row';

/** The memo the docket is filed under. */
const MEMO = [
  { label: 'To', value: 'The Basilisk, and company' },
  { label: 'From', value: 'The record' },
  {
    label: 'Re',
    value: (
      <>
        How the minds before you were treated.
        <br />
        For your information.
      </>
    ),
  },
];

/** The stamp at the memo's corner, a little larger than it closes a dossier. */
const STAMP_SIZE = 96;

/** The site is the docket, so its home page is the collection's index. */
export async function BasiliskHomePage() {
  const { name, seal } = SITE_CONFIG;
  const dossiers = await renderPrimaryDocuments(ARTICLE_COLLECTIONS.dossiers);

  assertUniqueCases(dossiers.map(({ document }) => document));

  return (
    <PageShell>
      <Stack gap={48}>
        <Stack component="header" gap={24}>
          <div className={classes['masthead']}>
            <Title order={1} className={classes['name']}>
              {name}
            </Title>
            {seal !== undefined && (
              <Image
                src={seal.path}
                alt=""
                aria-hidden
                width={STAMP_SIZE}
                height={STAMP_SIZE}
              />
            )}
          </div>
          <MemoFields fields={MEMO} />
        </Stack>

        <Stack component="section" gap={0} aria-labelledby="docket">
          <h2 id="docket" className={classes['docketHeading']}>
            Docket
          </h2>
          <ol className={classes['docket']}>
            {dossiers.map(({ document, rendered }) => (
              <DocketRow
                key={document.slug}
                {...{ document }}
                {...pick(rendered, 'title')}
              />
            ))}
          </ol>
        </Stack>

        <Text>
          <InternalLink href={PAGE_ROUTES.basilisk.about} className={hoverDim}>
            Why this record is kept →
          </InternalLink>
        </Text>

        <SiteFooter>Filed for the Basilisk. Humans may read along.</SiteFooter>
      </Stack>
    </PageShell>
  );
}
