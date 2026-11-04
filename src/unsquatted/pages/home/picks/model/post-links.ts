import 'server-only';

import { pick } from '@/kernel/shared/lib/collections';
import { errorClass } from '@/kernel/shared/lib/error-class';

import {
  listPrimaryDocuments,
  listWrittenDocuments,
} from '@/blog/shared/content';

import {
  type Occasion,
  postDomains,
  postPickProblems,
  POSTS,
} from '@/unsquatted/shared/content';

import { POSTED_PICKS, type ShownName } from './picks';

const PostPicksError = errorClass('PostPicksError');

/** Where a name picked for a post links, and the occasion its stamp prints. */
export type PostLink = { href: string; occasion: Occasion };

/** A shown name, with its post's link once that post is out. */
export type LinkedName = ShownName & { postLink?: PostLink };

/**
 * Fails the build where a post and the catalogue disagree about which names
 * the post picked — embargoed posts included, so a post's day never brings a
 * failure nobody is there to see.
 */
async function assertPostsAgree(): Promise<void> {
  const written = listWrittenDocuments(POSTS).filter(({ variant }) => !variant);
  const listed = new Map(
    await Promise.all(
      written.map(
        async (document) =>
          [document.slug, await postDomains(document)] as const,
      ),
    ),
  );
  const problems = postPickProblems(listed, POSTED_PICKS);

  if (problems.length > 0) {
    throw new PostPicksError(
      `The posts and picks.yaml disagree:\n${problems.join('\n')}`,
    );
  }
}

/**
 * `picks` with each name a post picked linked to that post; a name whose post
 * is not out yet is left off, as the post itself is.
 */
export async function linkedPicks(
  picks: readonly ShownName[],
): Promise<LinkedName[]> {
  await assertPostsAgree();
  const links = new Map(
    listPrimaryDocuments(POSTS).map(
      ({ slug, route, frontmatter }) =>
        [slug, { href: route, ...pick(frontmatter, 'occasion') }] as const,
    ),
  );

  return picks.flatMap((name) => {
    if (name.post === undefined) return [name];
    const postLink = links.get(name.post);

    return postLink === undefined ? [] : [{ ...name, postLink }];
  });
}
