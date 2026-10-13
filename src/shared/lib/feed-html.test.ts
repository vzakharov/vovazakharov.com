import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Element, Root } from 'hast';

import { feedHtml } from './feed-html';

const siteUrl = (path: string) => `https://example.com${path}`;

function element(
  tagName: string,
  properties: Element['properties'],
  children: Element['children'] = [],
): Element {
  return { type: 'element', tagName, properties, children };
}

const tree: Root = {
  type: 'root',
  children: [
    element('p', {}, [
      element('a', { href: '/music/songs/slime' }, [
        { type: 'text', value: 'here' },
      ]),
      element('a', { href: 'https://suno.com/s/x' }, [
        { type: 'text', value: 'there' },
      ]),
    ]),
    element('img', { src: '/a.png', srcSet: '/a.png 1x, /a@2x.png 2x' }),
    element('aside', { ariaHidden: 'true' }, [
      { type: 'text', value: 'twice' },
    ]),
  ],
};

describe('feedHtml', () => {
  const html = feedHtml(tree, siteUrl);

  it('makes site-root URLs absolute and leaves the rest', () => {
    assert.match(html, /href="https:\/\/example\.com\/music\/songs\/slime"/);
    assert.match(html, /href="https:\/\/suno\.com\/s\/x"/);
    assert.match(html, /src="https:\/\/example\.com\/a\.png"/);
    assert.match(
      html,
      /srcset="https:\/\/example\.com\/a\.png 1x, https:\/\/example\.com\/a@2x\.png 2x"/,
    );
  });

  it('drops what the page hides as a repeat', () => {
    assert.doesNotMatch(html, /twice/);
  });

  it('leaves the tree it was given untouched', () => {
    assert.match(JSON.stringify(tree), /"href":"\/music\/songs\/slime"/);
  });
});
