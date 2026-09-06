import { Anchor, Group, Text } from '@mantine/core';

import { BUILD_YEAR, printedUrl, SITE_CONFIG } from '@/shared/config';
import type { Routed } from '@/shared/content';

import classes from './case-studies.module.scss';

/**
 * The line at the foot of every printed page: where the document lives, and
 * whose it is. Chrome's own footer would name the host that printed it —
 * `localhost` for `pnpm content:pdf` — and the CLI cannot override its text,
 * so the page prints its own, which survives the re-sharing that strips a file
 * of its name.
 */
export function PrintedFrom({ route }: Routed) {
  const { href, text } = printedUrl(route);

  return (
    <Group
      component="footer"
      justify="space-between"
      align="baseline"
      gap={16}
      wrap="nowrap"
      className={classes['printedFrom']}
    >
      <Anchor {...{ href }} c="inherit" underline="never">
        {text}
      </Anchor>
      <Text>
        © {SITE_CONFIG.name}, {BUILD_YEAR}
      </Text>
    </Group>
  );
}
