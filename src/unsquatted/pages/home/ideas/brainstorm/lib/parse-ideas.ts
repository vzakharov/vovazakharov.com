import { cleanLabel } from '@/unsquatted/entities/domain/index.node-safe';
import { IDEA_LENGTH, IDEAS_SHOWN } from './prompt';

/**
 * The model's answer as at most `IDEAS_SHOWN` names, each cleaned as a typed
 * name is. A small model strays from the format, so a line that cleans to
 * nothing usable is dropped rather than failing the answer.
 */
export function parseIdeas(answer: string, label: string): string[] {
  const names = answer
    .replace(/<think>[\S\s]*?<\/think>/, '')
    .split('\n')
    .map((line) => cleanLabel(line.replace(/^\W*\d*[).]?\s*/, '')));

  return [
    ...new Set(
      names.filter(
        (name) =>
          name !== label &&
          name.length >= IDEA_LENGTH.min &&
          name.length <= IDEA_LENGTH.max,
      ),
    ),
  ].slice(0, IDEAS_SHOWN);
}
