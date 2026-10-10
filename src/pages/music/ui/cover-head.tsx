import Image from 'next/image';

import { cx } from '@/shared/lib/class-names';
import type { WithOptionalChildren } from '@/shared/typings';

import { CoverZoom, type CoverZoomProps } from './cover-zoom';
import classes from './music.module.scss';

export type CoverHeadProps = WithOptionalChildren & {
  picture?: string;
  /** The labels a cover that opens at full size reads out. */
  zoom?: Omit<CoverZoomProps, 'src'>;
};

/** A page's cover beside its name — above it on a phone — or the name alone. */
export function CoverHead({ picture, zoom, children }: CoverHeadProps) {
  return (
    <div className={classes['coverHead']}>
      {picture !== undefined && zoom !== undefined && (
        <CoverZoom src={picture} {...zoom} />
      )}
      {picture !== undefined && zoom === undefined && (
        <div className={cx(classes['tileArt'], classes['cover'])} aria-hidden>
          <Image
            src={picture}
            alt=""
            width={600}
            height={600}
            sizes="200px"
            priority
          />
        </div>
      )}

      {children}
    </div>
  );
}
