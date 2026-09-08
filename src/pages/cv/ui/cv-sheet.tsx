'use client';

import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Printer } from 'lucide-react';
import { useMessages, useTranslations } from 'next-intl';

import type { Messages } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { Card, InternalLink } from '@/shared/ui';

import { ThemeToggle } from '@/features/switch-theme';

import type { CvVariant, WithCvVariant } from '../lib/cv-variants';
import { CASE_STUDY_KEY, CaseStudyLink } from './case-study-link';
import classes from './cv.module.scss';
import { CvBullets } from './cv-bullets';
import { CvSection, CvSubsection } from './cv-section';
import { EXPERIENCE_KEYS, ExperienceCard } from './experience-card';
import { LocalePicker } from './locale-picker';
import { VariantSwitch } from './variant-switch';

function handlePrint() {
  globalThis.print();
}

/** Order is a presentation decision, as with the experience entries. */
const TECH_STACK_GROUPS = ['backend', 'frontend', 'serverless'] as const;

const PROFILE_PARAGRAPHS = ['paragraph1', 'paragraph2'] as const;

type OfferBlockKey = keyof Messages['cv']['whatIOffer']['blocks'];

/**
 * Which blocks each framing offers, and in what order — the one thing that
 * differs between the variants without differing in wording, so it lives in
 * code rather than in the catalogs.
 */
const OFFER_BLOCKS = {
  cto: ['engagements', 'engineeringSystem', 'aiExpertise', 'workingStyle'],
  dev: ['coreCapabilities', 'workingStyle', 'aiExpertise'],
} as const satisfies Record<CvVariant, readonly OfferBlockKey[]>;

export type CvSheetProps = WithCvVariant & {
  /** Resolved by the page: the registry that owns URL shapes is build-time-only. */
  caseStudyHref: string;
};

export function CvSheet({ variant, caseStudyHref }: CvSheetProps) {
  const t = useTranslations('cv');
  const { cv } = useMessages();

  return (
    <Box className={classes['page']}>
      <Container size={896} px={0} className={classes['container']}>
        <Stack className={classes['pageSections']}>
          <Group
            justify="space-between"
            align="flex-start"
            className="print-hidden"
          >
            <Button
              variant="default"
              size="md"
              h={50}
              px={12}
              leftSection={<Printer size={20} />}
              onClick={handlePrint}
              aria-label={t('printButton')}
            >
              / PDF
            </Button>
            <Group gap={8}>
              <VariantSwitch {...{ variant }} />
              <LocalePicker />
              <ThemeToggle />
            </Group>
          </Group>

          <Box component="header" ta="center" className={classes['header']}>
            <Stack className={classes['section']}>
              <Title order={1}>{t('header.name')}</Title>
              <Text className={cx(classes['tagline'], classes['dim80'])}>
                {t('header.tagline')}
              </Text>
              <Text className={cx(classes['printSmall'], classes['dim70'])}>
                <Anchor href={`mailto:${t('header.email')}`} inherit>
                  {t('header.email')}
                </Anchor>
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

                  return (
                    <CvSubsection key={key} title={block.title}>
                      {'items' in block ? (
                        <CvBullets items={block.items} last />
                      ) : (
                        block.paragraphs.map((paragraph, index) => (
                          <Text
                            key={index}
                            lh={1.625}
                            className={cx(
                              index < block.paragraphs.length - 1 &&
                                classes['tightHeading'],
                            )}
                          >
                            {paragraph}
                          </Text>
                        ))
                      )}
                    </CvSubsection>
                  );
                })}
                {/* The framing that leads with proof keeps the proof one click
                    from the claim, not only from the experience entry. */}
                {variant === 'cto' && <CaseStudyLink href={caseStudyHref} />}
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
                <Anchor href={`mailto:${t('header.email')}`} inherit>
                  {t('header.email')}
                </Anchor>
                ·
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

          <Box
            component="footer"
            ta="center"
            className={cx('print-hidden', classes['screenFooter'])}
          >
            <Text size="sm" className={classes['dim60']}>
              <InternalLink href="/" inherit>
                {t('footer.backLink')}
              </InternalLink>
            </Text>
          </Box>

          <Box
            component="footer"
            ta="center"
            className={cx('print-only', classes['printFooter'])}
          >
            <Text className={classes['small']}>
              {t('footer.printFooter')}&nbsp;
              <Anchor href={`https://${t('website')}`} inherit>
                {t('website')}
              </Anchor>
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
