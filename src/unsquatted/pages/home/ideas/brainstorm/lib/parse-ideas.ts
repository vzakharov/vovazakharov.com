import { z } from 'zod';

import { cleanLabel } from '../../../checker/index.node-safe';
import { IDEA_LENGTH, IDEAS_SHOWN } from './prompt';

const Answer = z.array(z.string());

/**
 * The model's answer as at most `IDEAS_SHOWN` names: the JSON array in it,
 * each entry cleaned as a typed name is, held to `IDEA_LENGTH`, deduped, and
 * never `label` itself. An answer holding no such array throws, since the
 * response constraint promised one.
 */
export function parseIdeas(answer: string, label: string): string[] {
  const json = /\[[\S\s]*]/.exec(answer)?.[0];
  const names = Answer.parse(JSON.parse(json ?? answer)).map((name) =>
    cleanLabel(name),
  );

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
