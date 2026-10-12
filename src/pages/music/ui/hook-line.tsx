import { Text } from '@mantine/core';

import { hookRuns } from '@/shared/music-catalogue';

type HookLineProps = { children: string | undefined };

/** The line under a page's name that makes a reader want to press play. */
export function HookLine({ children }: HookLineProps) {
  return (
    children !== undefined && (
      <Text size="lg" fs="italic" lh={1.5} opacity={0.85} mt={12}>
        {hookRuns(children).map(({ text, struck }, index) =>
          struck ? <s key={index}>{text}</s> : text,
        )}
      </Text>
    )
  );
}
