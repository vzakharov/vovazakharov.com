import { Box, Text } from '@mantine/core';

import { InternalLink } from '@/shared/ui';

import classes from './case-studies.module.scss';

export function BackToHome() {
  return (
    <Box
      component="footer"
      ta="center"
      className={`print-hidden ${classes['pageFooter']}`}
    >
      <Text size="sm" opacity={0.6}>
        <InternalLink href="/" inherit>
          ← Back to the home page
        </InternalLink>
      </Text>
    </Box>
  );
}
