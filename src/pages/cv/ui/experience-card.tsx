import { Text, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { cx } from '@/shared/lib/class-names';
import { Card } from '@/shared/ui';
import { CvBullets, type BulletItem } from './cv-bullets';
import classes from './cv.module.scss';

export function ExperienceCard({ entryKey }: { entryKey: string }) {
  const t = useTranslations('cv.experience');
  const at = (field: string) => `${entryKey}.${field}`;
  const items = t.raw(at('items')) as BulletItem[];
  const hasTech = t.has(at('tech'));
  const hasNote = t.has(at('demo'));

  return (
    <Card>
      <Title order={3} className={classes.tightHeading}>
        {t(at('title'))}
      </Title>
      <Title order={4} className={cx(classes.period, classes.dim90)} fw={700}>
        {t(at('period'))}
      </Title>
      {t.has(at('description')) && (
        <Text className={classes.tight}>{t(at('description'))}</Text>
      )}
      {t.has(at('intro')) && (
        <Text className={classes.tight}>{t(at('intro'))}</Text>
      )}
      <CvBullets items={items} last={!hasTech && !hasNote} />
      {hasTech && (
        <Text
          ff="monospace"
          className={cx(
            classes.small,
            classes.dim60,
            hasNote && classes.tightHeading
          )}
        >
          {t(at('tech'))}
        </Text>
      )}
      {hasNote && (
        <Text fs="italic" className={cx(classes.small, classes.dim70)}>
          {t(at('demo'))}
        </Text>
      )}
    </Card>
  );
}
