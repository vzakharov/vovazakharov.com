import { SimpleGrid, Text, Title } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

import { documentDateTime, formatDocumentDate } from '@/shared/content';
import type { WithLocale } from '@/shared/i18n';
import type { Linked, Sized, Sourced, Summarized } from '@/shared/typings';
import { NameLink } from '@/shared/ui';

import { PlateLabel } from '@/entities/maya';

import classes from './plates.module.scss';

/** A toy is not written on a day nor numbered, so only an entry carries those. */
export type Plate = Summarized &
  Linked & {
    date?: Date;
    number?: number;
    image: Sized & Sourced;
  };

type PlatesProps = WithLocale & { plates: Plate[] };

/**
 * Entries as the plates of a field guide, each a leaf with the drawing across
 * its head and the caption under it.
 */
export function Plates({ plates, locale }: PlatesProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40} verticalSpacing={56}>
      {plates.map(({ href, title, description, date, number, image }) => (
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
            {number !== undefined && <PlateLabel {...{ number, locale }} />}
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
