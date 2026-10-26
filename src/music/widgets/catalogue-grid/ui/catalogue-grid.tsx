import { Box, Text } from '@mantine/core';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';
import type { MaybeTitled } from '@/kernel/shared/typings';

import { NameLink, Subheading } from '@/shell/shared/ui';

import type { Slugged } from '@/blog/shared/content';

import type {
  Spelled,
  SpelledLink,
} from '@/music/shared/catalogue/index.node-safe';
import { Spelling, WipMark, type WipNoted } from '@/music/shared/ui';

import classes from './catalogue-grid.module.scss';
import { tileHue } from './tile-hue';

/**
 * A tile linking to an artist, an album or a single: its art with its name
 * under it, or its name set on a gradient hued by its slug where it has none —
 * never both, so the name reads once — then an optional `detail` line under the
 * square.
 */
type CatalogueTile = SpelledLink &
  Slugged &
  WipNoted & {
    cover?: string;
    detail?: ReactNode;
  };

/** Untitled under a heading of the page's own, as the index's tabs are. */
export type CatalogueGridProps = MaybeTitled & { tiles: CatalogueTile[] };

/** Artists or releases — several to a row, each a page of its own. */
export function CatalogueGrid({ title, tiles }: CatalogueGridProps) {
  if (tiles.length === 0) return null;

  return (
    <Box>
      {title !== undefined && <Subheading>{title}</Subheading>}

      <ul className={classes['tileGrid']}>
        {tiles.map(({ href, slug, name, cover, detail, wip }) => {
          // The name's link stretches over the whole tile; the sign follows it
          // outside the link, a button being no anchor's content.
          const link = (
            <span>
              <NameLink
                {...{ href }}
                c="inherit"
                className={classes['tileLink']}
              >
                <Spelling {...name} />
              </NameLink>
              {wip !== undefined && (
                <>
                  {' '}
                  <WipMark note={wip} size="0.7em" />
                </>
              )}
            </span>
          );

          return (
            <li key={href} className={classes['tile']}>
              {cover === undefined ? (
                <Box
                  className={cx(classes['tileArt'], classes['tileArtless'])}
                  style={{ '--tile-hue': tileHue(slug) }}
                >
                  <Box
                    component="span"
                    className={classes['tileName']}
                    style={{ '--tile-word': longestWord(name) }}
                  >
                    {link}
                  </Box>
                </Box>
              ) : (
                <>
                  <div className={classes['tileArt']} aria-hidden>
                    <Image
                      src={cover}
                      alt=""
                      width={600}
                      height={600}
                      sizes="(min-width: 768px) 200px, 50vw"
                    />
                  </div>

                  <Text fw={500} mt={8} lh={1.3}>
                    {link}
                  </Text>
                </>
              )}

              {detail !== undefined && detail !== '' && (
                <Text size="sm" opacity={0.6} mt={cover === undefined ? 8 : 0}>
                  {detail}
                </Text>
              )}
            </li>
          );
        })}
      </ul>
    </Box>
  );
}

/**
 * The letters in the name's longest word, in whichever spelling's is longer,
 * which the type on the square is sized to fit unbroken.
 */
function longestWord({ original, latin = '' }: Spelled): number {
  return Math.max(
    ...`${original} ${latin}`.split(/\s+/u).map((word) => word.length),
  );
}
