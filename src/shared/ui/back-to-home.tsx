import { Box, Text } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';

import classes from './back-to-home.module.scss';
import { InternalLink } from './internal-link';

export function BackToHome() {
  return (
    <Box
      component="footer"
      ta="center"
      className={cx('print-hidden', classes['pageFooter'])}
    >
      <Text size="sm" opacity={0.6}>
        <InternalLink href="/" inherit>
          ← Back to the home page
        </InternalLink>
      </Text>
    </Box>
  );
}
