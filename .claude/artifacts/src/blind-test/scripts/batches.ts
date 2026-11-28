const MB = 1024 * 1024;
/** What one publish may carry beside the page: 255 files and 64 MB, the page's room kept. */
export const BATCH_FILES = 250;
export const BATCH_BYTES = 56 * MB;
/** The Artifact tool takes a binary file of at most this size. */
export const MAX_FILE_BYTES = 15 * MB;

export interface AudioFile {
  /** Where the page fetches it, relative to the page. */
  published: string;
  /** Where it is on disk, relative to the repository root. */
  source: string;
  bytes: number;
}

/**
 * The audio split into publishes the Artifact tool takes, each a `files` map
 * of published path to source path. A file over the tool's limit throws.
 */
export function batchFiles(
  files: readonly AudioFile[],
): Record<string, string>[] {
  const batches: Record<string, string>[] = [];
  let count = 0;
  let bytes = 0;
  for (const file of files) {
    if (file.bytes > MAX_FILE_BYTES) {
      throw new Error(
        `${file.source} is ${(file.bytes / MB).toFixed(1)} MB, over the ${String(MAX_FILE_BYTES / MB)} MB a published file may be`,
      );
    }
    const last = batches.at(-1);
    if (
      last === undefined ||
      count >= BATCH_FILES ||
      bytes + file.bytes > BATCH_BYTES
    ) {
      batches.push({ [file.published]: file.source });
      count = 1;
      bytes = file.bytes;
    } else {
      last[file.published] = file.source;
      count += 1;
      bytes += file.bytes;
    }
  }
  return batches;
}
