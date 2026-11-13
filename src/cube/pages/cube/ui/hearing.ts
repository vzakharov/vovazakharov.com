import { pick } from '@/kernel/shared/lib/collections';
import type { CanDispose } from '@/kernel/shared/typings';

import { pathHash } from '@/dice/shared/roll';

import { LADDER_MATERIAL, type Sound } from '@/cube/shared/lib/acoustics';
import { clockAt } from '@/cube/shared/lib/clock';
import { themeOf } from '@/cube/entities/theme';
import {
  isOutside,
  planted,
  type Pose,
  roomKey,
  type Whereabouts,
} from '@/cube/entities/world';
import type { Cue } from '@/cube/features/player';
import {
  BEACH,
  bearingOf,
  createSoundscape,
  heardFrom,
  type SoundCue,
  SOUNDING_ISLAND,
} from '@/cube/features/sound';
import { lineFor, type Moment, utter, voiceOf } from '@/cube/features/voice';

import { rolledTraits } from './cube-mesh';
import type { Heard } from './cube-scene';

/** What the ear hears: the body's own cues, and the rooms' sounds. */
export type Hearing = CanDispose & {
  /** A frame's cues, of the body now at `at`. */
  body: (cues: readonly Cue[], at: Whereabouts) => void;
  /** A frame's share of the outside, for an eye at `at` at `nowMs` since the epoch. */
  outside: (at: Whereabouts, nowMs: number) => void;
  /** A frame's room sounds, for an ear at `pose` at `nowMs` since the epoch. */
  rooms: (heard: readonly Heard[], pose: Pose, nowMs: number) => void;
};

/** The rate the voice is said at. */
const VOICE_RATE = 32_000;

/**
 * Milliseconds between two readings of the outside: each reads the sea along
 * the whole shore, and the soundscape eases between them anyway.
 */
const OUTSIDE_EVERY = 50;

/** Seconds a room sound's key is remembered after it began. */
const KEY_SECONDS = 60;

const word = pathHash(planted.seed);

/** The room a voice outside the cube is rolled from: floor 1's. */
const FIRST_ROOM = { n: 1, x: 0n, y: 0n };

/** How the place an eye is in sounds, and the body's size in it. */
function placeOf(at: Whereabouts): { sound: Sound; scale: number } {
  if (isOutside(at)) return { sound: BEACH, scale: 1 };
  const { sound } = themeOf(at.n);
  return { sound, ...pick(at, 'scale') };
}

/** The body's cue as the soundscape plays it, or null where it is said. */
function soundOf(cue: Cue, place: Sound): SoundCue | null {
  if (cue.cue === 'say') return null;
  if (cue.cue === 'step') {
    const { strength, ground } = cue;
    return { kind: 'step', strength, footing: ground ?? place.footing };
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
  /** When the outside was last read, on the page's own clock. */
  let outsideRead = -Infinity;
  /** Whether the last shrink said was the first. */
  let afterFirst = false;

  const say = (moment: Moment, at: Whereabouts): void => {
    const { n, x, y } = isOutside(at) ? FIRST_ROOM : at;
    const { grain } = rolledTraits.room.at({ n, x, y });
    const line = lineFor(moment, n, grain);
    scape.play(utter(line, voiceOf('visitor', n), VOICE_RATE), VOICE_RATE);
  };

  return {
    body: (cues, at) => {
      const { sound: place, scale } = placeOf(at);
      scape.setPlace(place, scale);
      for (const cue of cues) {
        const sound = soundOf(cue, place);
        if (sound !== null) scape.cue(sound);
        if (cue.cue !== 'say') continue;
        const { moment } = cue;
        // The shrink right after the first is said as the second.
        say(moment === 'shrink' && afterFirst ? 'second-shrink' : moment, at);
        if (moment === 'first-shrink' || moment === 'shrink') {
          afterFirst = moment === 'first-shrink';
        }
      }
    },
    outside: (at, nowMs) => {
      const tick = performance.now();
      if (tick - outsideRead < OUTSIDE_EVERY) return;
      outsideRead = tick;
      const { seconds } = clockAt(nowMs);
      scape.setOutside(heardFrom(SOUNDING_ISLAND, at, seconds), seconds);
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
