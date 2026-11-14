import type { Pose } from '@/cube/entities/world';
import {
  canTake,
  type Holed,
  isAsking,
  isStanding,
  type Player,
} from '@/cube/features/player';

import type COPY from '../config/messages/en.json';

/** The pill's two lines: by a pill in reach, and with it before the eyes. */
export type PillCopy = (typeof COPY)['pill'];

/** Which of the pill's lines the page shows. */
export type PillPrompt = keyof PillCopy;

const nextFrame = async (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

/**
 * `show` for a script to call: over two frames on, when React has committed
 * the line and the page drawn it.
 */
export const drawn =
  (show: (prompt: PillPrompt | null) => void) =>
  async (prompt: PillPrompt | null): Promise<void> => {
    show(prompt);
    await nextFrame();
    await nextFrame();
  };

/**
 * The line `player` is shown at `pose` in a room holed as `here` has it: the
 * question while it holds the pill before its eyes, the way to take it while
 * it stands where it can, none otherwise.
 */
export function pillPromptOf(
  player: Player,
  pose: Pose,
  here: Holed | null,
): PillPrompt | null {
  if (isAsking(player)) return 'ask';
  return isStanding(player) && here !== null && canTake(pose, here.shelf)
    ? 'take'
    : null;
}
