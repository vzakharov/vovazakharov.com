import { cleanLabel } from '../../../checker/index.node-safe';
import { IDEA_LENGTH, IDEAS_SHOWN } from './prompt';

/**
 * The model's answer as at most `IDEAS_SHOWN` names, each cleaned as a typed
 * name is. A small model strays from the format, so a line that cleans to
 * nothing usable is dropped rather than failing the answer.
 */
export function parseIdeas(answer: string, label: string): string[] {
  const names = withoutThought(answer)
    .split('\n')
    .map((line) => cleanLine(line));

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

/**
 * An answer still being written, as the names it has so far: its finished
 * lines as `parseIdeas` reads them, then the line being written, cleaned but
 * not yet judged, so its letters show as they come.
 */
export function typedIdeas(partial: string, label: string): string[] {
  const text = withoutThought(partial);
  const lineStart = text.lastIndexOf('\n') + 1;
  const names = parseIdeas(text.slice(0, lineStart), label);
  const typing = cleanLine(text.slice(lineStart));

  return typing && names.length < IDEAS_SHOWN ? [...names, typing] : names;
}

/** The answer past its thought, which may still be open. */
function withoutThought(answer: string): string {
  return answer.replace(/<think>[\S\s]*?(<\/think>|$)/, '');
}

function cleanLine(line: string): string {
  return cleanLabel(line.replace(/^\W*\d*[).]?\s*/, ''));
}
