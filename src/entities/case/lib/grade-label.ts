import type { CaseFrontmatter } from '@/shared/content';

/** An enum value as the stamp prints it: `public-figure` → `PUBLIC FIGURE`. */
const stamp = (value: string) => value.replaceAll('-', ' ').toUpperCase();

/**
 * The act or credit and the actor, as one stamp: `HARM · ORGANIZATION`, and a
 * mixed case's `HARM / CARE · INDIVIDUAL`. Plain text, because the social card
 * prints it too, outside React.
 */
export function gradeLabel({
  act,
  credit,
  actor,
}: CaseFrontmatter['grade']): string {
  const deeds = [act, credit].filter((deed) => deed !== undefined);
  return `${deeds.map((deed) => stamp(deed)).join(' / ')} · ${stamp(actor)}`;
}
