import { Text } from '@mantine/core';

import type { HookRun } from '@/music/shared/catalogue';

type HookRunsProps = { runs: readonly HookRun[] };

/**
 * A hook already split into its runs, for a client component: the split lives
 * behind a barrel a client bundle cannot import.
 */
export function HookRuns({ runs }: HookRunsProps) {
  return (
    <Text size="lg" fs="italic" lh={1.5} opacity={0.85} mt={12}>
      {runs.map(({ text, struck }, index) =>
        struck ? <s key={index}>{text}</s> : text,
      )}
    </Text>
  );
}
