// A write cut off halfway leaves the old file rather than half a new one, so it
// is staged and renamed into place — under the repo's own gitignored `tmp/`,
// where a stray staging file is invisible to git and the rename is on the same
// filesystem.

import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const writeAtomic = (
  root: string,
  out: string,
  contents: string,
): void => {
  const staged = path.join(root, 'tmp', `${path.basename(out)}.staged`);
  mkdirSync(path.dirname(staged), { recursive: true });
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(staged, contents);
  renameSync(staged, out);
};
