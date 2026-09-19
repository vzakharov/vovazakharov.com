// Writing a file the harness's `Stop` check may be reading. That check runs in
// parallel with the hook that writes these, and counts a half-written file and
// a stray staging file alike — so the write lands under gitignored `tmp/` and
// arrives at its path by rename, which is atomic within a filesystem.

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
