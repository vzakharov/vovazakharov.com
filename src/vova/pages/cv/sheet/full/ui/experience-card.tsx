import { Text, Title } from '@mantine/core';

import { TECH_STACKS } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';

import { Card } from '@/shell/shared/ui';

import type { Messages } from '@/vova/shared/i18n';
import type { WithCaseStudy } from '@/vova/entities/cv';

import {
  type BulletItem,
  CaseStudyLink,
  CV_CLASSES,
  CvBullets,
} from '../../frame';
import classes from './cv-sheet.module.scss';

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

/** `caseStudy` is present on the one entry the CV cross-links. */
type ExperienceCardProps = Partial<WithCaseStudy> & {
  entryKey: ExperienceKey;
  entry: ExperienceEntry;
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
      <Title order={3} className={CV_CLASSES['tightHeading']}>
        {entry.title}
      </Title>
      <Title
        order={4}
        className={cx(classes['period'], CV_CLASSES['dim90'])}
        fw={700}
      >
        {entry.period}
      </Title>
      {caseStudy !== undefined && <CaseStudyLink {...caseStudy} />}
      {'description' in entry && (
        <Text className={CV_CLASSES['tight']}>{entry.description}</Text>
      )}
      {'intro' in entry && (
        <Text className={CV_CLASSES['tight']}>{entry.intro}</Text>
      )}
      <CvBullets {...{ items }} last={tech === undefined && !hasNote} />
      {tech !== undefined && (
        <Text
          ff="monospace"
          className={cx(
            CV_CLASSES['small'],
            CV_CLASSES['dim60'],
            hasNote && CV_CLASSES['tightHeading'],
          )}
        >
          {tech}
        </Text>
      )}
      {hasNote && (
        <Text
          fs="italic"
          className={cx(CV_CLASSES['small'], CV_CLASSES['dim70'])}
        >
          {entry.demo}
        </Text>
      )}
    </Card>
  );
}
