import { SimpleGrid, Text, Title } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

import type { Labeled } from '@/shared/typings';
import { NameLink } from '@/shared/ui';

import type { Plate } from './plates';
import classes from './shelf.module.scss';

type ShelfProps = Labeled & { toys: Plate[] };

/**
 * The toys as a narrow shelf above the plates, its heading in small capitals
 * and a small drawing beside each caption, so a few of them never read as a
 * half-empty section of the book's own weight.
 */
export function Shelf({ label, toys }: ShelfProps) {
  return (
    <>
      <Title order={2} className={classes['heading']}>
        {label}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40} verticalSpacing={24}>
        {toys.map(({ href, title, description, image }) => (
          <figure key={href} className={classes['toy']}>
            <Link
              {...{ href }}
              tabIndex={-1}
              aria-hidden
              className={classes['drawingLink']}
            >
              <Image
                {...image}
                alt=""
                aria-hidden
                className={classes['drawing']}
              />
            </Link>
            <figcaption className={classes['caption']}>
              <Text className={classes['title']}>
                <NameLink {...{ href }}>{title}</NameLink>
              </Text>
              <Text size="sm" lh={1.55}>
                {description}
              </Text>
            </figcaption>
          </figure>
        ))}
      </SimpleGrid>
    </>
  );
}
