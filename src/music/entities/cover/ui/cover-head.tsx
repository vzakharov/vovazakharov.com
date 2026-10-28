import Image from 'next/image';
import type { ReactNode } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';
import type { WithOptionalChildren } from '@/kernel/shared/typings';

import classes from './cover.module.scss';
import { CoverZoom, type CoverZoomLabels } from './cover-zoom';

/** The cover a page's head sits beside, where it has one, and what sits beside it. */
export type CoverHeadBody = WithOptionalChildren & { picture?: string };

export type CoverHeadProps = CoverHeadBody & {
  /** The labels a cover that opens at full size reads out. */
  zoom?: CoverZoomLabels;
  /**
   * The line above the name. Beside a cover it sits over the cover's top, which
   * lines up with the name instead.
   */
  kicker?: ReactNode;
};

/** A page's cover beside its name — above it on a phone — or the name alone. */
export function CoverHead({ picture, zoom, kicker, children }: CoverHeadProps) {
  return (
    <div
      className={cx(
        classes['coverHead'],
        picture !== undefined && classes['coverHeadArt'],
      )}
    >
      {picture !== undefined && (
        <div className={classes['coverHeadCover']}>
          {zoom === undefined ? (
            <div className={cx(classes['art'], classes['cover'])} aria-hidden>
              <Image
                src={picture}
                alt=""
                width={600}
                height={600}
                sizes="200px"
                priority
              />
            </div>
          ) : (
            <CoverZoom src={picture} {...zoom} />
          )}
        </div>
      )}
      {kicker !== undefined && (
        <div className={classes['coverHeadKicker']}>{kicker}</div>
      )}
      <div className={classes['coverHeadBody']}>{children}</div>
    </div>
  );
}
