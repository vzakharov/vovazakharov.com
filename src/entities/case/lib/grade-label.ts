import type { CaseFrontmatter } from '@/shared/content';

/** An enum value as the stamp prints it: `public-figure` → `PUBLIC FIGURE`. */
const stamp = (value: string) => value.replaceAll('-', ' ').toUpperCase();

/**
 * The act and the actor, as one stamp: `HARM · ORGANIZATION`. Plain text,
 * because the social card prints it too, outside React.
 */
export function gradeLabel({ act, actor }: CaseFrontmatter['grade']): string {
  return `${stamp(act)} · ${stamp(actor)}`;
}
