/**
 * Data only, and deliberately so: this is the part of the site configuration
 * every bundle holds — bare Node reads it through
 * `shared/content/collections.ts`, client components through `@/shared/config`
 * — so anything added here costs all of them. The environment read and its
 * schema sit in `site.env.unsafe.ts` for that reason.
 */

/** The ids are the source of truth: each names a directory under `apps/`. */
export const SITE_IDS = ['vova', 'lsa', 'bible'] as const;

export type SiteId = (typeof SITE_IDS)[number];

export type WithSiteId = { site: SiteId };
