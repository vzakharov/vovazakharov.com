import { Text } from '@mantine/core';

import type { WithChildren } from '@/shared/typings';

export function TechLine({ children }: WithChildren) {
  return (
    <Text size="sm" ff="monospace" opacity={0.6}>
      {children}
    </Text>
  );
}
