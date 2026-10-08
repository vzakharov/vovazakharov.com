import { Box, Text } from '@mantine/core';
import Image from 'next/image';

import { pick } from '@/shared/lib/collections';
import type { LabeledLink, Titled } from '@/shared/typings';
import { NameLink, Subheading, TextLink } from '@/shared/ui';

import classes from './music.module.scss';

/**
 * A tile linking to an artist or an album: its art, or its name set on a tinted
 * square where it has none, then the line under the name — a plain `detail`,
 * or `links` onward, an artist's albums.
 */
type CatalogueTile = LabeledLink & {
  cover?: string;
  detail?: string;
  links?: LabeledLink[];
};

export type CatalogueGridProps = Titled & { tiles: CatalogueTile[] };

/** The artists on the index, or an artist's albums — several to a row, each a page of its own. */
export function CatalogueGrid({ title, tiles }: CatalogueGridProps) {
  if (tiles.length === 0) return null;

  return (
    <Box>
      <Subheading>{title}</Subheading>

      <ul className={classes['tileGrid']}>
        {tiles.map(({ href, label, cover, detail, links = [] }) => (
          <li key={href} className={classes['tile']}>
            {/* The art repeats the name below it, so it is hidden from
                assistive tech; the name's link stretches over the whole tile. */}
            <div className={classes['tileArt']} aria-hidden>
              {cover === undefined ? (
                <span className={classes['tileName']}>{label}</span>
              ) : (
                <Image
                  src={cover}
                  alt=""
                  width={600}
                  height={600}
                  sizes="(min-width: 768px) 200px, 50vw"
                />
              )}
            </div>

            <Text fw={500} mt={8} lh={1.3}>
              <NameLink {...{ href }} className={classes['tileLink']}>
                {label}
              </NameLink>
            </Text>

            {detail !== undefined && detail !== '' && (
              <Text size="sm" opacity={0.6}>
                {detail}
              </Text>
            )}

            {links.length > 0 && (
              <Text size="sm" className={classes['tileLinks']}>
                {links.map((link) => (
                  <TextLink
                    key={link.href}
                    {...pick(link, 'href')}
                    underline="hover"
                    className={classes['tileOnward']}
                  >
                    {link.label}
                  </TextLink>
                ))}
              </Text>
            )}
          </li>
        ))}
      </ul>
    </Box>
  );
}
