import { Box, Container, Stack, Title } from '@mantine/core';

import type { TitledBlock, WithChildren } from '@/shared/typings';

import classes from './cv.module.scss';

/** The frame every CV page sits in: the sheet's column and its section rhythm. */
export function CvFrame({ children }: WithChildren) {
  return (
    <Box className={classes['page']}>
      <Container size={896} px={0} className={classes['container']}>
        <Stack className={classes['pageSections']}>{children}</Stack>
      </Container>
    </Box>
  );
}

export function CvHeader({ children }: WithChildren) {
  return (
    <Box component="header" className={classes['header']}>
      <Stack ta="center" className={classes['section']}>
        {children}
      </Stack>
    </Box>
  );
}

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
