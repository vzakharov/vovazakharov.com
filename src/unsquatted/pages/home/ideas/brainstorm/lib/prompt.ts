/**
 * How many variations a search asks for and shows. Asking for no more than
 * are shown keeps the generation short; the parser's cuts may leave fewer.
 */
export const IDEAS_SHOWN = 3;

/** Short enough to type, long enough to be a name. */
export const IDEA_LENGTH = { min: 3, max: 15 };

/**
 * The naming runbook's taste (`src/unsquatted/scripts/RUNBOOK.md` § "What a
 * pick is"), cut to what a model under a billion parameters acts on: worded
 * rules alone get the name back on every line, so the examples carry the taste.
 */
const SYSTEM_PROMPT = `You invent alternative domain names for a name that is already taken.

Each alternative keeps the feel of the name but changes its form: a respelling, a blend, a coined word, a related rare word, or two short words run together. Never repeat the name itself, never just add "get", "my", "app" or "hq".

Answer with ${String(IDEAS_SHOWN)} names, one per line, lowercase letters only.`;

const EXAMPLES: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['bookworm', ['bookwyrm', 'pagemoth', 'readling']],
  ['sunrise', ['dawnly', 'sunrize', 'firstlight']],
  ['fastship', ['swiftkeel', 'quickhull', 'zipferry']],
];

const ask = (label: string) => `The name: ${label}`;

/** The chat that asks for variations of `label`, the examples as past turns. */
export const chatFor = (label: string) => [
  { role: 'system', content: SYSTEM_PROMPT },
  ...EXAMPLES.flatMap(([name, ideas]) => [
    { role: 'user', content: ask(name) },
    { role: 'assistant', content: ideas.join('\n') },
  ]),
  { role: 'user', content: ask(label) },
];
