import { Box, Stack, Title } from '@mantine/core';

import type { Titled, WithChildren } from '@/shared/typings';

import classes from './cv.module.scss';

/** A heading and whatever the CV renders under it. */
type TitledBlock = Titled & WithChildren;

type CvSectionProps = TitledBlock & {
  /** Spaces children further apart, as the experience entries need. */
  wide?: boolean;
};

export function CvSection({ title, wide = false, children }: CvSectionProps) {
  return (
    <Box component="section">
      <Stack className={wide ? classes['sectionWide'] : classes['section']}>
        <Title order={2}>{title}</Title>
        {children}
      </Stack>
    </Box>
  );
}

export function CvSubsection({ title, children }: TitledBlock) {
  return (
    <Box className={classes['subsection']}>
      <Title order={3} className={classes['subheading']}>
        {title}
      </Title>
      {children}
    </Box>
  );
}
