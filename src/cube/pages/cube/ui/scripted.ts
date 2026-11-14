import type { Pose, Quad, Sign } from '@/cube/entities/world';
import { type Aim, aimOf } from '@/cube/features/player';

import { type CubePlayHook, PLAY_HOOK, PLAY_INSTANT } from '../lib/play';
import type { SignOf } from './cube-mesh';
import type { CubeScene } from './cube-scene';
import { drawn, type PillPrompt } from './pill-prompt';

/** What a script's walk shows of the hand's reach, and opens on a press. */
type Reaching = {
  /** Shows the hint for what the hand at `pose` answers. */
  reach: (pose: Pose, sign: Sign | null, aim: Aim | null) => void;
  /** Shows no hint at all, for an eye out of doors. */
  unreach: () => void;
  /** Opens the offer of `sign`, the sign of the room at `pose`. */
  offer: (pose: Pose, sign: Sign) => void;
};

/** A frame a script's walk draws: the pose it was set at, nothing in hand. */
type Still = { pose: Pose; taken: null; moving: readonly Quad[] };

/**
 * A walk driven by the play hook rather than the controls: its clock stopped
 * at `PLAY_INSTANT` until a script sets it, and each press it asks for resolved
 * once a frame has read it.
 */
export function scripted({ reach, unreach, offer }: Reaching) {
  let frozen = PLAY_INSTANT;
  /** A press the play hook asked for, resolved once a frame reads it. */
  let pressed: PromiseWithResolvers<void> | null = null;
  /** Whether a script's eye is out of doors, where no floor is underfoot. */
  let out = false;
  return {
    now: (): number => frozen,
    onFrame: (pose: Pose, _seconds: number, signOf: SignOf): Still => {
      if (out) unreach();
      else {
        const sign = signOf(pose);
        const aim = aimOf(pose, { shelf: null, sign });
        reach(pose, sign, aim);
        if (pressed !== null && aim?.at === 'sign' && sign !== null) {
          offer(pose, sign);
        }
      }
      pressed?.resolve();
      pressed = null;
      return { pose, taken: null, moving: [] };
    },
    /** Hands `scene` to scripts as the play hook. */
    install: (
      { ready, setPose, setEye, adapter }: CubeScene,
      setPill: (prompt: PillPrompt | null) => void,
    ): void => {
      const hook: CubePlayHook = {
        ready,
        setPose: async (...set) => {
          out = false;
          return setPose(...set);
        },
        setEye: async (...set) => {
          out = true;
          return setEye(...set);
        },
        setPill: drawn(setPill),
        adapter,
        setClock: (ms) => {
          frozen = ms;
        },
        press: async () => {
          pressed ??= Promise.withResolvers();
          return pressed.promise;
        },
      };
      Object.assign(globalThis, { [PLAY_HOOK]: hook });
    },
  };
}
