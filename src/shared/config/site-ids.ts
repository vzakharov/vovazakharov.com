/**
 * Data only, and deliberately so: this module is the one part of the site
 * configuration every bundle may hold. `shared/content/collections.ts` and the
 * render scripts under it read it from bare Node, and client components reach
 * it through `@/shared/config`, so anything here costs every one of them —
 * which is why the environment read and its schema sit in `resolve-site-id.ts`.
 */

/** The ids are the source of truth: each names a directory under `apps/`. */
export const SITE_IDS = ['vova', 'lsa'] as const;

export type SiteId = (typeof SITE_IDS)[number];

export type WithSiteId = { site: SiteId };
