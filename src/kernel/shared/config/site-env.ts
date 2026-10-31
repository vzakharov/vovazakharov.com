/**
 * The raw environment read, kept apart from `resolved-site.ts` so a script can
 * reach it through `index.node-safe.ts`, outside any bundler.
 */

import { oneOf } from '../lib/collections.ts';
import { SITE_IDS, type SiteId } from './site-ids.ts';

/**
 * Which site this process is. Each app pins it in its `next.config.ts` and each
 * render script through `scripts/in-site.sh`, so an unset value means nobody
 * said — which would publish one site's copy under the other's domain, or walk
 * one site's collections against the other's `public/`, hence the throw.
 */
export function resolveSiteId(): SiteId {
  return oneOf(SITE_IDS, process.env.NEXT_PUBLIC_SITE);
}
