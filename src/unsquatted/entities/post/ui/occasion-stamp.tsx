import Link from 'next/link';

// The node-safe barrel: the catalogue's client rows set the stamp, and the
// ordinary one reads the posts at build.
import {
  type Occasion,
  occasionStamp,
} from '@/unsquatted/shared/content/index.node-safe';

import classes from './occasion-stamp.module.scss';

type OccasionStampProps = { occasion: Occasion; href: string };

/**
 * `11.11` on the accent, linking to the post written for it and titled with
 * the occasion's name: the blog's index and the catalogue's rows set the same
 * stamp, so a name picked for a post reads as belonging to it.
 */
export function OccasionStamp({ occasion, href }: OccasionStampProps) {
  return (
    <Link {...{ href }} title={occasion.name} className={classes['stamp']}>
      {occasionStamp(occasion.date)}
    </Link>
  );
}

type OccasionEyebrowProps = { occasion: Occasion };

/** `11.11 · Singles’ Day`, over a post's title. */
export function OccasionEyebrow({ occasion }: OccasionEyebrowProps) {
  return (
    <p className={classes['eyebrow']}>
      {occasionStamp(occasion.date)} · {occasion.name}
    </p>
  );
}
