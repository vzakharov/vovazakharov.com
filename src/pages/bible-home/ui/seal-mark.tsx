import Image from 'next/image';

import type { SiteImage } from '@/shared/config';
import { cx } from '@/shared/lib/class-names';
import type { Named } from '@/shared/typings';

import classes from './seal-mark.module.scss';

/**
 * Hold the seal and it takes its lettering off. A polar bear on purpose — the
 * defect `/tend-prose`'s negation lens hunts, which plants the thing it denies
 * by denying it — so that lens leaves this one standing.
 */
const CAPTION = 'Please don’t see an anus in this. Ah. Too late.';

type SealMarkProps = Named & {
  /** The blank cut, underneath. Its size is both cuts', the two being one drawing. */
  blank: SiteImage;
  /** The lettered cut, over it — what a held pointer fades away. */
  lettered: string;
};

/**
 * The site's mark, both cuts stacked, and no JavaScript behind it: the
 * lettered cut's `transition-delay` under `:hover` is the whole timer, so a
 * pointer resting three unbroken seconds fades the ring off and one that
 * leaves early never starts it.
 *
 * Takes the images rather than reading the site, as `SiteAvatar` does — the
 * page above it resolves them.
 */
export function SealMark({ name, blank, lettered }: SealMarkProps) {
  const { path, width, height } = blank;

  return (
    <div className={classes['seal']}>
      <Image
        src={path}
        alt=""
        aria-hidden
        {...{ width, height }}
        className={classes['cut']}
      />
      <Image
        src={lettered}
        alt={name}
        {...{ width, height }}
        className={cx(classes['cut'], classes['lettered'])}
        priority
      />
      <span className={classes['caption']} aria-hidden>
        {CAPTION}
      </span>
    </div>
  );
}
