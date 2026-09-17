/**
 * `unsafe` in the sibling repo's sense: the raw environment read, carrying no
 * `server-only` of its own, so nothing stops a client chain importing it — and
 * zod rides along, at a measured +377 kB when it reached the browser through
 * `site-config` and the CV sheet. Reach it through a barrel that states which
 * side it is for: `resolved-site.ts` behind `index.server-only.ts` for the app,
 * `index.node-safe.ts` for the render scripts, which run under bare Node and
 * `tsx` where `import 'server-only'` throws. Bare Node is also why the sibling
 * import spells its extension.
 */

import { z } from 'zod';

import { SITE_IDS, type SiteId } from './site-ids.ts';

const siteIdSchema = z.enum(SITE_IDS);

/**
 * Which site this process is. Each app pins it in its `next.config.ts` and each
 * render script through `scripts/in-site.sh`, so an unset value means nobody
 * said — which would publish one site's copy under the other's domain, or walk
 * one site's collections against the other's `public/`, hence the throw. The
 * message names the variable because the reader is whoever misconfigured a
 * build, and zod's own text says only what the value was.
 */
export function resolveSiteId(): SiteId {
  const result = siteIdSchema.safeParse(process.env.NEXT_PUBLIC_SITE);

  if (!result.success) {
    throw new Error(
      `NEXT_PUBLIC_SITE must be one of ${SITE_IDS.join(', ')}, not ${String(process.env.NEXT_PUBLIC_SITE)}`,
    );
  }

  return result.data;
}
