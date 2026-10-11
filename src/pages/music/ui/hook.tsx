import { Text } from '@mantine/core';

type HookProps = { children: string | undefined };

/** The line under a page's name that makes a reader want to press play. */
export function Hook({ children }: HookProps) {
  return (
    children !== undefined && (
      <Text size="lg" fs="italic" lh={1.5} opacity={0.85} mt={12}>
        {children}
      </Text>
    )
  );
}
