import { ReactNode } from 'react';
import { Box, Stack, Title } from '@mantine/core';

/** A titled top-level section; its anchor doubles as the nav target. */
export function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Box component="section" id={id}>
      <Stack gap={24}>
        <Title order={2}>/{id}</Title>
        {children}
      </Stack>
    </Box>
  );
}

/**
 * Top margin that lifts a section's second-level block clear of the one above
 * it. A Stack's gap does not collapse with its children's margins, so against
 * the 24px gap this reads as the 32px such a block wants.
 */
export const SUBHEADING_GAP = 8;

/** A heading inside a `Section`, one level down from its title. */
export function Subheading({ children }: { children: ReactNode }) {
  return (
    <Title order={3} mt={SUBHEADING_GAP}>
      {children}
    </Title>
  );
}
