/** How many variations a search shows. */
export const IDEAS_SHOWN = 3;

/**
 * The naming runbook's taste (`src/unsquatted/scripts/RUNBOOK.md` § "What a
 * pick is"), cut to what a small model can act on. Its first ideas are the
 * ones every other model has, and those are registered.
 */
export const SYSTEM_PROMPT = `You suggest alternative domain names, without the zone, for a name someone wants but may find taken.

Good alternatives:
- keep the name's meaning or feel, but are not just the name with a word stuck on (no "get", "my", "app", "hq", "online");
- are one word or two run together, 4 to 12 letters, easy to say and spell;
- vary in form: a respelling, a compound, a coined word, a rare real word, a short phrase;
- are not the first thing that comes to mind, since those are already registered.

Answer with lowercase letters only, no dots, no explanations.`;

export const promptFor = (label: string) =>
  `The name: ${label}\nSuggest six alternatives.`;

/** Six asked for, so the three shown survive the parser's cuts. */
export const RESPONSE_SCHEMA = {
  type: 'array',
  items: { type: 'string', pattern: '^[a-z]{3,15}$' },
  minItems: 6,
  maxItems: 6,
};
