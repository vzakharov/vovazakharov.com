import { Anchor, Group, Text } from '@mantine/core';

import {
  BUILD_YEAR,
  printedUrl,
  SITE_CONFIG,
} from '@/shared/config/index.server-only';
import type { Routed } from '@/shared/content';
import { pick } from '@/shared/lib/collections';

import classes from './documents.module.scss';

/**
 * The line at the foot of every printed page: where the document lives, and
 * whose it is. Chrome's own footer would name the host that printed it —
 * `localhost`, since the render prints from a dev server — and the CLI cannot
 * override its text,
 * so the page prints its own, which survives the re-sharing that strips a file
 * of its name.
 */
export function PrintedFrom({ route }: Routed) {
  const { href, text } = printedUrl(route);
  const { credit, name } = SITE_CONFIG;

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
        ©{' '}
        {credit ? (
          <Anchor {...pick(credit, 'href')} c="inherit">
            {credit.name}
          </Anchor>
        ) : (
          name
        )}
        , {BUILD_YEAR}
      </Text>
    </Group>
  );
}
