import { Text, Title } from '@mantine/core';
import { useMessages } from 'next-intl';

import { TECH_STACKS } from '@/shared/config';
import { cx } from '@/shared/lib/class-names';
import type { WithOptionalCaseStudyHref } from '@/shared/typings';
import { Card } from '@/shared/ui';

import { CaseStudyLink } from './case-study-link';
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

export type ExperienceKey = (typeof EXPERIENCE_KEYS)[number];

/** Not every entry carries a stack line, and the annotation is what holds the
 *  registry's keys to ones the CV renders. */
const ENTRY_TECH_STACKS: Partial<Record<ExperienceKey, string>> = TECH_STACKS;

type ExperienceCardProps = WithOptionalCaseStudyHref & {
  entryKey: ExperienceKey;
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
  const tech = ENTRY_TECH_STACKS[entryKey];
  const hasNote = 'demo' in entry;

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
      {caseStudyHref !== undefined && <CaseStudyLink href={caseStudyHref} />}
      {'description' in entry && (
        <Text className={classes['tight']}>{entry.description}</Text>
      )}
      {'intro' in entry && (
        <Text className={classes['tight']}>{entry.intro}</Text>
      )}
      <CvBullets {...{ items }} last={tech === undefined && !hasNote} />
      {tech !== undefined && (
        <Text
          ff="monospace"
          className={cx(
            classes['small'],
            classes['dim60'],
            hasNote && classes['tightHeading'],
          )}
        >
          {tech}
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
