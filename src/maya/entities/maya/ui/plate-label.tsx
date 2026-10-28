import { Text } from '@mantine/core';

import type { WithLocale } from '@/kernel/shared/i18n';
import type { Numbered } from '@/kernel/shared/typings';

import { messages } from '../i18n';
import { roman } from '../lib/roman';
import classes from './plate-label.module.scss';

type PlateLabelProps = WithLocale & Numbered;

/** «Табл. IV» — the plate's number as a field guide sets it, over its title. */
export function PlateLabel({ number, locale }: PlateLabelProps) {
  return (
    <Text size="sm" className={classes['label']}>
      {messages(locale).plate.replace('{number}', roman(number))}
    </Text>
  );
}
