import { Box, Text } from '@mantine/core';

import { getAbsoluteUrl } from '@/shared/config';

import classes from './case-studies.module.scss';

/**
 * The page's canonical URL, printed at the foot of a PDF. Chrome's own footer
 * would name the host that printed it — `localhost` for `pnpm content:pdf` —
 * and its text carries no `ToUnicode` map, so it neither selects nor searches;
 * this line is correct whatever host printed it, and survives the re-sharing
 * that strips a file of its name.
 */
export function PrintedFrom({ route }: { route: string }) {
  return (
    <Box component="footer" className={`print-only ${classes['printedFrom']}`}>
      <Text size="sm" opacity={0.6}>
        {getAbsoluteUrl(route)}
      </Text>
    </Box>
  );
}
