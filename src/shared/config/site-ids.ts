/**
 * Split out of `site-config.ts` because that module throws on an unset
 * `NEXT_PUBLIC_SITE`, and `shared/content/collections.ts` — which names the site
 * that serves each collection — runs under bare Node from the render scripts,
 * one of which sets no such variable. Constants cannot throw at module load.
 */

/** The ids are the source of truth: each names a directory under `apps/`. */
export const SITE_IDS = ['vova', 'lsa'] as const;

export type SiteId = (typeof SITE_IDS)[number];

export type WithSiteId = { site: SiteId };
