import { Box, Stack, Text, Title } from '@mantine/core';
import Markdown from 'react-markdown';

import { MESSAGE_MARKDOWN } from '@/kernel/shared/i18n';
import { cx } from '@/kernel/shared/lib/class-names';
import { pick } from '@/kernel/shared/lib/collections';

import { Card, TextLink } from '@/shell/shared/ui';

import {
  type CvPageCopy,
  cvPath,
  leadsWithProof,
  OFFER_BLOCKS,
} from '@/vova/entities/cv';

import {
  CaseStudyLink,
  CV_CLASSES,
  CvFrame,
  CvHeader,
  CvSection,
  CvSubsection,
} from '../../frame';
import { CvOfferBlock } from './cv-offer-block';

const PROFILE_PARAGRAPHS = ['paragraph1', 'paragraph2'] as const;

/** The long form of the sheet's intro card: the whole profile and every offer block. */
export function CvProfileSheet({
  variant,
  locale,
  messages,
  caseStudy,
}: CvPageCopy) {
  const { cv } = messages;

  return (
    <CvFrame>
      <CvHeader>
        <Title order={1}>{cv.profilePage.title}</Title>
        <Text className={cx(CV_CLASSES['tagline'], CV_CLASSES['dim80'])}>
          {cv.header.name} · {cv.header.tagline}
        </Text>
      </CvHeader>

      <CvSection {...pick(cv.profile, 'title')}>
        <Card>
          <Stack className={CV_CLASSES['section']}>
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
          <Stack className={CV_CLASSES['section']}>
            {OFFER_BLOCKS[variant].map((key) => {
              const block = cv.whatIOffer.blocks[key];
              const { title } = block;

              return (
                <CvSubsection key={key} {...{ title }}>
                  <CvOfferBlock {...{ block }} />
                </CvSubsection>
              );
            })}
            {leadsWithProof(variant) && <CaseStudyLink {...caseStudy} />}
          </Stack>
        </Card>
      </CvSection>

      <Box
        component="footer"
        className={cx('print-hidden', CV_CLASSES['screenFooter'])}
      >
        <Text size="sm" className={CV_CLASSES['dim60']}>
          <TextLink href={cvPath(variant, locale)}>
            {cv.profilePage.back}
          </TextLink>
        </Text>
      </Box>
    </CvFrame>
  );
}
