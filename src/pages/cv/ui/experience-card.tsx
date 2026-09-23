import { Text, Title } from '@mantine/core';

import { TECH_STACKS } from '@/shared/config';
import type { Messages } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import type { LabeledLink } from '@/shared/typings';
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

type ExperienceKey = (typeof EXPERIENCE_KEYS)[number];

/** One entry as the catalogue spells it — the fields vary from entry to entry. */
type ExperienceEntry = Messages['cv']['experience'][ExperienceKey];

/** Not every entry carries a stack line, and the annotation is what holds the
 *  registry's keys to ones the CV renders. */
const ENTRY_TECH_STACKS: Partial<Record<ExperienceKey, string>> = TECH_STACKS;

type ExperienceCardProps = {
  entryKey: ExperienceKey;
  entry: ExperienceEntry;
  /** Present on the one entry the CV cross-links. */
  caseStudy?: LabeledLink;
};

export function ExperienceCard({
  entryKey,
  entry,
  caseStudy,
}: ExperienceCardProps) {
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
      {caseStudy !== undefined && <CaseStudyLink {...caseStudy} />}
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
