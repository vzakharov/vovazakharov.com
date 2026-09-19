import { Text } from '@mantine/core';
import { useMessages } from 'next-intl';

import type { Linked, PerMedium } from '@/shared/typings';
import { InternalLink } from '@/shared/ui';

import classes from './cv.module.scss';

/**
 * Which case study the CV cross-links, as the key its label and its experience
 * entry share. Its slug is the server's `FEATURED_CASE_STUDY`: `shared/content`
 * is build-time-only, so a client component gets the resolved href instead.
 */
export const CASE_STUDY_KEY = 'playgram';

export function CaseStudyLink(props: Linked & PerMedium) {
  const { cv } = useMessages();
  const label = cv.caseStudies[CASE_STUDY_KEY].link;

  return (
    <Text className={classes['caseStudyLine']}>
      <InternalLink {...props} withAddress inherit>
        {label}
      </InternalLink>
    </Text>
  );
}
