import { Box, Container, Stack, Text, Title } from '@mantine/core';
import Markdown from 'react-markdown';

import { MESSAGE_MARKDOWN, type Messages } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import { Card, TextLink } from '@/shared/ui';

import { leadsWithProof, OFFER_BLOCKS } from '../lib/cv-offer';
import { cvPath } from '../lib/cv-urls';
import type { CvEdition } from '../lib/cv-variants';
import { CASE_STUDY_KEY, CaseStudyLink } from './case-study-link';
import classes from './cv.module.scss';
import { CvOfferBlock } from './cv-offer-block';
import { CvSection, CvSubsection } from './cv-section';

const PROFILE_PARAGRAPHS = ['paragraph1', 'paragraph2'] as const;

export type CvProfileSheetProps = CvEdition & {
  messages: Messages;
  caseStudyHref: string;
};

/** The long form of the sheet's intro card: the whole profile and every offer block. */
export function CvProfileSheet({
  variant,
  locale,
  messages,
  caseStudyHref,
}: CvProfileSheetProps) {
  const { cv } = messages;
  const back = (
    <TextLink href={cvPath(variant, locale)}>{cv.profilePage.back}</TextLink>
  );

  return (
    <Box className={classes['page']}>
      <Container size={896} px={0} className={classes['container']}>
        <Stack className={classes['pageSections']}>
          <Box component="header" className={classes['header']}>
            <Stack ta="center" className={classes['section']}>
              <Title order={1}>{cv.profilePage.title}</Title>
              <Text className={cx(classes['tagline'], classes['dim80'])}>
                {cv.header.name} · {cv.header.tagline}
              </Text>
            </Stack>
          </Box>

          <CvSection {...pick(cv.profile, 'title')}>
            <Card>
              <Stack className={classes['section']}>
                {PROFILE_PARAGRAPHS.map((key) => (
                  <Text key={key} lh={1.625}>
                    <Markdown {...MESSAGE_MARKDOWN}>{cv.profile[key]}</Markdown>
                  </Text>
                ))}
              </Stack>
            </Card>
          </CvSection>

          <CvSection {...pick(cv.whatIOffer, 'title')}>
            <Card>
              <Stack className={classes['section']}>
                {OFFER_BLOCKS[variant].map((key) => {
                  const block = cv.whatIOffer.blocks[key];
                  const { title } = block;

                  return (
                    <CvSubsection key={key} {...{ title }}>
                      <CvOfferBlock {...{ block }} />
                    </CvSubsection>
                  );
                })}
                {leadsWithProof(variant) && (
                  <CaseStudyLink
                    href={caseStudyHref}
                    label={cv.caseStudies[CASE_STUDY_KEY].link}
                  />
                )}
              </Stack>
            </Card>
          </CvSection>

          <Box
            component="footer"
            className={cx('print-hidden', classes['screenFooter'])}
          >
            <Text size="sm" className={classes['dim60']}>
              {back}
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
