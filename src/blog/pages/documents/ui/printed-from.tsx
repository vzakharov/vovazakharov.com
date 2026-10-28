import { Group, Text } from '@mantine/core';

import { printedUrl, SITE_CONFIG } from '@/kernel/shared/config';
import { BUILD_YEAR } from '@/kernel/shared/config/index.server-only';
import { pick } from '@/kernel/shared/lib/collections';
import type { Routed } from '@/kernel/shared/typings';

import { TextLink } from '@/shell/shared/ui';

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
      <TextLink {...{ href }} c="inherit" underline="never">
        {text}
      </TextLink>
      <Text>
        ©{' '}
        {credit ? (
          <TextLink {...pick(credit, 'href')} c="inherit" underline="never">
            {credit.name}
          </TextLink>
        ) : (
          name
        )}
        , {BUILD_YEAR}
      </Text>
    </Group>
  );
}
