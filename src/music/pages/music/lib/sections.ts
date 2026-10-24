import type { Locale } from '@/kernel/shared/i18n';

/**
 * A body section marker: `<!-- lang:ru -->` opens the Russian story,
 * `<!-- lyrics:en -->` the English words. An HTML comment rather than a heading
 * because it has to disappear in every other renderer — the authored file is
 * read raw, on GitHub and at its own `.md` URL, and a marker that shows up
 * there would be markup the reader has to look past.
 */
const SECTION_MARKER = /^<!--\s*([a-z]+):([a-z-]+)\s*-->$/;

/** The key a section before the first marker is filed under: it belongs to every locale. */
const PREAMBLE = '';

/**
 * Cuts a body into its marked sections, keyed `<kind>:<name>`. Text before the
 * first marker is the preamble; an empty section is left out, so a caller asks
 * for what it wants and gets `undefined` where the author wrote nothing.
 */
export function splitSections(body: string): ReadonlyMap<string, string> {
  const sections = new Map<string, string>();
  let key = PREAMBLE;
  let lines: string[] = [];

  function flush(): void {
    const text = lines.join('\n').trim();

    if (text.length > 0) sections.set(key, text);
    lines = [];
  }

  for (const line of body.split('\n')) {
    const marker = SECTION_MARKER.exec(line.trim());

    if (marker) {
      flush();
      key = `${marker[1]}:${marker[2]}`;
      continue;
    }

    lines.push(line);
  }

  flush();

  return sections;
}

/** Whether text says anything to a reader once its HTML comments — notes for whoever edits the file — are gone. */
function says(text: string): boolean {
  return text.replaceAll(/<!--[\S\s]*?-->/g, '').trim() !== '';
}

/**
 * The prose one locale reads: the preamble, which belongs to every locale, and
 * the section `<!-- lang:<locale> -->` opens. A song's story and an album's
 * text are both cut this way. A section that says nothing is left out, so a
 * song with no story reads as the empty string.
 */
export function localeProse(body: string, locale: Locale): string {
  const sections = splitSections(body);

  return [sections.get(PREAMBLE), sections.get(`lang:${locale}`)]
    .filter((section) => section !== undefined && says(section))
    .join('\n\n');
}

/** The sections told beside a page's story, by the marker that opens them. */
const PRELUDE_KINDS = ['universe', 'source'] as const;

export type PreludePlacement = {
  kind: (typeof PRELUDE_KINDS)[number];
  /** Whether the file tells it after the story, which the page then follows. */
  follows: boolean;
};

/**
 * The section `<!-- universe:<locale> -->` or `<!-- source:<locale> -->` opens,
 * without the preamble that `localeProse` prepends; `undefined` where neither
 * says anything. A file tells one or the other, never both.
 */
export function localePrelude(
  body: string,
  locale: Locale,
): (PreludePlacement & { text: string }) | undefined {
  const sections = splitSections(body);
  const order = [...sections.keys()];
  const story = order.indexOf(`lang:${locale}`);
  const told = PRELUDE_KINDS.flatMap((kind) => {
    const key = `${kind}:${locale}`;
    const text = sections.get(key);

    return text !== undefined && says(text)
      ? [{ kind, text, follows: story !== -1 && order.indexOf(key) > story }]
      : [];
  });

  if (told.length > 1)
    throw new Error(
      `A file tells both a universe and a source in ${locale}; a page has one prelude.`,
    );

  return told[0];
}

/** What the second of a page's two parts is titled, by what it is. */
export type StoryHeadings = {
  behindTheScenes: string;
  preludeHeadings: Record<PreludePlacement['kind'], string>;
};

/**
 * A page's prelude and story in the order its file tells them; where there are
 * both, the second carries a heading saying what it is.
 */
export function storyOrder<T>(
  prelude: (T & PreludePlacement) | undefined,
  story: T | undefined,
  { behindTheScenes, preludeHeadings }: StoryHeadings,
): Array<{ part: T; heading?: string }> {
  if (prelude === undefined)
    return story === undefined ? [] : [{ part: story }];
  if (story === undefined) return [{ part: prelude }];

  return prelude.follows
    ? [
        { part: story },
        { part: prelude, heading: preludeHeadings[prelude.kind] },
      ]
    : [{ part: prelude }, { part: story, heading: behindTheScenes }];
}

const COMMENT_LINE = /^<!--.*-->$/;

/**
 * Lines grouped into stanzas, which is the unit a translation is read against —
 * verse does not survive being zipped line for line. A comment line — a note
 * for whoever reads the file, such as `<!-- voice: Майя -->` — is not verse,
 * so it is dropped unread.
 */
export function splitStanzas(text: string): string[][] {
  return text
    .split(/\n\s*\n/)
    .map((stanza) =>
      stanza
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => !COMMENT_LINE.test(line)),
    )
    .filter((stanza) => stanza.some((line) => line.length > 0));
}
