import type { CaseFrontmatter } from '@/shared/content';

import { gradeLabel } from '../lib/grade-label';
import classes from './case.module.scss';

type Grade = CaseFrontmatter['grade'];

type GradeStampProps = { grade: Grade };

export function GradeStamp({ grade }: GradeStampProps) {
  return <span className={classes['stamp']}>{gradeLabel(grade)}</span>;
}

export function aggravations({ aggravating }: Grade): string | undefined {
  return aggravating?.join(', ');
}
