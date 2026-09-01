'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
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
import { ThemeToggle } from '@/features/switch-theme';
import { cx } from '@/shared/lib/class-names';
import { Card, InternalLink } from '@/shared/ui';
import { CvBullets, type BulletItem } from './cv-bullets';
import { CvSection, CvSubsection } from './cv-section';
import { ExperienceCard } from './experience-card';
import { LocalePicker } from './locale-picker';
import classes from './cv.module.scss';

/**
 * Order is a presentation decision, so it lives in code rather than in the
 * catalogs, where `en` and `ru` would be free to disagree about it.
 */
const EXPERIENCE_KEYS = [
  'playgram',
  'englishForKids',
  'orcool',
  'randddb',
  'independent',
  'voicemod',
] as const;

export type CvPageProps = {
  /** Resolved by the page: the registry that owns URL shapes is build-time-only. */
  caseStudyHref: string;
};

export function CvPage({ caseStudyHref }: CvPageProps) {
  const t = useTranslations('cv');
  const bullets = (key: string) => t.raw(key) as BulletItem[];

  return (
    <Box className={classes.page}>
      <Container size={896} px={0} className={classes.container}>
        <Stack className={classes.pageSections}>
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
              onClick={() => window.print()}
              aria-label={t('printButton')}
            >
              / PDF
            </Button>
            <Group gap={8}>
              <LocalePicker />
              <ThemeToggle />
            </Group>
          </Group>

          <Box component="header" ta="center" className={classes.header}>
            <Stack className={classes.section}>
              <Title order={1}>{t('header.name')}</Title>
              <Text className={cx(classes.tagline, classes.dim80)}>
                {t('header.tagline')}
              </Text>
              <Text className={cx(classes.printSmall, classes.dim70)}>
                <Anchor href={`mailto:${t('header.email')}`} inherit>
                  {t('header.email')}
                </Anchor>
              </Text>
            </Stack>
          </Box>

          <CvSection title={t('profile.title')}>
            <Card>
              <Stack className={classes.section}>
                <Text lh={1.625}>
                  {t.rich('profile.paragraph1', {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </Text>
                <Text lh={1.625}>{t('profile.paragraph2')}</Text>
              </Stack>
            </Card>
          </CvSection>

          <CvSection title={t('whatIOffer.title')}>
            <Card>
              <Stack className={classes.section}>
                <CvSubsection title={t('whatIOffer.coreCapabilities.title')}>
                  <CvBullets
                    items={[
                      t('whatIOffer.coreCapabilities.item1'),
                      t('whatIOffer.coreCapabilities.item2'),
                      t('whatIOffer.coreCapabilities.item3'),
                    ]}
                    last
                  />
                </CvSubsection>

                <CvSubsection title={t('whatIOffer.workingStyle.title')}>
                  <Text lh={1.625} className={classes.tightHeading}>
                    {t('whatIOffer.workingStyle.paragraph1')}
                  </Text>
                  <Text lh={1.625}>
                    {t('whatIOffer.workingStyle.paragraph2')}
                  </Text>
                </CvSubsection>

                <CvSubsection title={t('whatIOffer.aiExpertise.title')}>
                  <Text lh={1.625}>
                    {t('whatIOffer.aiExpertise.paragraph')}
                  </Text>
                </CvSubsection>
              </Stack>
            </Card>
          </CvSection>

          <CvSection title={t('experience.title')} wide>
            <Stack className={classes.sectionWide}>
              {EXPERIENCE_KEYS.map((entryKey) => (
                <ExperienceCard key={entryKey} entryKey={entryKey} />
              ))}
            </Stack>
          </CvSection>

          <CvSection title={t('caseStudies.title')}>
            <Card>
              <Title
                order={3}
                size="h4"
                className={cx(classes.subheadingLarge, classes.tightHeading)}
              >
                {t('caseStudies.playgram.title')}
              </Title>
              <Text lh={1.625} className={classes.tight}>
                {t('caseStudies.playgram.description')}
              </Text>
              <Text size="sm">
                <InternalLink href={caseStudyHref} inherit>
                  {t('caseStudies.playgram.link')}
                </InternalLink>
              </Text>
            </Card>
          </CvSection>

          <CvSection title={t('techStack.title')}>
            <Card>
              <Stack className={classes.subsections}>
                <CvSubsection title={t('techStack.backend.title')}>
                  <CvBullets items={bullets('techStack.backend.items')} last />
                </CvSubsection>
                <CvSubsection title={t('techStack.frontend.title')}>
                  <CvBullets items={bullets('techStack.frontend.items')} last />
                </CvSubsection>
                <CvSubsection title={t('techStack.serverless.title')}>
                  <CvBullets
                    items={bullets('techStack.serverless.items')}
                    last
                  />
                </CvSubsection>
              </Stack>
            </Card>
          </CvSection>

          <CvSection title={t('education.title')}>
            <Card>
              <Title order={3} className={classes.subheadingLarge}>
                {t('education.school')}
              </Title>
              <Text className={cx(classes.printSmall, classes.dim80)}>
                {t('education.degree')}
              </Text>
            </Card>
          </CvSection>

          <CvSection title={t('contact.title')}>
            <Card>
              <Group
                gap={8}
                justify="center"
                className={classes.contactLine}
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
            className={cx('print-hidden', classes.screenFooter)}
          >
            <Text size="sm" className={classes.dim60}>
              <InternalLink href="/" inherit>
                {t('footer.backLink')}
              </InternalLink>
            </Text>
          </Box>

          <Box
            component="footer"
            ta="center"
            className={cx('print-only', classes.printFooter)}
          >
            <Text className={classes.small}>
              {t('footer.printFooter')}&nbsp;
              <Anchor href={`https://${t('footer.website')}`} inherit>
                {t('footer.website')}
              </Anchor>
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
