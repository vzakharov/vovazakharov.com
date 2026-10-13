import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EXCERPT_LENGTH, plainText, songExcerpt } from './song-excerpt';

describe('plainText', () => {
  it('keeps the words and drops the marks', () => {
    assert.equal(
      plainText('Some *emphasis*, a [link](./x) and `code`.'),
      'Some emphasis, a link and code.',
    );
  });

  it('runs paragraphs together and leaves notes, images and markup out', () => {
    assert.equal(
      plainText(
        'One.[^a]\n\n![art](./a.jpg)\n\n<div>raw</div>\n\nTwo.\n\n[^a]: A note.',
      ),
      'One. Two.',
    );
  });
});

describe('songExcerpt', () => {
  it('gives a short story whole', () => {
    assert.equal(songExcerpt('A short story.'), 'A short story.');
  });

  it('cuts a long story at the first word past the length', () => {
    const story = Array.from({ length: 200 }, () => 'word').join(' ');
    const excerpt = songExcerpt(story) ?? '';

    assert.ok(excerpt.length > EXCERPT_LENGTH);
    assert.ok(excerpt.length < EXCERPT_LENGTH + 'word '.length);
    assert.ok(story.startsWith(excerpt));
    assert.ok(excerpt.endsWith('word'));
  });

  it('gives nothing for a story with no words', () => {
    assert.equal(songExcerpt(''), undefined);
    assert.equal(songExcerpt('![art](./a.jpg)'), undefined);
  });
});
