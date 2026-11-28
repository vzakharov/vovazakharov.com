import type { Ranged } from '@/kernel/shared/typings';

import { beatSeconds, type Section, SECTIONS } from '@/clip/shared/score';

/** The section called `name` on the song's map. */
export function sectionNamed(name: string): Section {
  const found = SECTIONS.find((section) => section.name === name);
  if (!found) throw new Error(`No section is named «${name}»`);
  return found;
}

/**
 * The span from beat `from` to beat `to` of `section`, counted from its
 * opening bar line; a fraction lands between beats.
 */
export const beatsOf = (section: Section, from: number, to: number): Ranged => {
  const beat = beatSeconds(section);
  return { from: section.from + from * beat, to: section.from + to * beat };
};
