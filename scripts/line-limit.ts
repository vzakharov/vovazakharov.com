/**
 * The line limit every text file in the tree is held to, and the files frozen
 * above it. `line-limit.test.ts` runs it over the repo; vet runs that test.
 */

import { readFileSync } from 'node:fs';

export const LIMIT = 400;

/**
 * Machine-written data, exported threads and vendored projects, which nobody
 * splits by hand here.
 */
const EXCLUDED = [
  /(^|\/)pnpm-lock\.yaml$/u,
  // Vendored from vzakharov/muthur, edited only there.
  /^\.claude\/artifacts\//u,
  /^docs\/(pr|issue)\//u,
  /\.jsonl?$/u,
];

/** A staged copy answers to the entry of the file it will replace. */
const STAGED = /^\.claude\/staged\/(.+)\.staged$/u;

export const ALLOWLIST_PATH = 'scripts/line-limit-allowlist.json';

export function isChecked(file: string): boolean {
  return !EXCLUDED.some((pattern) => pattern.test(file));
}

/** Lines as `wc -l` would count them, plus an unterminated last one. */
export function countLines(text: string): number {
  if (text === '') return 0;
  const breaks = text.split('\n').length - 1;
  return text.endsWith('\n') ? breaks : breaks + 1;
}

/** `null` for a binary file: a NUL in its first 8 KB, as git judges it. */
export function readLines(file: string): number | null {
  const bytes = readFileSync(file);
  if (bytes.subarray(0, 8000).includes(0)) return null;
  return countLines(bytes.toString('utf8'));
}

/**
 * Every way the tree breaks the limit: a file over it and not on the
 * allowlist, a listed file whose length differs from its entry — grown, or
 * shrunk without the entry following it down — and an entry for a file now
 * gone or back under the limit.
 */
export function violations(
  lengths: ReadonlyMap<string, number>,
  allowlist: Readonly<Record<string, number>>,
): string[] {
  const found: string[] = [];
  for (const [file, lines] of lengths) {
    if (lines <= LIMIT) continue;
    const entry = allowlist[file.replace(STAGED, '$1')];
    if (entry === undefined)
      found.push(`${file}: ${lines} lines, over ${LIMIT} — split it`);
    else if (lines > entry)
      found.push(
        `${file}: ${lines} lines, its allowlist entry ${entry} — it may only shrink; split it`,
      );
    else if (lines < entry && !STAGED.test(file))
      found.push(
        `${file}: ${lines} lines — lower its entry in ${ALLOWLIST_PATH} from ${entry} to ${lines}`,
      );
  }
  for (const file of Object.keys(allowlist)) {
    const lines = lengths.get(file);
    if (lines === undefined)
      found.push(`${file}: gone — remove its entry from ${ALLOWLIST_PATH}`);
    else if (lines <= LIMIT)
      found.push(
        `${file}: ${lines} lines, under the limit — remove its entry from ${ALLOWLIST_PATH}`,
      );
  }
  return found;
}
