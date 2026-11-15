import type { Seeded } from '@/kernel/shared/typings';

import type {
  Ladder,
  Limb,
  Loud,
  RoomCue,
  Underfoot,
} from '@/cube/shared/lib/acoustics';
import { clamp01 } from '@/cube/shared/lib/ease';
import type { InRoom } from '@/cube/entities/world';

import { breath, grunt, jump, landing, swallow } from './body';
import { knock, pill, ring, shrinking, stepsAway, thud } from './fixture';
import { footstep } from './footstep';
import { rung } from './ladder';
import { splash } from './splash';
import { creak, mew, pop, rustle, scrape } from './stirs';

/** How far to an ear's right a sound is. */
type Sided = {
  /** −1 dead left to 1 dead right; 0 ahead, behind or at the ear. */
  rightward: number;
};

/** Where a sound is for an ear: how far to its right, and how far off. */
type Bearing = Sided & {
  /** Room sides off. */
  roomsAway: number;
};

/**
 * Where `source` is for an ear at `ear` looking along `yaw` (radians, 0 east,
 * π/2 south, as a pose's). Both are in one room's frame; a source in a room
 * beside it is a point past that frame's edge.
 */
export function bearingOf(ear: InRoom, yaw: number, source: InRoom): Bearing {
  const du = source.u - ear.u;
  const dv = source.v - ear.v;
  const roomsAway = Math.hypot(du, dv);
  if (roomsAway === 0) return { rightward: 0, roomsAway };
  return {
    rightward: (dv * Math.cos(yaw) - du * Math.sin(yaw)) / roomsAway,
    roomsAway,
  };
}

/**
 * A sound a room makes on its own: where it is for the ear, how loud, and the
 * seed whatever raised it rolled from the room and the moment, so everyone
 * there hears the same knock.
 */
type Roomed = Seeded & {
  from: Bearing;
  /** 0 to 1, as loud as it would be beside the ear. */
  loud: number;
};

/** Something to be heard once, now. */
export type SoundCue =
  | { kind: 'step'; strength: number; footing: Underfoot }
  | { kind: 'jump' }
  | { kind: 'landing'; speed: number }
  | { kind: 'pill' }
  | { kind: 'swallow' }
  | { kind: 'rung'; limb: Limb; ladder: Ladder }
  | { kind: 'splash'; strength: number }
  | { kind: 'breath'; effort: number }
  | { kind: 'grunt' }
  | { kind: 'shrink' }
  | (Roomed & { kind: RoomCue });

/** Seconds the shrink is heard for. */
export const SHRINK_SECONDS = 3;

/**
 * The samples of `cue` at `rate`, on a floor that is `footing` underfoot. A
 * step names its own footing; a landing and steps going away take the
 * floor's.
 */
export function samplesOf(
  cue: SoundCue,
  footing: Underfoot,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  switch (cue.kind) {
    case 'step': {
      return footstep(cue.footing, cue.strength, seed, rate);
    }
    case 'jump': {
      return jump(seed, rate);
    }
    case 'landing': {
      return landing(cue.speed, footing, seed, rate);
    }
    case 'pill': {
      return pill(seed, rate);
    }
    case 'swallow': {
      return swallow(seed, rate);
    }
    case 'rung': {
      return rung(cue.ladder, cue.limb, seed, rate);
    }
    case 'splash': {
      return splash(cue.strength, seed, rate);
    }
    case 'breath': {
      return breath(cue.effort, seed, rate);
    }
    case 'grunt': {
      return grunt(seed, rate);
    }
    case 'shrink': {
      return shrinking(SHRINK_SECONDS, seed, rate);
    }
    case 'ring': {
      return ring(seed, rate);
    }
    case 'knock': {
      return knock(seed, rate);
    }
    case 'thud': {
      return thud(seed, rate);
    }
    case 'steps': {
      return stepsAway(footing, seed, rate);
    }
    case 'creak': {
      return creak(seed, rate);
    }
    case 'rustle': {
      return rustle(seed, rate);
    }
    case 'pop': {
      return pop(seed, rate);
    }
    case 'mew': {
      return mew(seed, rate);
    }
    case 'scrape': {
      return scrape(seed, rate);
    }
    default: {
      throw new TypeError(`Not a cue: ${String(cue satisfies never)}`);
    }
  }
}

/** How a sound sits in the mix. */
export type Mix = Loud & {
  /** −1 left to 1 right. */
  balance: number;
  /** The share of it sent through the room's reverb, 0 to 1. */
  reverb: number;
};

/** A mix and the speed its samples play at, 1 as they were made. */
export type Voiced = Mix & { playbackRate: number };

/** The cues that are the body's own: they shrink with it. */
const BODILY: ReadonlySet<SoundCue['kind']> = new Set([
  'step',
  'jump',
  'landing',
  'breath',
  'grunt',
  'swallow',
]);

const GAINS: Record<Exclude<SoundCue['kind'], RoomCue>, number> = {
  step: 0.55,
  jump: 0.4,
  landing: 0.8,
  pill: 0.45,
  swallow: 0.5,
  rung: 0.6,
  splash: 0.7,
  breath: 0.35,
  grunt: 0.5,
  shrink: 0.6,
};

/** Room sides at which a room's sound has lost half its level. */
const HALF_AWAY = 0.6;

const isRoomed = (cue: SoundCue): cue is Roomed & { kind: RoomCue } =>
  'from' in cue;

/**
 * How `cue` is played to a body of `scale` (1 a whole person of the floor, ½
 * one about to be the next floor's). The body's own sounds get lighter and
 * higher as it shrinks, the room's stay the room's; a room's sound fades,
 * moves aside and takes on more of the room with distance.
 */
export function voicedOf(cue: SoundCue, scale: number): Voiced {
  if (isRoomed(cue)) {
    const { rightward, roomsAway } = cue.from;
    return {
      loudness: clamp01(cue.loud) / (1 + (roomsAway / HALF_AWAY) ** 2),
      // A source at the ear is in neither one: it moves aside as it moves off.
      balance: rightward * clamp01(roomsAway / 0.3),
      reverb: clamp01(0.35 + 0.5 * roomsAway),
      playbackRate: 1,
    };
  }
  const size = BODILY.has(cue.kind) ? Math.min(1, Math.max(0.25, scale)) : 1;
  return {
    loudness: GAINS[cue.kind] * Math.sqrt(size),
    balance: 0,
    reverb: 0.3,
    playbackRate: size ** -0.35,
  };
}
