import { Text, Title } from '@mantine/core';
import { useMessages } from 'next-intl';

import { cx } from '@/shared/lib/class-names';
import { Card, InternalLink } from '@/shared/ui';

import classes from './cv.module.scss';
import { type BulletItem, CvBullets } from './cv-bullets';

/**
 * Order is a presentation decision, so it lives in code rather than in the
 * catalogs, where `en` and `ru` would be free to disagree about it.
 */
export const EXPERIENCE_KEYS = [
  'playgram',
  'englishForKids',
  'orcool',
  'randddb',
  'independent',
  'voicemod',
] as const;

type ExperienceKey = (typeof EXPERIENCE_KEYS)[number];

/**
 * Which entry the featured case study documents — in code for the same reason
 * the order is. The route file's `FEATURED_CASE_STUDY` owns the slug itself.
 */
export const CASE_STUDY_EXPERIENCE_KEY = 'playgram' satisfies ExperienceKey;

type ExperienceCardProps = {
  entryKey: ExperienceKey;
  /** Renders the case-study link; given only for `CASE_STUDY_EXPERIENCE_KEY`. */
  caseStudyHref?: string;
};

export function ExperienceCard({
  entryKey,
  caseStudyHref,
}: ExperienceCardProps) {
  // Read the entry off the typed catalog: its fields vary per entry, so a
  // computed `t('<key>.title')` resolves to no known message key.
  const { cv } = useMessages();
  const entry = cv.experience[entryKey];
  const items: BulletItem[] = entry.items;
  const hasTech = 'tech' in entry;
  const hasNote = 'demo' in entry;
  const caseStudyLabel = cv.caseStudies[CASE_STUDY_EXPERIENCE_KEY].link;

  return (
    <Card>
      <Title order={3} className={classes['tightHeading']}>
        {entry.title}
      </Title>
      <Title
        order={4}
        className={cx(classes['period'], classes['dim90'])}
        fw={700}
      >
        {entry.period}
      </Title>
      {caseStudyHref !== undefined && (
        <Text size="sm" className={classes['tight']}>
          <InternalLink href={caseStudyHref} className="print-hidden" inherit>
            {caseStudyLabel}
          </InternalLink>
          {/* A printed page can only be followed by hand, so paper puts the
              link on the address the reader has to type. */}
          <span className={classes['printLink']}>
            {caseStudyLabel}
            {': '}
            {/* One text node, not two: a PDF gets a link annotation per node,
                and the first is placed over whatever precedes the anchor. */}
            <InternalLink href={caseStudyHref} inherit>
              {`${cv.website}${caseStudyHref}`}
            </InternalLink>
          </span>
        </Text>
      )}
      {'description' in entry && (
        <Text className={classes['tight']}>{entry.description}</Text>
      )}
      {'intro' in entry && (
        <Text className={classes['tight']}>{entry.intro}</Text>
      )}
      <CvBullets {...{ items }} last={!hasTech && !hasNote} />
      {hasTech && (
        <Text
          ff="monospace"
          className={cx(
            classes['small'],
            classes['dim60'],
            hasNote && classes['tightHeading'],
          )}
        >
          {entry.tech}
        </Text>
      )}
      {hasNote && (
        <Text fs="italic" className={cx(classes['small'], classes['dim70'])}>
          {entry.demo}
        </Text>
      )}
    </Card>
  );
}
