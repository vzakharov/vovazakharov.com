import { Text } from '@mantine/core';

import type { WithChildren } from '@/shared/typings';

/** A card's closing stack line — an aside in the code face, not prose. */
export function TechLine({ children }: WithChildren) {
  return (
    <Text size="sm" ff="monospace" opacity={0.6}>
      {children}
    </Text>
  );
}
