import type { CaseFrontmatter } from '@/shared/content';

import classes from './case.module.scss';

type Grade = CaseFrontmatter['grade'];

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

export function aggravations({ aggravating }: Grade): string | undefined {
  return aggravating?.join(', ');
}
