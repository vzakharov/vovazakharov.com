import { Text } from '@mantine/core';
import { useMessages } from 'next-intl';

import type { Linked, WithPrinted } from '@/shared/typings';
import { InternalLink } from '@/shared/ui';

import classes from './cv.module.scss';

/**
 * Which case study the CV cross-links, as the key its label and its experience
 * entry share. Its slug is the server's `FEATURED_CASE_STUDY`: `shared/content`
 * is build-time-only, so a client component gets the resolved href instead.
 */
export const CASE_STUDY_KEY = 'playgram';

/** Where the link points, and paper's copy of it — the two travel together. */
export type CaseStudyLinkProps = Linked & WithPrinted;

export function CaseStudyLink({ href, printed }: CaseStudyLinkProps) {
  const { cv } = useMessages();
  const label = cv.caseStudies[CASE_STUDY_KEY].link;

  return (
    <Text className={classes['caseStudyLine']}>
      <InternalLink {...{ href, printed }} withAddress inherit>
        {label}
      </InternalLink>
    </Text>
  );
}
