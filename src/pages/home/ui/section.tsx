import { Box, Stack, Title } from '@mantine/core';

import type { WithChildren, WithId } from '@/shared/typings';

type SectionProps = WithId & WithChildren;

/** A titled top-level section; its anchor doubles as the nav target. */
export function Section({ id, children }: SectionProps) {
  return (
    <Box component="section" {...{ id }}>
      <Stack gap={24}>
        <Title order={2}>/{id}</Title>
        {children}
      </Stack>
    </Box>
  );
}

/** Adds to a Stack's 24px gap, which does not collapse with it, to reach 32px. */
export const SUBHEADING_GAP = 8;

/** A heading inside a `Section`, one level down from its title. */
export function Subheading({ children }: WithChildren) {
  return (
    <Title order={3} mt={SUBHEADING_GAP}>
      {children}
    </Title>
  );
}
