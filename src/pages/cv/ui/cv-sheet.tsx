import {
  Anchor,
  Box,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { printedUrl, SITE_CONFIG } from '@/shared/config';
import { type Messages, richText } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import { Card, FileLink, InternalLink } from '@/shared/ui';

import { OFFER_BLOCKS } from '../lib/cv-offer';
import { cvPdfFile } from '../lib/cv-urls';
import type { CvEdition } from '../lib/cv-variants';
import { CASE_STUDY_KEY, CaseStudyLink } from './case-study-link';
import classes from './cv.module.scss';
import { CvBullets } from './cv-bullets';
import { CvOfferBlock } from './cv-offer-block';
import { CvSection, CvSubsection } from './cv-section';
import { EXPERIENCE_KEYS, ExperienceCard } from './experience-card';
import { LocalePicker } from './locale-picker';
import { OtherVariantLink } from './other-variant-link';

type EmailLinkProps = { email: string };

/** The address the sheet renders in more than one place. */
function EmailLink({ email }: EmailLinkProps) {
  return (
    <Anchor href={`mailto:${email}`} inherit>
      {email}
    </Anchor>
  );
}

function WebsiteLink() {
  const { href, text } = printedUrl(SITE_CONFIG.url);

  return (
    <Anchor {...{ href }} inherit>
      {text}
    </Anchor>
  );
}

/** Order is a presentation decision, as with the experience entries. */
const TECH_STACK_GROUPS = ['backend', 'frontend', 'serverless'] as const;

const PROFILE_PARAGRAPHS = ['paragraph1', 'paragraph2'] as const;

export type CvSheetProps = CvEdition & {
  /** This framing in this language, the variant's overrides already merged in. */
  messages: Messages;
  /** Resolved by the page: the registry that owns URL shapes is build-time-only. */
  caseStudyHref: string;
};

export function CvSheet({
  variant,
  locale,
  messages,
  caseStudyHref,
}: CvSheetProps) {
  const { cv, ui } = messages;
  const caseStudy = {
    href: caseStudyHref,
    label: cv.caseStudies[CASE_STUDY_KEY].link,
  };

  return (
    <Box className={classes['page']}>
      <Container size={896} px={0} className={classes['container']}>
        <Stack className={classes['pageSections']}>
          <Box component="header" className={classes['header']}>
            <Stack ta="center" className={classes['section']}>
              <Title order={1}>
                <InternalLink href="/" underline="never" inherit>
                  {cv.header.name}
                </InternalLink>
              </Title>
              <Text className={cx(classes['tagline'], classes['dim80'])}>
                {cv.header.tagline}
              </Text>
              <Text className={cx(classes['printSmall'], classes['dim70'])}>
                <EmailLink {...pick(cv.header, 'email')} />
                {' · '}
                <WebsiteLink />
              </Text>
            </Stack>
          </Box>

          <Group
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={16}
            className={cx('print-hidden', classes['toolbar'])}
          >
            <LocalePicker {...{ variant, locale }} />
            <FileLink {...cvPdfFile(variant, locale)}>.pdf</FileLink>
          </Group>

          <CvSection {...pick(cv.profile, 'title')}>
            <Card>
              <Stack className={classes['section']}>
                {PROFILE_PARAGRAPHS.map((key) => (
                  <Text key={key} lh={1.625}>
                    {richText(cv.profile[key])}
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
                {/* The framing that leads with proof keeps it one click from
                    the claim. Screen only: the experience entry already prints
                    this address. */}
                {variant === 'cto' && (
                  <Box className="print-hidden">
                    <CaseStudyLink {...caseStudy} />
                  </Box>
                )}
              </Stack>
            </Card>
          </CvSection>

          <CvSection {...pick(cv.experience, 'title')} wide>
            <Stack className={classes['sectionWide']}>
              {EXPERIENCE_KEYS.map((entryKey) => (
                <ExperienceCard
                  key={entryKey}
                  {...{ entryKey }}
                  entry={cv.experience[entryKey]}
                  caseStudy={
                    entryKey === CASE_STUDY_KEY ? caseStudy : undefined
                  }
                />
              ))}
            </Stack>
          </CvSection>

          <CvSection {...pick(cv.techStack, 'title')}>
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
                <Anchor
                  href={`https://${cv.contact.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  {cv.contact.github}
                </Anchor>
                ·
                <Anchor
                  href={`https://${cv.contact.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  {cv.contact.linkedin}
                </Anchor>
                ·
                <Anchor
                  href={`https://${cv.contact.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  {cv.contact.x}
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
                {cv.footer.backLink}
              </InternalLink>
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
        </Stack>
      </Container>
    </Box>
  );
}
