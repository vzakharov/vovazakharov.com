import {
  type Aim,
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
 * The line `player` is shown with its hand at `aim`: the question while it
 * holds the pill before its eyes, the way to take it while it stands aiming
 * at it, none otherwise.
 */
export function pillPromptOf(
  player: Player,
  aim: Aim | null,
): PillPrompt | null {
  if (isAsking(player)) return 'ask';
  return isStanding(player) && aim?.at === 'pill' ? 'take' : null;
}
