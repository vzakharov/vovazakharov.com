import { ReactNode } from 'react';
import { Box, Stack, Title } from '@mantine/core';
import classes from './cv.module.scss';

export function CvSection({
  title,
  wide,
  children,
}: {
  title: string;
  /** Spaces children further apart, as the experience entries need. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Box component="section">
      <Stack className={wide ? classes.sectionWide : classes.section}>
        <Title order={2}>{title}</Title>
        {children}
      </Stack>
    </Box>
  );
}

export function CvSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box className={classes.subsection}>
      <Title order={3} className={classes.subheading}>
        {title}
      </Title>
      {children}
    </Box>
  );
}
