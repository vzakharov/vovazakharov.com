import type { NextConfig } from 'next';
import { execFileSync } from 'node:child_process';

import { siteNextConfig } from '../site-next-config';

const site = siteNextConfig('vova', import.meta.dirname);

// The commit this build is of, which /island's where-line prints so a report
// names the build it came from. Read once per build; a build outside a git
// checkout fails here rather than printing a wrong commit.
const commit = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], {
  cwd: import.meta.dirname,
  encoding: 'utf8',
}).trim();

export default {
  ...site,
  env: { ...site.env, NEXT_PUBLIC_COMMIT: commit },
} satisfies NextConfig;
