import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { linkRuns, type Run } from './links.ts';

const joined = (runs: Run[]): string =>
  runs.map((run) => (run.kind === 'text' ? run.text : run.href)).join('');

describe('linkRuns', () => {
  it('leaves text with no URL as one run, and empty text as none', () => {
    assert.deepEqual(linkRuns('no links here'), [
      { kind: 'text', text: 'no links here' },
    ]);
    assert.deepEqual(linkRuns(''), []);
  });

  it('splits URLs out of the text around them', () => {
    assert.deepEqual(linkRuns('see https://a.b/c?d=1#e and http://x.y'), [
      { kind: 'text', text: 'see ' },
      { kind: 'link', href: 'https://a.b/c?d=1#e' },
      { kind: 'text', text: ' and ' },
      { kind: 'link', href: 'http://x.y' },
    ]);
  });

  it('gives a sentence its closing punctuation back', () => {
    assert.deepEqual(linkRuns('at https://a.b/c.\nNext: «https://x.y/z»'), [
      { kind: 'text', text: 'at ' },
      { kind: 'link', href: 'https://a.b/c' },
      { kind: 'text', text: '.\nNext: «' },
      { kind: 'link', href: 'https://x.y/z' },
      { kind: 'text', text: '»' },
    ]);
  });

  it('keeps a bracket the URL opened and drops one it did not', () => {
    assert.deepEqual(linkRuns('(https://w.org/Fog_(film))'), [
      { kind: 'text', text: '(' },
      { kind: 'link', href: 'https://w.org/Fog_(film)' },
      { kind: 'text', text: ')' },
    ]);
  });

  it('leaves a bare scheme as text', () => {
    assert.deepEqual(linkRuns('https:// alone'), [
      { kind: 'text', text: 'https:// alone' },
    ]);
  });

  it('joins back to the text it came from', () => {
    const text =
      'Video: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P/very/long/path?x=1, then (https://a.b).';
    assert.equal(joined(linkRuns(text)), text);
  });
});
