import {
  type Singer,
  singerSchema,
} from '@/shared/music-catalogue/index.node-safe';

import { definesNote } from './lyric-notes';

/** `<!-- voice: Кирилл -->`, `<!-- voice: Майя, Кирилл -->`: who sings the stanza below. */
const VOICE_MARKER = /^<!--\s*voice:(.*)-->$/;

function marks(line: string): RegExpExecArray | null {
  return VOICE_MARKER.exec(line.trim());
}

function checkSingers(names: string, fileName: string): void {
  for (const name of names.split(',').map((part) => part.trim())) {
    const read = singerSchema.safeParse(name);

    if (!read.success) {
      throw new Error(
        `${fileName}: ${read.error.issues.map(({ message }) => message).join(' ')}`,
      );
    }
  }
}

/**
 * The sung words with their voice markers lifted out, each checked to name
 * singers the registry has and to open a stanza — on its own line above the
 * stanza's first, with no blank line between. A song that marks any stanza
 * states in `voice` who sings the rest.
 */
export function liftVoices(
  section: string,
  fileName: string,
  voice: Singer | undefined,
): string {
  const lines = section.split('\n');
  let marked = false;

  for (const [index, line] of lines.entries()) {
    const marker = marks(line);

    if (marker === null) continue;

    const [above = '', below = ''] = [lines[index - 1], lines[index + 1]];

    if (
      above.trim() !== '' ||
      below.trim() === '' ||
      marks(below) !== null ||
      definesNote(below)
    ) {
      throw new Error(
        `${fileName}: “${line.trim()}” is not on a stanza; a voice marker sits on its own line directly above a stanza's first.`,
      );
    }

    checkSingers(marker[1] ?? '', fileName);
    marked = true;
  }

  if (marked && voice === undefined) {
    throw new Error(
      `${fileName} marks whose voice some stanzas are in and has no \`voice\` saying whose the rest are.`,
    );
  }

  return lines.filter((line) => marks(line) === null).join('\n');
}

/**
 * Voices are marked on the sung words alone, and a crib or a romanization
 * follows them stanza for stanza — so a marker in either fails the build
 * rather than showing as a line of verse.
 */
export function refuseVoices(section: string, fileName: string): void {
  const marked = section.split('\n').find((line) => marks(line) !== null);

  if (marked !== undefined) {
    throw new Error(
      `${fileName}: “${marked.trim()}” is outside the sung words; voices are marked there alone.`,
    );
  }
}
