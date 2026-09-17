import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isValidElement, type ReactNode } from 'react';

import { richText } from './rich-text';

/** Asserts a node is a `<strong>` over the given text, and narrows it. */
function assertStrong(node: ReactNode, text: string) {
  if (!isValidElement<{ children: ReactNode }>(node)) {
    assert.fail(`expected an element, got ${JSON.stringify(node)}`);
  }

  assert.equal(node.type, 'strong');
  assert.equal(node.props.children, text);
}

describe('richText: what it renders', () => {
  it('leaves a plain string as one node', () => {
    assert.deepEqual(richText('no emphasis here'), ['no emphasis here']);
  });

  it('splits emphasis out of the running text', () => {
    const [before, strong, after, ...rest] = richText(
      'I <strong>do not</strong> buy buzzwords',
    );

    assert.equal(before, 'I ');
    assertStrong(strong, 'do not');
    assert.equal(after, ' buy buzzwords');
    assert.deepEqual(rest, []);
  });

  it('drops the empty text around adjacent emphasis', () => {
    const nodes = richText('<strong>250,000 lines</strong>');

    assert.equal(nodes.length, 1);
    assertStrong(nodes[0], '250,000 lines');
  });

  it('renders several emphasized runs in one string', () => {
    const nodes = richText('<strong>a</strong> and <strong>b</strong>');

    assert.equal(nodes.length, 3);
    assertStrong(nodes[0], 'a');
    assert.equal(nodes[1], ' and ');
    assertStrong(nodes[2], 'b');
  });
});

describe('richText: what it refuses', () => {
  it('throws on a tag it does not render', () => {
    assert.throws(
      () => richText('an <em>aside</em>'),
      /Unsupported markup <em>/,
    );
  });

  it('throws on an unclosed emphasis rather than printing it', () => {
    assert.throws(
      () => richText('an <strong>unclosed run'),
      /Unsupported markup <strong>/,
    );
  });
});
