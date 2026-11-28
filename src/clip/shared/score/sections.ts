import type { Named, Ranged } from '@/kernel/shared/typings';

import { SONG_SECONDS } from './song';

/** How the drums carry a section, which sets what one of its pulses is. */
const FEELS = [
  'intro',
  'double',
  'four-on-floor',
  'straight',
  'half',
  'quarter',
  'breakdown',
] as const;

export type Feel = (typeof FEELS)[number];

/** A section's own grid: its tempo, and a time a bar opens at. */
export type Tempo = { bpm: number; downbeat: number };

/** A section's name, grid and feel, wherever it is placed. */
type Felt = Named & Tempo & { feel: Feel };

export type Section = Ranged & Felt;

/** A section as the operator marked it — `about` when it starts — and its measured grid. */
type Marked = Felt & { about: number };

/**
 * The song by feel, each section's grid measured on its own off the master.
 * The tatum, 0.128 s, holds from 0:19 to the breakdown: a sixteenth at
 * ~117 BPM up to the chorus, a triplet eighth at ~156 from it, where the
 * kick moves from every fourth tatum to every third. The intro is one hit a
 * bar, 1.946 s apart; the breakdown takes a tempo of its own.
 */
const MARKED: readonly Marked[] = [
  { name: 'intro', feel: 'intro', about: 0, bpm: 123.35, downbeat: -0.101 },
  {
    name: 'double time',
    feel: 'double',
    about: 19,
    bpm: 117.25,
    downbeat: 19.74,
  },
  {
    name: 'verse, first half',
    feel: 'four-on-floor',
    about: 28,
    bpm: 117.546,
    downbeat: 29.958,
  },
  {
    name: 'verse, second half',
    feel: 'straight',
    about: 36,
    bpm: 117.024,
    downbeat: 36.126,
  },
  { name: 'chorus', feel: 'half', about: 43, bpm: 156.147, downbeat: 43.572 },
  {
    name: 'pre-bridge',
    feel: 'quarter',
    about: 60,
    bpm: 156.022,
    downbeat: 60.749,
  },
  {
    name: 'melodic bridge',
    feel: 'quarter',
    about: 77,
    bpm: 156.003,
    downbeat: 77.66,
  },
  {
    name: 'breakdown',
    feel: 'breakdown',
    about: 95,
    bpm: 102.058,
    downbeat: 96.136,
  },
];

/** Beats a bar holds, in every section. */
const BEATS_PER_BAR = 4;

/** One beat of `tempo`, in seconds. */
export const beatSeconds = ({ bpm }: Tempo): number => 60 / bpm;

/** One bar of `tempo`, in seconds. */
export const barSeconds = (tempo: Tempo): number =>
  beatSeconds(tempo) * BEATS_PER_BAR;

/** The bar line of `tempo` nearest `t`; never before 0. */
function nearestBar(tempo: Tempo, t: number): number {
  const bar = barSeconds(tempo);
  return Math.max(
    0,
    tempo.downbeat + Math.round((t - tempo.downbeat) / bar) * bar,
  );
}

/** Every section, each starting on its own bar line nearest its mark and ending where the next starts. */
export const SECTIONS: readonly Section[] = MARKED.map(
  ({ about, ...section }, n) => {
    const next = MARKED[n + 1];
    return {
      ...section,
      from: nearestBar(section, about),
      to: next ? nearestBar(next, next.about) : SONG_SECONDS,
    };
  },
);

/** The section playing at `t`: the first before the song, the last after it. */
export function sectionAt(
  t: number,
  sections: readonly Section[] = SECTIONS,
): Section {
  const found =
    sections.findLast((section) => section.from <= t) ?? sections[0];
  if (!found) throw new Error('No sections to read');
  return found;
}
