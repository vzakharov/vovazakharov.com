import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  attributeEntries,
  type Comment,
  flattenTree,
  isSettled,
  lagMinutes,
  ownLinks,
  sumByKey,
  type ThreadComment,
  type TreeNode,
  unansweredReplies,
} from './reddit-digest.ts';

const comment = (
  id: string,
  author: string,
  parent: string,
  extra: Partial<Comment> = {},
): Comment => ({
  id,
  author,
  body: '',
  created_utc: 1_000_000,
  link_id: 't3_post',
  parent_id: parent,
  score: 1,
  subreddit: 'ClaudeCode',
  permalink: `/r/ClaudeCode/comments/post/x/${id}/`,
  ...extra,
});

const node = (c: Comment, ...children: TreeNode[]): TreeNode => ({
  kind: 't1',
  data: {
    ...c,
    replies: children.length === 0 ? '' : { data: { children } },
  },
});

const inThread = (c: Comment, nesting = 0): ThreadComment => ({
  ...c,
  nesting,
});

describe('flattenTree', () => {
  it('lists comments in tree order with how deep each nests, skipping "more" stubs', () => {
    const flat = flattenTree([
      node(
        comment('a', 'x', 't3_post'),
        node(comment('b', 'y', 't1_a'), node(comment('c', 'x', 't1_b'))),
      ),
      { kind: 'more', data: { count: 3 } },
      node(comment('d', 'z', 't3_post')),
    ]);
    assert.deepEqual(
      flat.map(({ id, nesting }) => [id, nesting]),
      [
        ['a', 0],
        ['b', 1],
        ['c', 2],
        ['d', 0],
      ],
    );
    assert.equal('replies' in (flat[0] ?? {}), false);
  });
});

describe('lagMinutes', () => {
  it('rounds the gap between post and comment to minutes', () => {
    const post = {
      id: 'post',
      author: 'op',
      title: 'T',
      created_utc: 1_000_000 - 3630,
      subreddit: 'ClaudeCode',
      score: 1,
      num_comments: 1,
    };
    assert.equal(lagMinutes(comment('a', 'x', 't3_post'), post), 61);
  });
});

describe('isSettled', () => {
  it('holds once Arctic Shift has fetched the row a second time', () => {
    assert.equal(isSettled(comment('a', 'x', 't3_post')), false);
    assert.equal(
      isSettled(
        comment('a', 'x', 't3_post', { _meta: { retrieved_2nd_on: 2 } }),
      ),
      true,
    );
  });
});

describe('ownLinks', () => {
  it('finds own-site links as host and entry path', () => {
    assert.deepEqual(
      ownLinks(
        'See https://agentic.bible/web-not-cli. Also [muthur](https://github.com/vzakharov/muthur/blob/main/x.md#top) and https://www.basilisk.fyi/?ref=r',
      ),
      [
        { host: 'agentic.bible', landing: '/web-not-cli' },
        { host: 'github.com/vzakharov/muthur', landing: '/blob/main/x.md' },
        { host: 'basilisk.fyi', landing: '/' },
      ],
    );
  });

  it('ignores other hosts, including one that only starts like ours', () => {
    assert.deepEqual(
      ownLinks('https://example.com/a https://agentic.bible.evil.io/x'),
      [],
    );
  });
});

describe('unansweredReplies', () => {
  const thread = [
    inThread(comment('mine', 'me', 't3_post')),
    inThread(comment('answered', 'them', 't1_mine'), 1),
    inThread(comment('back', 'me', 't1_answered'), 2),
    inThread(comment('open', 'them', 't1_mine'), 1),
    inThread(comment('gone', '[deleted]', 't1_mine'), 1),
    inThread(comment('aside', 'them', 't1_open'), 2),
  ];

  it('returns replies to the author that the author has not answered', () => {
    assert.deepEqual(
      unansweredReplies(thread, 'me').map(({ to, reply }) => [to.id, reply.id]),
      [['mine', 'open']],
    );
  });

  it('counts a reply to someone else as nobody waiting on the author', () => {
    assert.equal(
      unansweredReplies(thread, 'me').some(({ reply }) => reply.id === 'aside'),
      false,
    );
  });
});

describe('attributeEntries', () => {
  it('pairs each entry page with the comments linking to it on that host', () => {
    const comments = [
      comment('a', 'me', 't3_post', {
        body: 'https://agentic.bible/web-not-cli',
      }),
      comment('b', 'me', 't3_post', {
        body: 'https://basilisk.fyi/web-not-cli',
      }),
    ];
    assert.deepEqual(
      attributeEntries(
        'agentic.bible',
        [
          { landing: '/web-not-cli', visits: 5 },
          { landing: '/', visits: 2 },
        ],
        comments,
      ),
      [
        { landing: '/web-not-cli', visits: 5, comments: ['a'] },
        { landing: '/', visits: 2, comments: [] },
      ],
    );
  });
});

describe('sumByKey', () => {
  it('adds up counts reported under the same key', () => {
    assert.deepEqual(
      [
        ...sumByKey([
          { x: '/a', y: 2 },
          { x: '/b', y: 1 },
          { x: '/a', y: 3 },
        ]),
      ],
      [
        ['/a', 5],
        ['/b', 1],
      ],
    );
  });
});
