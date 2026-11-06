import Link from 'next/link';

// The node-safe barrel: the catalogue's client rows set the stamp, and the
// ordinary one reads the posts at build.
import {
  occasionLine,
  type OccasionLink,
  occasionStamp,
  type WithOccasion,
} from '@/unsquatted/shared/content/index.node-safe';

import classes from './occasion-stamp.module.scss';

/**
 * `11.11` on the accent, linking to the post written for it and titled with
 * the occasion's name: the blog's index and the catalogue's rows set the same
 * stamp, so a name picked for a post reads as belonging to it.
 */
export function OccasionStamp({ occasion, href }: OccasionLink) {
  return (
    <Link {...{ href }} title={occasion.name} className={classes['stamp']}>
      {occasionStamp(occasion.date)}
    </Link>
  );
}

export function OccasionEyebrow({ occasion }: WithOccasion) {
  return <p className={classes['eyebrow']}>{occasionLine(occasion)}</p>;
}
