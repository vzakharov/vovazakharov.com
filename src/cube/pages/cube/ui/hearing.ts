import { pick } from '@/kernel/shared/lib/collections';
import type { CanDispose } from '@/kernel/shared/typings';

import { pathHash } from '@/dice/shared/roll';

import { LADDER_MATERIAL } from '@/cube/shared/lib/acoustics';
import { themeOf } from '@/cube/entities/theme';
import { planted, type Pose, roomKey } from '@/cube/entities/world';
import type { Cue } from '@/cube/features/player';
import {
  bearingOf,
  createSoundscape,
  type SoundCue,
} from '@/cube/features/sound';
import { lineFor, type Moment, utter, voiceOf } from '@/cube/features/voice';

import { rolledTraits } from './cube-mesh';
import type { Heard } from './cube-scene';

/** What the ear hears: the body's own cues, and the rooms' sounds. */
export type Hearing = CanDispose & {
  /** A frame's cues, of the body now at `pose`. */
  body: (cues: readonly Cue[], pose: Pose) => void;
  /** A frame's room sounds, for an ear at `pose` at `nowMs` since the epoch. */
  rooms: (heard: readonly Heard[], pose: Pose, nowMs: number) => void;
};

/** The rate the voice is said at. */
const VOICE_RATE = 32_000;

/** Seconds a room sound's key is remembered after it began. */
const KEY_SECONDS = 60;

const word = pathHash(planted.seed);

/** The body's cue as the soundscape plays it, or null where it is said. */
function soundOf(cue: Cue, pose: Pose): SoundCue | null {
  if (cue.cue === 'say') return null;
  if (cue.cue === 'step') {
    const { strength, ground } = cue;
    const footing = ground ?? themeOf(pose.n).sound.footing;
    return { kind: 'step', strength, footing };
  }
  if (cue.cue === 'rung') {
    return { kind: 'rung', ...pick(cue, 'limb'), ladder: LADDER_MATERIAL };
  }
  if (cue.cue === 'splash') return { kind: 'splash', ...pick(cue, 'strength') };
  if (cue.cue === 'landing') {
    const { speed } = cue;
    return { kind: 'landing', speed };
  }
  return { kind: cue.cue };
}

/**
 * The cube's ear for `canvas`: silent until the first press on it or key
 * anywhere, as browsers ask, then the floor's room tone, the body's own
 * sounds, its voice, and each room sound in view on the eye's floor once,
 * from where it is.
 */
export function hear(canvas: HTMLCanvasElement): Hearing {
  const scape = createSoundscape();
  const unlock = (): void => {
    scape.unlock();
  };
  canvas.addEventListener('pointerdown', unlock);
  globalThis.addEventListener('keydown', unlock);
  /** The room sounds already played, by key, and when each began. */
  const played = new Map<string, number>();
  /** Whether the last shrink said was the first. */
  let afterFirst = false;

  const say = (moment: Moment, { n, x, y }: Pose): void => {
    const { grain } = rolledTraits.room.at({ n, x, y });
    const line = lineFor(moment, n, grain);
    scape.play(utter(line, voiceOf('visitor', n), VOICE_RATE), VOICE_RATE);
  };

  return {
    body: (cues, pose) => {
      scape.setPlace(themeOf(pose.n).sound, pose.scale);
      for (const cue of cues) {
        const sound = soundOf(cue, pose);
        if (sound !== null) scape.cue(sound);
        if (cue.cue !== 'say') continue;
        const { moment } = cue;
        // The shrink right after the first is said as the second.
        say(moment === 'shrink' && afterFirst ? 'second-shrink' : moment, pose);
        if (moment === 'first-shrink' || moment === 'shrink') {
          afterFirst = moment === 'first-shrink';
        }
      }
    },
    rooms: (heard, pose, nowMs) => {
      const now = nowMs / 1000;
      for (const [key, began] of played) {
        if (now - began > KEY_SECONDS) played.delete(key);
      }
      for (const { room, cue, source, loudness, sinceEpoch } of heard) {
        if (room.n !== pose.n) continue;
        const key = `${roomKey(room)}/${cue}/${String(sinceEpoch)}`;
        if (played.has(key)) continue;
        played.set(key, sinceEpoch);
        const at = {
          u: Number(room.x - pose.x) + source[0],
          v: Number(room.y - pose.y) + source[2],
        };
        scape.cue(
          {
            kind: cue,
            seed: word(key),
            from: bearingOf(pose, pose.yaw, at),
            loud: loudness,
          },
          Math.max(0, now - sinceEpoch),
        );
      }
    },
    dispose: () => {
      canvas.removeEventListener('pointerdown', unlock);
      globalThis.removeEventListener('keydown', unlock);
      scape.dispose();
    },
  };
}
