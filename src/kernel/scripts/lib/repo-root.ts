/**
 * The repository's root, for a script that must find it without resolving a
 * site: `site-tree.ts` and `content-tree.ts` resolve one on import. Bare Node
 * runs `check-i18n-payload.ts`, which imports it, so this file stays free of
 * syntax its type stripping cannot erase.
 */

import path from 'node:path';

export const REPO_ROOT = path.join(import.meta.dirname, '..', '..', '..', '..');
