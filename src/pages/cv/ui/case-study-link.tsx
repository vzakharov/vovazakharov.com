import { Text } from '@mantine/core';

import type { LabeledLink } from '@/shared/typings';
import { InternalLink } from '@/shared/ui';

import classes from './cv.module.scss';

/**
 * Which case study the CV cross-links, as the key its label and its experience
 * entry share. Its slug is the server's `FEATURED_CASE_STUDY`: `shared/content`
 * is build-time-only, so the page resolves the href and passes it down.
 */
export const CASE_STUDY_KEY = 'playgram';

export function CaseStudyLink({ href, label }: LabeledLink) {
  return (
    <Text className={classes['caseStudyLine']}>
      <InternalLink {...{ href }} withAddress inherit>
        {label}
      </InternalLink>
    </Text>
  );
}
