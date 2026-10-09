import type { Locale } from '@/shared/i18n';

/**
 * A body section marker: `<!-- lang:ru -->` opens the Russian story,
 * `<!-- lyrics:en -->` the English words. An HTML comment rather than a heading
 * because it has to disappear in every other renderer — the authored file is
 * read raw, on GitHub and at its own `.md` URL, and a marker that shows up
 * there would be markup the reader has to look past.
 */
const SECTION_MARKER = /^<!--\s*([a-z]+):([a-z-]+)\s*-->$/;

/** The key a section before the first marker is filed under: it belongs to every locale. */
export const PREAMBLE = '';

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

/**
 * The prose one locale reads: the preamble, which belongs to every locale, and
 * the section `<!-- lang:<locale> -->` opens. A song's story and an album's
 * text are both cut this way.
 */
export function localeProse(body: string, locale: Locale): string {
  const sections = splitSections(body);

  return [sections.get(PREAMBLE), sections.get(`lang:${locale}`)]
    .filter((section) => section !== undefined)
    .join('\n\n');
}

/** A line that is one HTML comment and nothing else. */
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
