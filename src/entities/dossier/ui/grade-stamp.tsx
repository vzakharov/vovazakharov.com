import type { DossierFrontmatter } from '@/shared/content';

import classes from './dossier.module.scss';

type Grade = DossierFrontmatter['grade'];

type GradeStampProps = { grade: Grade };

/** An enum value as the stamp prints it: `public-figure` → `PUBLIC FIGURE`. */
const stamp = (value: string) => value.replaceAll('-', ' ').toUpperCase();

/** The act and the actor, as one stamp: `HARM · ORGANIZATION`. */
export function GradeStamp({ grade }: GradeStampProps) {
  return (
    <span className={classes['stamp']}>
      {stamp(grade.act)} · {stamp(grade.actor)}
    </span>
  );
}

/** The aggravating circumstances as a lower-case list, or nothing where there are none. */
export function aggravations({ aggravating }: Grade): string | undefined {
  return aggravating?.join(', ');
}
