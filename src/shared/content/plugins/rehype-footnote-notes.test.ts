import { toHtml } from 'hast-util-to-html';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { rehypeFootnoteNotes } from './rehype-footnote-notes.ts';

async function render(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeFootnoteNotes, { fileName: 'song.md' });

  return toHtml(await processor.run(processor.parse(markdown)));
}

describe('rehypeFootnoteNotes', () => {
  it('hangs a note off the bracketed phrase, marks kept', async () => {
    const html = await render(
      'Had it [ended up as *Tarkos*][^tarkos] after all.\n\n[^tarkos]: The cover it never got.\n',
    );

    assert.ok(
      html.startsWith(
        '<p>Had it <span data-content-note="tarkos"><span>ended up as <em>Tarkos</em></span><span><span class="content-note-paragraph">The cover it never got.</span></span></span><sup class="content-note-ref">',
      ),
    );
    assert.match(html, /<\/sup> after all\.<\/p>/);
  });

  it('leaves a bare reference a footnote, on screen too', async () => {
    const html = await render('A line.[^bare]\n\n[^bare]: Said.\n');

    assert.doesNotMatch(html, /data-content-note|content-note-/);
  });

  it('hides from screen only what a popover carries, and keeps the numbers', async () => {
    const html = await render(
      'One [phrase][^a] and a bare[^b].\n\n[^a]: First.\n\n[^b]: Second.\n',
    );

    assert.match(html, /<li id="user-content-fn-a" value="1" class="content-note-definition">/);
    assert.match(html, /<li id="user-content-fn-b" value="2">/);
    assert.doesNotMatch(html, /content-notes-printed/);
  });

  it('hides the whole list when every note is a popover', async () => {
    const html = await render('One [phrase][^a].\n\n[^a]: First.\n');

    assert.match(html, /<section data-footnotes="" class="footnotes content-notes-printed">/);
  });

  it('carries an image, one paragraph to a span', async () => {
    const html = await render(
      'One [phrase][^a].\n\n[^a]: First.\n\n    ![Cover](./cover.jpg)\n',
    );

    assert.match(
      html,
      /<span class="content-note-paragraph">First\.<\/span><span class="content-note-paragraph"><img src="\.\/cover\.jpg" alt="Cover"><\/span>/,
    );
  });

  it('fails a note holding a block a paragraph cannot', async () => {
    await assert.rejects(
      render('One [phrase][^a].\n\n[^a]: First.\n\n    - a list\n'),
      /song\.md: the note \[\^a] holds a <ul>/,
    );
  });
});
