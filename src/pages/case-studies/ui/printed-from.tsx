import { Anchor, Group, Text } from '@mantine/core';

import {
  BUILD_YEAR,
  getAbsoluteUrl,
  getBareUrl,
  SITE_CONFIG,
} from '@/shared/config';
import type { Routed } from '@/shared/content';

import classes from './case-studies.module.scss';

/**
 * The line at the foot of every printed page: where the document lives, and
 * whose it is. Chrome's own footer would name the host that printed it —
 * `localhost` for `pnpm content:pdf` — and the CLI cannot override its text,
 * so the page prints its own, which is correct whatever host rendered it and
 * survives the re-sharing that strips a file of its name.
 *
 * The URL shows without its scheme and links with it, so the paper stays
 * readable without costing the PDF its link annotation.
 */
export function PrintedFrom({ route }: Routed) {
  return (
    <Group
      component="footer"
      justify="space-between"
      align="baseline"
      gap={16}
      wrap="nowrap"
      className={classes['printedFrom']}
    >
      <Anchor
        href={getAbsoluteUrl(route)}
        size="sm"
        c="inherit"
        underline="never"
      >
        {getBareUrl(route)}
      </Anchor>
      <Text size="sm">
        © {SITE_CONFIG.name}, {BUILD_YEAR}
      </Text>
    </Group>
  );
}
