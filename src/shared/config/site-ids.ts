/**
 * Apart from `site-config.ts` because nothing here runs at module load, and its
 * readers include `shared/content/collections.ts` and the render scripts under
 * it — bare Node, and one of them with no `NEXT_PUBLIC_SITE` set at all, where
 * that module's throw would fire before anything asked it anything.
 */

/** The ids are the source of truth: each names a directory under `apps/`. */
export const SITE_IDS = ['vova', 'lsa'] as const;

export type SiteId = (typeof SITE_IDS)[number];

export type WithSiteId = { site: SiteId };

/**
 * Which site this process is. Each app pins it in its `next.config.ts` and each
 * render script in its `package.json` entry, so an unset value means nobody
 * said — which would publish one site's copy under the other's domain, or walk
 * one site's collections against the other's `public/`, hence the throw.
 *
 * Matched against the ids rather than parsed by a `z.enum`, which is what the
 * repo asks for at a boundary. Client components reach this through
 * `site-config` (the CV sheet, through `cv-urls`), so a parse here is zod in
 * the browser: measured at +377 kB, half again the whole client bundle.
 */
export function resolveSiteId(): SiteId {
  const site = SITE_IDS.find((id) => id === process.env.NEXT_PUBLIC_SITE);

  if (site === undefined) {
    throw new Error(
      `NEXT_PUBLIC_SITE must be one of ${SITE_IDS.join(', ')}, not ${String(process.env.NEXT_PUBLIC_SITE)}`,
    );
  }

  return site;
}
