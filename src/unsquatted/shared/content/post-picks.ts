/**
 * No `import 'server-only'`: a pure check the suite runs outside any bundler.
 */

type PostedPick = { domain: string; post: string };

/**
 * Where the posts and the catalogue disagree about which names a post picked:
 * a domain a post's widget lists that is no pick of that post, a pick naming a
 * post that is not written, and a pick its post does not list. `listed` maps
 * each written post's slug to the domains its `domains` widgets list. Empty
 * when they agree.
 */
export function postPickProblems(
  listed: ReadonlyMap<string, readonly string[]>,
  picked: readonly PostedPick[],
): string[] {
  const pickedFor = (slug: string) =>
    new Set(
      picked.filter(({ post }) => post === slug).map(({ domain }) => domain),
    );

  return [
    ...[...listed].flatMap(([slug, domains]) => {
      const own = pickedFor(slug);

      return domains
        .filter((domain) => !own.has(domain))
        .map((domain) => `${slug} lists ${domain}, which is no pick of it`);
    }),
    ...picked.flatMap(({ domain, post }) => {
      const domains = listed.get(post);

      if (domains === undefined) {
        return [`${domain} is picked for ${post}, which is no post`];
      }

      return domains.includes(domain)
        ? []
        : [`${domain} is picked for ${post}, which does not list it`];
    }),
  ];
}
