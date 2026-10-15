/**
 * The text edits a tag run makes beside the audio: a song document's file
 * URLs and MP3 size, and a repository README's mentions of the files it
 * renamed.
 */

export type UrlChange = { oldUrl: string; newUrl: string };

const MP3_BYTES = /^(mp3:\n(?: {2}.*\n)*? {2}bytes: )\d+$/m;

const STREAM = /^stream: .*$/m;

/**
 * `changes` replace the URLs the frontmatter states, `mp3Bytes` the size under
 * `mp3:`, and `stream` the `stream:` line, added after the `mp3:` block where
 * there is none. Throws on a URL or a size it cannot find, so a document that
 * spells either differently fails the run instead of keeping a dead link.
 */
export function rewriteSongDocument(
  markdown: string,
  changes: readonly UrlChange[],
  mp3Bytes: number,
  stream?: string,
): string {
  const lines = markdown.split('\n');

  for (const { oldUrl, newUrl } of changes) {
    const at = lines.findIndex(
      (line) => /^ *[a-z]+: /.test(line) && line.endsWith(`: ${oldUrl}`),
    );
    const line = lines[at];

    if (line === undefined)
      throw new Error(`No frontmatter line states ${oldUrl}`);
    lines[at] = `${line.slice(0, -oldUrl.length)}${newUrl}`;
  }

  const urled = lines.join('\n');

  if (!MP3_BYTES.test(urled))
    throw new Error('No mp3.bytes in the frontmatter');

  const sized = urled.replace(
    MP3_BYTES,
    (_, lead: string) => `${lead}${mp3Bytes}`,
  );

  if (stream === undefined) return sized;

  return STREAM.test(sized)
    ? sized.replace(STREAM, `stream: ${stream}`)
    : sized.replace(MP3_BYTES, (line) => `${line}\nstream: ${stream}`);
}

/**
 * Each old file name becomes its new one where a code span holds it alone, as
 * a README's list of files does. A command line that mentions the file (the
 * mastering script's output, say) stays as it was run.
 */
export function renameMentions(
  readme: string,
  renames: ReadonlyMap<string, string>,
): string {
  let renamed = readme;

  for (const [from, to] of renames) {
    renamed = renamed.replaceAll(`\`${from}\``, `\`${to}\``);
  }

  return renamed;
}
