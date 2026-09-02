import { Text, Title } from '@mantine/core';
import { useMessages } from 'next-intl';

import { cx } from '@/shared/lib/class-names';
import { Card } from '@/shared/ui';

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

type ExperienceCardProps = { entryKey: ExperienceKey };

export function ExperienceCard({ entryKey }: ExperienceCardProps) {
  // Read the entry off the typed catalog: its fields vary per entry, so a
  // computed `t('<key>.title')` resolves to no known message key.
  const { cv } = useMessages();
  const entry = cv.experience[entryKey];
  const items: BulletItem[] = entry.items;
  const hasTech = 'tech' in entry;
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
