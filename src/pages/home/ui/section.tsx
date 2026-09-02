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

/** Adds to a Stack's 24px gap, which does not collapse with it, to reach 32px. */
export const SUBHEADING_GAP = 8;

/** A heading inside a `Section`, one level down from its title. */
export function Subheading({ children }: { children: ReactNode }) {
  return (
    <Title order={3} mt={SUBHEADING_GAP}>
      {children}
    </Title>
  );
}
