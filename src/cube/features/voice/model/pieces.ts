import type { Timed } from '@/kernel/shared/typings';

import { type Band, type Manner, type PhoneSpec, SPECS } from './phone';

/**
 * How loud each source is, and how many times wider than a vowel's the
 * resonances over the first ring: a murmur's are wide, so only the first sounds.
 */
type Level = { voicing: number; breath: number; hiss: number; damp: number };

/**
 * A stretch of a phone over which its levels hold. Two pieces cross over the
 * shorter of their ramps, so a burst stays a burst, unless either has a
 * `melt`, which is then how long the crossing takes.
 */
export type Piece = Level &
  Timed & {
    ramp: number;
    melt: number;
    band?: Band;
  };

const QUIET = { voicing: 0, breath: 0, hiss: 0, damp: 1, melt: 0 };

type Around = { before?: PhoneSpec; after?: PhoneSpec };

export const voices = (spec?: PhoneSpec): boolean =>
  spec?.manner === 'vowel' || spec?.manner === 'approximant';

const VELARS: ReadonlySet<PhoneSpec> = new Set([SPECS.k, SPECS.g]);

/** A velar's burst sits just over the second resonance of what follows. */
const bandOf = (spec: PhoneSpec, { after }: Around): Band | undefined =>
  VELARS.has(spec) && after && voices(after)
    ? {
        core: Math.min(2800, Math.max(1300, after.formants[1] * 1.1)),
        width: 900,
      }
    : spec.hissing;

const held =
  (level: Partial<Level>, ramp: number) =>
  (_: PhoneSpec, seconds: number): Piece[] => [
    { ...QUIET, ...level, seconds, ramp },
  ];

const closure = (spec: PhoneSpec, seconds: number): Piece => ({
  ...QUIET,
  voicing: spec.voiced ? 0.18 : 0,
  damp: 4,
  seconds,
  ramp: 0.008,
});

const hissed = (
  spec: PhoneSpec,
  around: Around,
  seconds: number,
  ramp: number,
  voicing: number,
): Piece => {
  const band = bandOf(spec, around);
  return {
    ...QUIET,
    hiss: spec.hissing?.loudness ?? 0,
    voicing: spec.voiced ? voicing : 0,
    seconds,
    ramp,
    ...(band && { band }),
  };
};

/** The air let go after a voiceless stop, longest before a vowel. */
const puff = ({ before, after }: Around): Piece => {
  const open = voices(after);
  const brief = before === SPECS.s;
  return {
    ...QUIET,
    breath: open ? 0.7 : 0.35,
    damp: 1.6,
    seconds: open && !brief ? 0.04 : 0.02,
    ramp: 0.006,
  };
};

export const PIECES: Record<
  Manner,
  (spec: PhoneSpec, seconds: number, around: Around) => Piece[]
> = {
  vowel: held({ voicing: 1 }, 0.012),
  approximant: held({ voicing: 0.8 }, 0.012),
  nasal: held({ voicing: 0.8, damp: 14 }, 0.006),
  breath: held({ breath: 0.8, damp: 1.6 }, 0.015),
  pause: held({}, 0.01),
  fricative: (spec, seconds, around) => [
    {
      ...hissed(spec, around, seconds, 0.012, 0.4),
      damp: spec.voiced ? 1.5 : 1,
    },
  ],
  stop: (spec, seconds, around) => [
    closure(spec, seconds),
    hissed(spec, around, spec.voiced ? 0.008 : 0.012, 0.002, 0.3),
    ...(spec.voiced ? [] : [puff(around)]),
  ],
  affricate: (spec, seconds, around) => [
    closure(spec, seconds),
    hissed(spec, around, spec.voiced ? 0.055 : 0.075, 0.004, 0.3),
  ],
};

export const lasting = (pieces: readonly Piece[]): number =>
  pieces.reduce((sum, { seconds }) => sum + seconds, 0);

/** Nothing sounding for `seconds`. */
export const quiet = (seconds: number): Piece => ({
  ...QUIET,
  seconds,
  ramp: 0.01,
});
