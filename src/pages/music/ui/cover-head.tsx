import Image from 'next/image';

import { cx } from '@/shared/lib/class-names';
import type { WithOptionalChildren } from '@/shared/typings';

import classes from './music.module.scss';

export type CoverHeadProps = WithOptionalChildren & {
  picture?: string;
};

/** A page's cover beside its name — above it on a phone — or the name alone. */
export function CoverHead({ picture, children }: CoverHeadProps) {
  return (
    <div className={classes['coverHead']}>
      {picture !== undefined && (
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
