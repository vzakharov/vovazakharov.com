'use client';

import {
  Anchor,
  Box,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useLocale, useMessages, useTranslations } from 'next-intl';

import { cx } from '@/shared/lib/class-names';
import { Card, FileLink, InternalLink } from '@/shared/ui';

import { OFFER_BLOCKS } from '../lib/cv-offer';
import { cvPdfFile } from '../lib/cv-urls';
import type { WithCvVariant } from '../lib/cv-variants';
import { CASE_STUDY_KEY, CaseStudyLink } from './case-study-link';
import classes from './cv.module.scss';
import { CvBullets } from './cv-bullets';
import { CvOfferBlock } from './cv-offer-block';
import { CvSection, CvSubsection } from './cv-section';
import { EXPERIENCE_KEYS, ExperienceCard } from './experience-card';
import { LocalePicker } from './locale-picker';
import { OtherVariantLink } from './other-variant-link';

/** The addresses the sheet renders in more than one place. */
function EmailLink() {
  const t = useTranslations('cv');

  return (
    <Anchor href={`mailto:${t('header.email')}`} inherit>
      {t('header.email')}
    </Anchor>
  );
}

function WebsiteLink() {
  const t = useTranslations('cv');

  return (
    <Anchor href={`https://${t('website')}`} inherit>
      {t('website')}
    </Anchor>
  );
}

/** Order is a presentation decision, as with the experience entries. */
const TECH_STACK_GROUPS = ['backend', 'frontend', 'serverless'] as const;

const PROFILE_PARAGRAPHS = ['paragraph1', 'paragraph2'] as const;

export type CvSheetProps = WithCvVariant & {
  /** Resolved by the page: the registry that owns URL shapes is build-time-only. */
  caseStudyHref: string;
};

export function CvSheet({ variant, caseStudyHref }: CvSheetProps) {
  const t = useTranslations('cv');
  const { cv } = useMessages();
  const locale = useLocale();

  return (
    <Box className={classes['page']}>
      <Container size={896} px={0} className={classes['container']}>
        <Stack className={classes['pageSections']}>
          <Group
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={16}
            className="print-hidden"
          >
            <LocalePicker {...{ variant }} />
            <FileLink {...cvPdfFile(variant, locale)}>.pdf</FileLink>
          </Group>

          <Box component="header" ta="center" className={classes['header']}>
            <Stack className={classes['section']}>
              <Title order={1}>
                <InternalLink href="/" underline="never" inherit>
                  {t('header.name')}
                </InternalLink>
              </Title>
              <Text className={cx(classes['tagline'], classes['dim80'])}>
                {t('header.tagline')}
              </Text>
              <Text className={cx(classes['printSmall'], classes['dim70'])}>
                <EmailLink />
                {' · '}
                <WebsiteLink />
              </Text>
            </Stack>
          </Box>

          <CvSection title={t('profile.title')}>
            <Card>
              <Stack className={classes['section']}>
                {PROFILE_PARAGRAPHS.map((key) => (
                  <Text key={key} lh={1.625}>
                    {t.rich(`profile.${key}`, {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </Text>
                ))}
              </Stack>
            </Card>
          </CvSection>

          <CvSection title={t('whatIOffer.title')}>
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
                {/* The framing that leads with proof keeps it one click from
                    the claim. Screen only: the experience entry already prints
                    this address. */}
                {variant === 'cto' && (
                  <Box className="print-hidden">
                    <CaseStudyLink href={caseStudyHref} />
                  </Box>
                )}
              </Stack>
            </Card>
          </CvSection>

          <CvSection title={t('experience.title')} wide>
            <Stack className={classes['sectionWide']}>
              {EXPERIENCE_KEYS.map((entryKey) => (
                <ExperienceCard
                  key={entryKey}
                  {...{ entryKey }}
                  caseStudyHref={
                    entryKey === CASE_STUDY_KEY ? caseStudyHref : undefined
                  }
                />
              ))}
            </Stack>
          </CvSection>

          <CvSection title={t('techStack.title')}>
            <Card>
              <Stack className={classes['subsections']}>
                {TECH_STACK_GROUPS.map((group) => {
                  const { title, items } = cv.techStack[group];

                  return (
                    <CvSubsection key={group} {...{ title }}>
                      <CvBullets {...{ items }} last />
                    </CvSubsection>
                  );
                })}
              </Stack>
            </Card>
          </CvSection>

          <CvSection title={t('education.title')}>
            <Card>
              <Title order={3} className={classes['subheadingLarge']}>
                {t('education.school')}
              </Title>
              <Text className={cx(classes['printSmall'], classes['dim80'])}>
                {t('education.degree')}
              </Text>
            </Card>
          </CvSection>

          <CvSection title={t('contact.title')}>
            <Card>
              <Group
                gap={8}
                justify="center"
                className={classes['contactLine']}
                wrap="wrap"
              >
                <EmailLink />·
                <Anchor
                  href={`https://${t('contact.github')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  {t('contact.github')}
                </Anchor>
                ·
                <Anchor
                  href={`https://${t('contact.linkedin')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  {t('contact.linkedin')}
                </Anchor>
                ·
                <Anchor
                  href={`https://${t('contact.x')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  {t('contact.x')}
                </Anchor>
              </Group>
            </Card>
          </CvSection>

          <Group
            component="footer"
            justify="space-between"
            className={cx('print-hidden', classes['screenFooter'])}
          >
            <Text size="sm" className={classes['dim60']}>
              <InternalLink href="/" inherit>
                {t('footer.backLink')}
              </InternalLink>
            </Text>
            <OtherVariantLink {...{ variant }} />
          </Group>

          <Box
            component="footer"
            ta="center"
            className={cx('print-only', classes['printFooter'])}
          >
            <Text className={classes['small']}>
              {t('footer.printFooter')}&nbsp;
              <WebsiteLink />
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
