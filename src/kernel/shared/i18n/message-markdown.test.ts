import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';

import { MESSAGE_MARKDOWN } from './message-markdown';

/** What a message renders to, as the page would serve it. */
function render(copy: string): string {
  return renderToStaticMarkup(createElement(Markdown, MESSAGE_MARKDOWN, copy));
}

describe('a message: what it renders', () => {
  it('leaves a plain string as its own text, with no block wrapper', () => {
    assert.equal(render('no emphasis here'), 'no emphasis here');
  });

  it('renders emphasis inside running text', () => {
    assert.equal(
      render('I **do not** buy buzzwords'),
      'I <strong>do not</strong> buy buzzwords',
    );
  });

  it('renders several emphasized runs in one string', () => {
    assert.equal(
      render('**a** and **b**'),
      '<strong>a</strong> and <strong>b</strong>',
    );
  });

  it('renders emphasis that is the whole message', () => {
    assert.equal(render('**250,000 lines**'), '<strong>250,000 lines</strong>');
  });

  it('leaves an apostrophe as authored, rather than curling it', () => {
    // `&#x27;` is React's serializer, not the parser: no smart-quote pass runs,
    // so the character the catalogue holds is the character rendered.
    assert.equal(
      render("I **don't** buy them"),
      'I <strong>don&#x27;t</strong> buy them',
    );
  });
});

describe('a message: what it refuses', () => {
  it('throws on a link rather than dropping it to plain text', () => {
    assert.throws(
      () => render('deeper [than most](https://example.com)'),
      /Unsupported markup <a>/,
    );
  });

  it('throws on a heading', () => {
    assert.throws(() => render('## a heading'), /Unsupported markup <h2>/);
  });

  it('throws on an image', () => {
    assert.throws(
      () => render('look ![alt](https://example.com/a.png)'),
      /Unsupported markup <img>/,
    );
  });

  it('throws on single-asterisk emphasis, which the sheet has no style for', () => {
    assert.throws(() => render('an *aside*'), /Unsupported markup <em>/);
  });

  it('throws on an unpaired run rather than printing its asterisks', () => {
    assert.throws(() => render('an **unclosed run'), /Unpaired `\*\*`/);
  });
});
