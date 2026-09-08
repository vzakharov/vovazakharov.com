import { Text } from '@mantine/core';
import { useMessages } from 'next-intl';

import type { Linked } from '@/shared/typings';
import { InternalLink } from '@/shared/ui';

import classes from './cv.module.scss';

/**
 * Which case study the CV cross-links, as the key its label and its experience
 * entry share. The slug the route is built from is the server's
 * `FEATURED_CASE_STUDY`: `shared/content` is build-time-only, so a client
 * component is handed the resolved href instead of the registry.
 */
export const CASE_STUDY_KEY = 'playgram';

export function CaseStudyLink({ href }: Linked) {
  const { cv } = useMessages();
  const label = cv.caseStudies[CASE_STUDY_KEY].link;

  return (
    <Text className={classes['caseStudyLine']}>
      <InternalLink {...{ href }} className="print-hidden" inherit>
        {label}
      </InternalLink>
      {/* A printed page can only be followed by hand, so paper puts the link
          on the address the reader has to type. */}
      <span className={classes['printLink']}>
        {label}
        {': '}
        {/* One text node, not two: a PDF gets a link annotation per node, and
            the first is placed over whatever precedes the anchor. */}
        <InternalLink {...{ href }} inherit>
          {`${cv.website}${href}`}
        </InternalLink>
      </span>
    </Text>
  );
}
