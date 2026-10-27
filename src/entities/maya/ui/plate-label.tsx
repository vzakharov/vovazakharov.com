import { Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import type { Numbered } from '@/shared/typings';

import { roman } from '../lib/roman';
import classes from './plate-label.module.scss';

type PlateLabelProps = WithLocale & Numbered;

/** «Табл. IV» — the plate's number as a field guide sets it, over its title. */
export function PlateLabel({ number, locale }: PlateLabelProps) {
  return (
    <Text size="sm" className={classes['label']}>
      {loadMessages(locale).maya.plate.replace('{number}', roman(number))}
    </Text>
  );
}
