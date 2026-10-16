import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { Fragment } from 'react';

import { printedUrl, SITE_CONFIG } from '@/shared/config';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import type { DocumentFile } from '@/shared/typings';
import { Card, FileLink, TextLink } from '@/shared/ui';

import type { CvPageCopy } from '../lib/cv-messages';
import { leadsWithProof, offerHeadline } from '../lib/cv-offer';
import { TECH_STACK } from '../lib/cv-stack';
import { cvPath } from '../lib/cv-urls';
import { CASE_STUDY_KEY } from './case-study-link';
import classes from './cv.module.scss';
import { CvIntroCard } from './cv-intro-card';
import { CvFrame, CvHeader, CvSection } from './cv-section';
import { EXPERIENCE_KEYS, ExperienceCard } from './experience-card';
import { LocalePicker } from './locale-picker';
import { OtherVariantLink } from './other-variant-link';

type EmailLinkProps = { email: string };

/** The address the sheet renders in more than one place. */
function EmailLink({ email }: EmailLinkProps) {
  return <TextLink href={`mailto:${email}`}>{email}</TextLink>;
}

function WebsiteLink() {
  const { href, text } = printedUrl(SITE_CONFIG.url);

  return <TextLink {...{ href }}>{text}</TextLink>;
}

type ProfileLinkProps = { profile: string };

/**
 * A profile elsewhere, as the catalogue spells it: scheme-less, so it reads the
 * same in print as on screen, and linked with the scheme added back.
 */
function ProfileLink({ profile }: ProfileLinkProps) {
  return <TextLink href={`https://${profile}`}>{profile}</TextLink>;
}

/** Order is a presentation decision, as with the experience entries. */
const TECH_STACK_GROUPS = [
  'languages',
  'frontend',
  'backend',
  'ai',
  'infrastructure',
  'quality',
  'agentic',
] as const satisfies ReadonlyArray<keyof typeof TECH_STACK>;

type CvSheetProps = CvPageCopy & {
  /** Resolved by the page, as the case study is: its saved name carries the site's download prefix. */
  pdfFile: DocumentFile;
};

export function CvSheet({
  variant,
  locale,
  messages,
  caseStudy,
  pdfFile,
}: CvSheetProps) {
  const { cv, ui } = messages;

  return (
    <CvFrame>
      <CvHeader>
        <Title order={1}>
          <TextLink href="/" underline="never">
            {cv.header.name}
          </TextLink>
        </Title>
        <Text className={cx(classes['tagline'], classes['dim80'])}>
          {cv.header.tagline}
        </Text>
        <Text className={cx(classes['printSmall'], classes['dim70'])}>
          <EmailLink {...pick(cv.header, 'email')} />
          {' · '}
          <WebsiteLink />
        </Text>
      </CvHeader>

      <Group
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        className={cx('print-hidden', classes['toolbar'])}
      >
        <LocalePicker {...{ variant, locale }} />
        <FileLink {...pdfFile}>.pdf</FileLink>
      </Group>

      <CvSection {...pick(cv.profile, 'title')}>
        <CvIntroCard
          {...pick(cv.profile, 'summary')}
          {...offerHeadline(messages, variant)}
          more={{
            href: cvPath(variant, locale, 'profile'),
            label: cv.profilePage.link,
          }}
          caseStudy={leadsWithProof(variant) ? caseStudy : undefined}
        />
      </CvSection>

      <CvSection {...pick(cv.experience, 'title')} wide>
        <Stack className={classes['sectionWide']}>
          {EXPERIENCE_KEYS.map((entryKey) => (
            <ExperienceCard
              key={entryKey}
              {...{ entryKey }}
              entry={cv.experience[entryKey]}
              caseStudy={entryKey === CASE_STUDY_KEY ? caseStudy : undefined}
            />
          ))}
        </Stack>
      </CvSection>

      <CvSection {...pick(cv.techStack, 'title')}>
        <Card>
          <Box className={classes['stack']}>
            {TECH_STACK_GROUPS.map((group) => (
              <Fragment key={group}>
                <Text className={classes['stackGroup']}>
                  {cv.techStack.groups[group]}
                </Text>
                <Text>{TECH_STACK[group]}</Text>
              </Fragment>
            ))}
          </Box>
        </Card>
      </CvSection>

      <CvSection {...pick(cv.education, 'title')}>
        <Card>
          <Title order={3} className={classes['subheadingLarge']}>
            {cv.education.school}
          </Title>
          <Text className={cx(classes['printSmall'], classes['dim80'])}>
            {cv.education.degree}
          </Text>
        </Card>
      </CvSection>

      <CvSection {...pick(cv.contact, 'title')}>
        <Card>
          <Group
            gap={8}
            justify="center"
            className={classes['contactLine']}
            wrap="wrap"
          >
            <EmailLink {...pick(cv.header, 'email')} />·
            <ProfileLink profile={cv.contact.github} />
            ·
            <ProfileLink profile={cv.contact.linkedin} />
            ·
            <ProfileLink profile={cv.contact.x} />
          </Group>
        </Card>
      </CvSection>

      <Group
        component="footer"
        justify="space-between"
        className={cx('print-hidden', classes['screenFooter'])}
      >
        <Text size="sm" className={classes['dim60']}>
          <TextLink href="/">{cv.footer.backLink}</TextLink>
        </Text>
        <OtherVariantLink {...{ variant, locale }} labels={ui.cvVariants} />
      </Group>

      <Box
        component="footer"
        ta="center"
        className={cx('print-only', classes['printFooter'])}
      >
        <Text className={classes['small']}>
          {cv.footer.printFooter}&nbsp;
          <WebsiteLink />
        </Text>
      </Box>
    </CvFrame>
  );
}
