import type { Timed } from '@/kernel/shared/typings';

import { KICKS } from './kick-data';
import {
  beatSeconds,
  type Feel,
  type Section,
  sectionAt,
  SECTIONS,
} from './sections';

/** The pulse playing: which one of its section, counted from 0, how far through it, and how long it is. */
export type Pulse = Timed & { index: number; fraction: number };

/** How many beats one pulse of a feel spans; a breakdown's pulse is each hit. */
const PULSE_BEATS: Record<Feel, number | 'hits'> = {
  intro: 4,
  double: 1,
  'four-on-floor': 1,
  straight: 1,
  half: 2,
  quarter: 4,
  breakdown: 'hits',
};

// A time computed as a pulse's own start lands a rounding error short of it.
const ON_PULSE = 1e-9;

function onGrid(section: Section, beats: number, t: number): Pulse {
  const seconds = beatSeconds(section) * beats;
  const lead = (section.from - section.downbeat) / seconds;
  const first = section.downbeat + Math.floor(lead + ON_PULSE) * seconds;
  const at = (t - first) / seconds;
  const index = Math.floor(at + ON_PULSE);
  return { index, fraction: Math.max(0, at - index), seconds };
}

/** A pulse from the section's start, then one from each hit inside it. */
function onHits(section: Section, hits: readonly number[], t: number): Pulse {
  const starts = [
    section.from,
    ...hits.filter((hit) => hit > section.from && hit < section.to),
  ];
  const index = Math.max(
    0,
    starts.findLastIndex((start) => start <= t),
  );
  const start = starts[index] ?? section.from;
  const seconds = (starts[index + 1] ?? section.to) - start;
  return {
    index,
    fraction: seconds > 0 ? Math.min(1, Math.max(0, (t - start) / seconds)) : 0,
    seconds,
  };
}

/**
 * The section's pulse at `t`: a bar in the intro and in quarter time, a beat
 * in double, four-on-the-floor and straight time, two beats in half time,
 * and each kick in the breakdown.
 */
export function pulse(
  t: number,
  sections: readonly Section[] = SECTIONS,
  hits: readonly number[] = KICKS,
): Pulse {
  const section = sectionAt(t, sections);
  const beats = PULSE_BEATS[section.feel];
  return beats === 'hits'
    ? onHits(section, hits, t)
    : onGrid(section, beats, t);
}
