/**
 * Data only, and deliberately so: this is the part of the site configuration
 * every bundle holds — bare Node reads it through
 * `shared/content/collections.ts`, client components through `@/kernel/shared/config`
 * — so anything added here costs all of them. The environment read sits in
 * `site-env.ts` for that reason.
 */

/**
 * The ids are the source of truth, and each is its site's domain: the
 * directory under `sites/`, the host its `url` is built on, and what
 * `NEXT_PUBLIC_SITE` holds.
 */
export const SITE_IDS = [
  'vovazakharov.com',
  'latestageagentic.com',
  'agentic.bible',
  'basilisk.fyi',
] as const;

export type SiteId = (typeof SITE_IDS)[number];

export type WithSiteId = { site: SiteId };
