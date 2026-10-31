import { z } from 'zod';

import raw from './lexicon.json';

/** Written by `pnpm whisper-lexicon`; parsed here because a JSON import's type is only a guess. */
export const LEXICON = z
  .object({
    commit: z.string().regex(/^[\da-f]{40}$/),
    words: z.array(z.tuple([z.string(), z.number().int().positive()])),
  })
  .parse(raw);
