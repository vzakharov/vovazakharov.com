import {
  barSeconds,
  beatSeconds,
  CHANT,
  sectionAt,
  SECTIONS,
  VERSE_CALLS,
} from '@/clip/shared/score';
import type { Shot } from '@/clip/shared/timeline';

import { type Look, placeholder } from './placeholder';

/** The sections played in the room rather than on the TV. */
const IN_REALITY = new Set([
  'verse, first half',
  'verse, second half',
  'melodic bridge',
]);
for (const name of IN_REALITY) {
  if (!SECTIONS.some((section) => section.name === name)) {
    throw new Error(`No section is named «${name}»`);
  }
}

/** One shot a section, each cut a channel change where it plays on the TV. */
const sections: Shot[] = SECTIONS.map((section, n) => {
  const look: Look = IN_REALITY.has(section.name) ? 'reality' : 'broadcast';
  return { ...section, draw: placeholder(section.name, look, n + 2) };
});

/** Each verse call a cut to a channel for a beat, back to the room after it. */
const calls: Shot[] = VERSE_CALLS.map((from, n) => ({
  from,
  to: from + beatSeconds(sectionAt(from)),
  draw: placeholder(`Call ${String(n + 1)}`, 'broadcast', 20 + n),
}));

/** Every «Хорошо» of the chant a new channel, held a bar or to the next. */
const chant: Shot[] = CHANT.map((from, n) => ({
  from,
  to: Math.min(CHANT[n + 1] ?? Infinity, from + barSeconds(sectionAt(from))),
  draw: placeholder(`Zap ${String(n + 1)}`, 'broadcast', 30 + n),
}));

/**
 * The clip, shot by shot, against the song's map. A later entry cuts into
 * an earlier one where their spans overlap, so a scene replaces a stand-in by
 * taking its entry's place.
 */
export const SHOTS: readonly Shot[] = [...sections, ...calls, ...chant];
