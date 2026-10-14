#!/usr/bin/env node

/**
 * The deterministic half of `/reddit-digest`: prints, as JSON, what the digest
 * judges —
 *
 *   pnpm reddit:digest [--author vzakharov]
 *
 * - `settled`: the author's comments 48–72 h old, with their parent posts;
 * - `recent`: the same for the author's comments under 48 h old;
 * - `waiting`: unanswered replies to the author, in every thread the window's
 *   comments sit in;
 * - `readers`: Reddit-referred visits per site, per UTC day and per entry page,
 *   each page with the link comments pointing at it;
 * - `muthur`: its GitHub traffic from Reddit.
 *
 * Logs into Umami from `UMAMI_AGENT_PASSWORD` and keeps the token in memory:
 * written anywhere, it is a credential on disk.
 */

import { execFileSync } from 'node:child_process';
import { z } from 'zod';

import { pick } from '../src/shared/lib/collections.ts';
import { flag } from './lib/argv.ts';
import {
  attributeEntries,
  type Comment,
  commentSchema,
  flattenTree,
  isSettled,
  lagMinutes,
  OWN_HOSTS,
  ownLinks,
  type Post,
  postSchema,
  sumByKey,
  type ThreadComment,
  treeNodeSchema,
  unansweredReplies,
} from './lib/reddit-digest.ts';

const AUTHOR = flag('author') ?? 'vzakharov';
const ARCTIC = 'https://arctic-shift.photon-reddit.com/api';
const UMAMI = 'https://stats.vovazakharov.com/api';
const REDDIT_REFERRERS = [
  'reddit.com',
  'com.reddit.frontpage',
  'old.reddit.com',
] as const;
const HOUR = 3600;
const DAY = 24 * HOUR;

const now = Math.floor(Date.now() / 1000);
const windowStart = now - 3 * DAY;
const settledEnd = now - 2 * DAY;

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * `step` over `items` one at a time, in order. Arctic Shift answers a burst of
 * calls with its rate limit, so its calls never run side by side.
 */
async function inSequence<T, R>(
  items: readonly T[],
  step: (item: T) => Promise<R>,
): Promise<R[]> {
  const [first, ...rest] = items;
  if (first === undefined) return [];
  const head = await step(first);
  return [head, ...(await inSequence(rest, step))];
}

const arcticReply = z.union([
  z.object({ data: z.unknown(), error: z.null().optional() }),
  z.object({ data: z.null(), error: z.string() }),
]);

/**
 * Arctic Shift's rate limit answers within a second with a 422 `Timeout`,
 * which a pause clears; anything else is a real failure.
 */
async function arctic<T>(
  path: string,
  schema: z.ZodType<T>,
  attempt = 0,
): Promise<T> {
  const response = await fetch(`${ARCTIC}${path}`);
  const reply = arcticReply.parse(await response.json());
  if (reply.error === undefined || reply.error === null) {
    return schema.parse(reply.data);
  }
  if (!reply.error.startsWith('Timeout') || attempt >= 5) {
    throw new Error(`Arctic Shift ${path}: ${reply.error}`);
  }
  await sleep(2000 * 2 ** attempt);
  return arctic(path, schema, attempt + 1);
}

/** The author's comments since the window opened, newest first, a page at a time. */
async function recentComments(before = now): Promise<Comment[]> {
  const page = await arctic(
    `/comments/search?author=${AUTHOR}&after=${windowStart}&before=${before}&limit=100&sort=desc`,
    z.array(commentSchema),
  );
  const last = page.at(-1);
  return page.length < 100 || last === undefined
    ? page
    : [...page, ...(await recentComments(last.created_utc))];
}

async function posts(ids: readonly string[]): Promise<Map<string, Post>> {
  const fields = Object.keys(postSchema.shape).join(',');
  const batches = Array.from({ length: Math.ceil(ids.length / 100) }, (_, at) =>
    ids.slice(at * 100, at * 100 + 100).join(','),
  );
  const pages = await inSequence(batches, async (batch) =>
    arctic(`/posts/ids?ids=${batch}&fields=${fields}`, z.array(postSchema)),
  );
  return new Map(pages.flat().map((post) => [post.id, post]));
}

const thread = async (linkId: string): Promise<ThreadComment[]> =>
  flattenTree(
    await arctic(
      `/comments/tree?link_id=${linkId}&limit=9999`,
      z.array(treeNodeSchema),
    ),
  );

async function umamiLogin(): Promise<(path: string) => Promise<unknown>> {
  const password = process.env['UMAMI_AGENT_PASSWORD'];
  if (password === undefined) throw new Error('UMAMI_AGENT_PASSWORD is unset.');
  const login = await fetch(`${UMAMI}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'agent', password }),
  });
  if (!login.ok) throw new Error(`Umami login: HTTP ${login.status}`);
  const { token } = z.object({ token: z.string() }).parse(await login.json());
  return async (path) => {
    const response = await fetch(`${UMAMI}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Umami ${path}: HTTP ${response.status}`);
    const body: unknown = await response.json();
    return body;
  };
}

const metricRows = z.array(z.object({ x: z.string(), y: z.number() }));
const listOf = <T>(item: z.ZodType<T>) => z.object({ data: z.array(item) });

async function readers(comments: readonly Comment[]) {
  const umami = await umamiLogin();
  const { data: teams } = listOf(
    z.object({ id: z.string(), name: z.string() }),
  ).parse(await umami('/me/teams'));
  const team = teams.find(({ name }) => name === 'Sites');
  if (team === undefined) throw new Error('Umami has no team named "Sites".');
  const { data: websites } = listOf(
    z.object({ id: z.string(), domain: z.string() }),
  ).parse(await umami(`/teams/${team.id}/websites`));

  // Whole UTC days, so a day's count means the same on every run.
  const startAt = Math.floor(windowStart / DAY) * DAY * 1000;
  const endAt = now * 1000;
  const span = `startAt=${startAt}&endAt=${endAt}`;

  return Promise.all(
    websites.map(async ({ id, domain }) => {
      const perReferrer = await Promise.all(
        REDDIT_REFERRERS.map(async (referrer) => ({
          entries: metricRows.parse(
            await umami(
              `/websites/${id}/metrics?type=entry&${span}&referrer=${referrer}`,
            ),
          ),
          days: z
            .object({ sessions: metricRows })
            .parse(
              await umami(
                `/websites/${id}/pageviews?${span}&unit=day&timezone=UTC&referrer=${referrer}`,
              ),
            ).sessions,
        })),
      );
      const entries = [
        ...sumByKey(perReferrer.flatMap((counts) => counts.entries)),
      ].map(([landing, visits]) => ({ landing, visits }));
      const host = OWN_HOSTS.find((own) => own === domain);
      return {
        site: domain,
        days: Object.fromEntries(
          [...sumByKey(perReferrer.flatMap(({ days }) => days))].map(
            ([day, visits]) => [day.slice(0, 10), visits],
          ),
        ),
        entries:
          host === undefined
            ? entries.map((entry) => ({ ...entry, comments: [] }))
            : attributeEntries(host, entries, comments),
      };
    }),
  );
}

function gh(path: string): unknown {
  return JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));
}

function muthur() {
  const referrers = z
    .array(
      z.object({
        referrer: z.string(),
        count: z.number(),
        uniques: z.number(),
      }),
    )
    .parse(gh('repos/vzakharov/muthur/traffic/popular/referrers'));
  const views = z
    .object({
      views: z.array(
        z.object({
          timestamp: z.string(),
          count: z.number(),
          uniques: z.number(),
        }),
      ),
    })
    .parse(gh('repos/vzakharov/muthur/traffic/views')).views;
  return {
    // GitHub reports the last 14 days and names Reddit's app and site apart.
    reddit14d: referrers.filter(({ referrer }) => referrer.includes('reddit')),
    views: views
      .filter(
        ({ timestamp }) => Date.parse(timestamp) / 1000 >= windowStart - DAY,
      )
      .map(({ timestamp, count, uniques }) => ({
        day: timestamp.slice(0, 10),
        count,
        uniques,
      })),
  };
}

const iso = (seconds: number) => new Date(seconds * 1000).toISOString();
/** A comment's `link_id` is its post's id behind Reddit's `t3_` kind prefix. */
const postId = (linkId: string) => linkId.replace(/^t3_/, '');
const redditUrl = (permalink: string) => `https://reddit.com${permalink}`;

const comments = await recentComments();
const linkIds = [...new Set(comments.map(({ link_id }) => link_id))];
const parents = await posts(linkIds.map((linkId) => postId(linkId)));

const threads = new Map(
  await inSequence(
    linkIds,
    async (linkId) => [linkId, await thread(linkId)] as const,
  ),
);

function postSummary({ title, author, score, num_comments }: Post) {
  return {
    title,
    author,
    score,
    comments: num_comments,
    ownPost: author === AUTHOR,
  };
}

function row(comment: Comment) {
  const { id, subreddit, score, body, permalink, created_utc, link_id } =
    comment;
  const post = parents.get(postId(link_id));
  const placed = threads.get(link_id)?.find((c) => c.id === id);
  return {
    id,
    url: redditUrl(permalink),
    subreddit,
    created: iso(created_utc),
    score,
    settled: isSettled(comment),
    nesting: placed?.nesting ?? null,
    lagMinutes: post === undefined ? null : lagMinutes(comment, post),
    links: ownLinks(body),
    body,
    post: post === undefined ? null : postSummary(post),
  };
}

const waiting = [...threads.values()].flatMap((inThread) =>
  unansweredReplies(inThread, AUTHOR).map(({ to, reply }) => {
    const { id, author, score, permalink, body, created_utc } = reply;
    return {
      to: pick(to, 'id', 'body'),
      reply: {
        id,
        author,
        created: iso(created_utc),
        score,
        url: redditUrl(permalink),
        body,
      },
    };
  }),
);

const report = {
  author: AUTHOR,
  generated: iso(now),
  window: { from: iso(windowStart), settledUntil: iso(settledEnd) },
  settled: comments
    .filter(({ created_utc }) => created_utc < settledEnd)
    .map((comment) => row(comment)),
  recent: comments
    .filter(({ created_utc }) => created_utc >= settledEnd)
    .map((comment) => row(comment)),
  waiting,
  readers: await readers(comments),
  muthur: muthur(),
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
