import { hookRuns } from '@/music/shared/catalogue/index.node-safe';

import { HookRuns } from './hook-runs';

type HookLineProps = { children: string | undefined };

/** The line under a page's name that makes a reader want to press play. */
export function HookLine({ children }: HookLineProps) {
  return children !== undefined && <HookRuns runs={hookRuns(children)} />;
}
