import { createHash } from 'node:crypto';

/**
 * Names a committed render by the source it was produced from, so a source
 * edited without a re-render is caught rather than shipped stale. Both the
 * authoring script and the build compute it, so changing it invalidates every
 * committed render.
 *
 * No `import 'server-only'`, unlike the rest of `shared/content/`: the render
 * scripts run it under bare Node, outside any bundler.
 */
export function contentHash(source: string): string {
  return createHash('sha256')
    .update(source.trim(), 'utf8')
    .digest('hex')
    .slice(0, 12);
}
