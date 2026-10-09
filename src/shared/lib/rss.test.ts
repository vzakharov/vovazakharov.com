import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renderRss } from './rss';

const PUBLISHED = new Date('2026-08-23T00:00:00Z');

const channel = {
  title: 'Songs & <stuff>',
  link: 'https://example.com/music',
  description: 'Don’t "quote" me',
  language: 'en',
  self: 'https://example.com/music/feed.xml',
};

describe('renderRss', () => {
  it('escapes markup in every text field', () => {
    const rss = renderRss({
      ...channel,
      items: [
        {
          title: 'A < B',
          link: 'https://example.com/a?x=1&y=2',
          description: "it's",
          published: PUBLISHED,
        },
      ],
    });

    assert.match(rss, /<title>Songs &amp; &lt;stuff&gt;<\/title>/);
    assert.match(rss, /<description>Don’t &quot;quote&quot; me<\/description>/);
    assert.match(rss, /<link>https:\/\/example\.com\/a\?x=1&amp;y=2<\/link>/);
    assert.match(rss, /<description>it&apos;s<\/description>/);
  });

  it('dates the build by its newest item, not the clock', () => {
    const rss = renderRss({
      ...channel,
      items: [
        {
          title: 'New',
          link: 'https://example.com/new',
          description: 'n',
          published: PUBLISHED,
        },
        {
          title: 'Old',
          link: 'https://example.com/old',
          description: 'o',
          published: new Date('2026-01-01T00:00:00Z'),
        },
      ],
    });

    assert.match(
      rss,
      /<lastBuildDate>Sun, 23 Aug 2026 00:00:00 GMT<\/lastBuildDate>/,
    );
    assert.match(
      rss,
      /<guid isPermaLink="true">https:\/\/example\.com\/new<\/guid>/,
    );
  });

  it('leaves the build date out of an empty feed', () => {
    assert.doesNotMatch(renderRss({ ...channel, items: [] }), /lastBuildDate/);
  });
});
