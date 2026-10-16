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

  it('carries the body in content:encoded, whatever its text', () => {
    const rss = renderRss({
      ...channel,
      items: [
        {
          title: 'Body',
          link: 'https://example.com/body',
          description: 'blurb',
          published: PUBLISHED,
          content: '<p>a ]]> b</p>',
        },
      ],
    });

    assert.match(
      rss,
      /xmlns:content="http:\/\/purl\.org\/rss\/1\.0\/modules\/content\/"/,
    );
    assert.match(rss, /<description>blurb<\/description>/);
    assert.match(
      rss,
      /<content:encoded><!\[CDATA\[<p>a ]]]]><!\[CDATA\[> b<\/p>]]><\/content:encoded>/,
    );
  });

  it('makes the feed a podcast where the channel states one', () => {
    const rss = renderRss({
      ...channel,
      podcast: {
        owner: { name: 'A & B', email: 'a@example.com' },
        image: 'https://example.com/cover.jpg',
        category: 'Music',
      },
      items: [
        {
          title: 'Clean',
          link: 'https://example.com/clean',
          published: PUBLISHED,
          episode: {
            enclosure: { url: 'https://example.com/a b.mp3', bytes: 1234 },
            seconds: 201,
            explicit: false,
            image: 'https://example.com/clean.jpg',
          },
        },
        {
          title: 'Rude',
          link: 'https://example.com/rude',
          published: PUBLISHED,
          episode: {
            enclosure: { url: 'https://example.com/r.mp3', bytes: 5 },
            seconds: 60,
            explicit: true,
          },
        },
      ],
    });

    assert.match(
      rss,
      /xmlns:itunes="http:\/\/www\.itunes\.com\/dtds\/podcast-1\.0\.dtd"/,
    );
    assert.match(
      rss,
      /<itunes:owner><itunes:name>A &amp; B<\/itunes:name><itunes:email>a@example\.com<\/itunes:email><\/itunes:owner>/,
    );
    assert.match(rss, /<itunes:category text="Music"\/>/);
    assert.match(
      rss,
      /<itunes:explicit>true<\/itunes:explicit>\n<itunes:type>/,
    );
    assert.match(
      rss,
      /<enclosure url="https:\/\/example\.com\/a b\.mp3" length="1234" type="audio\/mpeg"\/><itunes:duration>201<\/itunes:duration><itunes:explicit>false<\/itunes:explicit><itunes:image href="https:\/\/example\.com\/clean\.jpg"\/>/,
    );
  });

  it('declares no itunes namespace on a plain feed', () => {
    assert.doesNotMatch(renderRss({ ...channel, items: [] }), /itunes/);
  });

  it('leaves the build date out of an empty feed', () => {
    assert.doesNotMatch(renderRss({ ...channel, items: [] }), /lastBuildDate/);
  });
});
