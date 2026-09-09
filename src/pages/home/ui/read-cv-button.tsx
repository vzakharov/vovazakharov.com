import { Group } from '@mantine/core';

import { InternalButton } from '@/shared/ui';

/** The page's call to action, closing the offer and again after the work that backs it. */
export function ReadCvButton() {
  return (
    <Group>
      <InternalButton href="/cv" variant="default" size="md">
        Read full CV
      </InternalButton>
    </Group>
  );
}
