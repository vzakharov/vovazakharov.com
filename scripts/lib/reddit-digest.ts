/**
 * The pure half of `pnpm reddit:digest`: the Arctic Shift row shapes, and what
 * the digest derives from them without the network.
 */

import { z } from 'zod';

/** The hosts whose links count as the operator sending readers somewhere. */
export const OWN_HOSTS = [
  'vovazakharov.com',
  'latestageagentic.com',
  'agentic.bible',
  'basilisk.fyi',
  'github.com/vzakharov/muthur',
] as const;

export type OwnHost = (typeof OWN_HOSTS)[number];

const commentFields = {
  id: z.string(),
  author: z.string(),
  body: z.string(),
  created_utc: z.number(),
  link_id: z.string(),
  parent_id: z.string(),
  score: z.number(),
  subreddit: z.string(),
  permalink: z.string(),
  // Present once Arctic Shift re-fetched the row, which is when its score
  // stops reading near zero.
  _meta: z.object({ retrieved_2nd_on: z.number().optional() }).optional(),
};

export const commentSchema = z.object(commentFields);
export type Comment = z.infer<typeof commentSchema>;

export const postSchema = z.object({
  id: z.string(),
  author: z.string(),
  title: z.string(),
  created_utc: z.number(),
  subreddit: z.string(),
  score: z.number(),
  num_comments: z.number(),
});
export type Post = z.infer<typeof postSchema>;

/** A `/api/comments/tree` node: a comment whose `replies` is `""` or a listing. */
export type TreeNode =
  | { kind: 't1'; data: Comment & { replies: string | TreeListing } }
  | { kind: 'more'; data: unknown };

type TreeListing = { data: { children: TreeNode[] } };

export const treeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('t1'),
      data: z.object({
        ...commentFields,
        replies: z.union([
          z.string(),
          z.object({ data: z.object({ children: z.array(treeNodeSchema) }) }),
        ]),
      }),
    }),
    z.object({ kind: z.literal('more'), data: z.unknown() }),
  ]),
);

/** A thread's comments in tree order, each with how deep it nests (0 = top level). */
export type ThreadComment = Comment & { nesting: number };

export function flattenTree(nodes: readonly TreeNode[]): ThreadComment[] {
  const walk = (level: readonly TreeNode[], nesting: number): ThreadComment[] =>
    level.flatMap((node) => {
      if (node.kind !== 't1') return [];
      const { replies, ...comment } = node.data;
      const children =
        typeof replies === 'string'
          ? []
          : walk(replies.data.children, nesting + 1);
      return [{ ...comment, nesting }, ...children];
    });
  return walk(nodes, 0);
}

/** Minutes between the post going up and the comment under it. */
export const lagMinutes = (comment: Comment, post: Post): number =>
  Math.round((comment.created_utc - post.created_utc) / 60);

export const isSettled = (comment: Comment): boolean =>
  comment._meta?.retrieved_2nd_on !== undefined;

/** The page a reader lands on, as Umami names an entry page: `/web-not-cli`, `/`. */
type Landing = { landing: string };

export type OwnLink = Landing & { host: OwnHost };

const LINK = /https?:\/\/(?:www\.)?([^\s"')>\]]+)/g;

/**
 * Links in a comment body that point at the operator's own sites or muthur,
 * each as its host and the page it lands on — with no query, fragment or trailing slash.
 */
export function ownLinks(body: string): OwnLink[] {
  return [...body.matchAll(LINK)].flatMap(([, rest = '']) => {
    const host = OWN_HOSTS.find(
      (own) => rest === own || rest.startsWith(`${own}/`),
    );
    if (host === undefined) return [];
    const tail = rest.slice(host.length).split(/[#?]/)[0] ?? '';
    const landing = tail.replace(/[!,.:;]+$/, '').replace(/\/+$/, '');
    return [{ host, landing: landing === '' ? '/' : landing }];
  });
}

export type WaitingReply = { to: ThreadComment; reply: ThreadComment };

/**
 * Replies to the author's comments, by someone else, that the author has not
 * answered under. A deleted reply asks for nothing.
 */
export function unansweredReplies(
  thread: readonly ThreadComment[],
  author: string,
): WaitingReply[] {
  const byId = new Map(thread.map((comment) => [`t1_${comment.id}`, comment]));
  const answered = new Set(
    thread
      .filter((comment) => comment.author === author)
      .map((comment) => comment.parent_id),
  );
  return thread.flatMap((reply) => {
    const to = byId.get(reply.parent_id);
    const waits =
      to?.author === author &&
      reply.author !== author &&
      reply.author !== '[deleted]' &&
      !answered.has(`t1_${reply.id}`);
    return waits ? [{ to, reply }] : [];
  });
}

export type EntryCount = Landing & { visits: number };

export type AttributedEntry = EntryCount & {
  /** The link comments pointing at this page, by id. */
  comments: string[];
};

/** Each entry page with the operator's link comments that point at it. */
export function attributeEntries(
  host: OwnHost,
  entries: readonly EntryCount[],
  comments: readonly Comment[],
): AttributedEntry[] {
  return entries.map((entry) => ({
    ...entry,
    comments: comments
      .filter((comment) =>
        ownLinks(comment.body).some(
          (link) => link.host === host && link.landing === entry.landing,
        ),
      )
      .map((comment) => comment.id),
  }));
}

export function sumByKey(
  rows: ReadonlyArray<{ x: string; y: number }>,
): Map<string, number> {
  const sums = new Map<string, number>();
  for (const { x, y } of rows) sums.set(x, (sums.get(x) ?? 0) + y);
  return sums;
}
