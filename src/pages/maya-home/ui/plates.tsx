import { SimpleGrid, Text, Title } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

import { documentDateTime, formatDocumentDate } from '@/shared/content';
import type { WithLocale } from '@/shared/i18n';
import type { Linked, Sized, Sourced, Summarized } from '@/shared/typings';
import { NameLink } from '@/shared/ui';

import classes from './plates.module.scss';

/** A toy is not written on a day, so only an entry carries a `date`. */
export type Plate = Summarized &
  Linked & {
    date?: Date;
    image: Sized & Sourced;
  };

type PlatesProps = WithLocale & {
  plates: Plate[];
  /** Spelled with `{number}`; a list without it leaves its plates unnumbered. */
  numbered?: string;
};

const ROMAN: Array<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

function roman(value: number): string {
  let rest = value;
  let numeral = '';

  for (const [step, letters] of ROMAN) {
    while (rest >= step) {
      numeral += letters;
      rest -= step;
    }
  }

  return numeral;
}

/**
 * Entries as the plates of a field guide: the drawing on the page's own paper,
 * the caption under it. Listed newest first and numbered oldest first, so a
 * plate keeps its number as later ones join above it.
 */
export function Plates({ plates, numbered, locale }: PlatesProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40} verticalSpacing={56}>
      {plates.map(({ href, title, description, date, image }, index) => (
        <figure key={href} className={classes['plate']}>
          <Link {...{ href }} tabIndex={-1} aria-hidden>
            <Image
              {...image}
              alt=""
              aria-hidden
              className={classes['drawing']}
            />
          </Link>
          <figcaption className={classes['caption']}>
            {numbered !== undefined && (
              <Text size="sm" className={classes['number']}>
                {numbered.replace('{number}', roman(plates.length - index))}
              </Text>
            )}
            <Title order={3} className={classes['title']}>
              <NameLink {...{ href }}>{title}</NameLink>
            </Title>
            {date !== undefined && (
              <Text
                size="sm"
                component="time"
                dateTime={documentDateTime(date)}
              >
                {formatDocumentDate(date, locale)}
              </Text>
            )}
            <Text lh={1.625}>{description}</Text>
          </figcaption>
        </figure>
      ))}
    </SimpleGrid>
  );
}
