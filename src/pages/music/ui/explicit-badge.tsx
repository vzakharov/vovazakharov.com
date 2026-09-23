import type { Labeled } from '@/shared/typings';

import classes from './music.module.scss';

/**
 * The streaming platforms' mark for explicit lyrics: a small square `E` right
 * after the title, as Apple Music sets it.
 */
export function ExplicitBadge({ label }: Labeled) {
  return (
    <abbr className={classes['explicitBadge']} title={label}>
      <span className={classes['explicitBadgeLetter']}>E</span>
    </abbr>
  );
}
