import { Box, Text } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type { Labeled } from '@/shared/typings';

import classes from './back-to-home.module.scss';
import { InternalLink } from './internal-link';

export type BackToHomeProps = Partial<Labeled>;

/** The label is a prop because a localized page has to say it in its own language. */
export function BackToHome({
  label = '← Back to the home page',
}: BackToHomeProps) {
  return (
    <Box
      component="footer"
      ta="center"
      className={cx('print-hidden', classes['pageFooter'])}
    >
      <Text size="sm" opacity={0.6}>
        <InternalLink href="/" inherit>
          {label}
        </InternalLink>
      </Text>
    </Box>
  );
}
