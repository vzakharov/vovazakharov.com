import type { Labeled } from '@/shared/typings';

import classes from './music.module.scss';

/**
 * The streaming platforms' mark for explicit lyrics: a small square `E` right
 * after the title, as Apple Music sets it — a fixed size rather than the
 * title's, so it reads as a mark on the heading rather than a letter of it.
 */
export function ExplicitBadge({ label }: Labeled) {
  return (
    <abbr className={classes['explicitBadge']} title={label}>
      E
    </abbr>
  );
}
