/**
 * The text edits a tag run makes beside the audio: a song document's MP3
 * size, and a repository README's mentions of the files it renamed.
 */

const MP3_BYTES = /^mp3Bytes: \d+$/m;

/** Throws on a document that states no size, so the run fails rather than the feed. */
export function rewriteMp3Bytes(markdown: string, mp3Bytes: number): string {
  if (!MP3_BYTES.test(markdown)) {
    throw new Error('No mp3Bytes in the frontmatter');
  }

  return markdown.replace(MP3_BYTES, `mp3Bytes: ${mp3Bytes}`);
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
