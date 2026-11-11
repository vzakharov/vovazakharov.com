import type { Readying } from '@/kernel/shared/typings';

import type { Pose } from '@/cube/entities/world';

/** The query that opens `/cube` for a script: no input, the hook installed. */
export const PLAY_QUERY = 'play';

/** The global the hook is installed under. */
export const PLAY_HOOK = '__cubePlay';

/** What `/cube?play` lets a script do, each call awaited to its end. */
export type CubePlayHook = Readying & {
  /** Puts the eye at `pose`, resolving once a frame of it is on screen. */
  setPose: (pose: Pose) => Promise<void>;
  /** The adapter's vendor and architecture, as WebGPU reports them. */
  adapter: () => string;
};
