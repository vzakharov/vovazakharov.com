/**
 * Apart from `site-ids.ts` because it carries zod, and apart from
 * `resolved-site.ts` because it carries no `server-only`: the render scripts
 * import it by path, from bare Node and from `tsx`, neither of which is a React
 * server bundle. Nothing a client bundle reaches imports it, which is what
 * makes the parse affordable — inlined into `site-ids.ts` it put zod in the
 * browser through `site-config` and the CV sheet, measured at +377 kB. Bare
 * Node is also why the sibling import spells its extension.
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
