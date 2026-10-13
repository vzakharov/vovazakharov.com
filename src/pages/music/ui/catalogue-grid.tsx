import { Box, Text } from '@mantine/core';
import Image from 'next/image';

import type { Slugged } from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import type { LabeledLink, MaybeTitled } from '@/shared/typings';
import { NameLink, Subheading } from '@/shared/ui';

import { tileHue } from '../lib/tile-hue';
import classes from './music.module.scss';
import { SongName } from './song-name';
import { WipMark, type WipNoted } from './wip-mark';

/**
 * A tile linking to an artist, an album or a single: its art with its name
 * under it, or its name set on a gradient hued by its slug where it has none —
 * never both, so the name reads once — then an optional `detail` line under the
 * square.
 */
type CatalogueTile = LabeledLink &
  Slugged &
  WipNoted & {
    cover?: string;
    detail?: string;
    /** The label is a romanized song title, set in italics. */
    transliterated?: boolean;
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
        {tiles.map(
          ({
            href,
            slug,
            label,
            cover,
            detail,
            wip,
            transliterated = false,
          }) => {
            // The name's link stretches over the whole tile; the sign follows
            // it outside the link, a button being no anchor's content.
            const link = (
              <span>
                <NameLink
                  {...{ href }}
                  c="inherit"
                  className={classes['tileLink']}
                >
                  <SongName title={label} {...{ transliterated }} />
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
                      style={{ '--tile-word': longestWord(label) }}
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
                  <Text
                    size="sm"
                    opacity={0.6}
                    mt={cover === undefined ? 8 : 0}
                  >
                    {detail}
                  </Text>
                )}
              </li>
            );
          },
        )}
      </ul>
    </Box>
  );
}

/** The letters in the name's longest word, which the type on the square is sized to fit unbroken. */
function longestWord(name: string): number {
  return Math.max(...name.split(/\s+/u).map((word) => word.length));
}
