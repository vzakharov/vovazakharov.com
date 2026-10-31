/**
 * Data only, and deliberately so: this is the part of the site configuration
 * every bundle holds — the scripts read it through
 * `shared/content/collections.ts`, client components through `@/kernel/shared/config`
 * — so anything added here costs all of them. The environment read sits in
 * `site-env.ts` for that reason.
 */

/** The ids are the source of truth: each names a directory under `sites/`. */
export const SITE_IDS = [
  'vova',
  'lsa',
  'bible',
  'basilisk',
  'maya',
  'unsquatted',
] as const;

export type SiteId = (typeof SITE_IDS)[number];

export type WithSiteId = { site: SiteId };
