import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { fillSlots } from './message-slots';

describe('fillSlots', () => {
  it('puts each slot where its placeholder is', () => {
    const link = createElement('a', { href: '/x' }, 'it');

    assert.equal(
      renderToStaticMarkup(
        createElement('p', null, fillSlots('Read {link} today.', { link })),
      ),
      '<p>Read <a href="/x">it</a> today.</p>',
    );
  });

  it('throws on a placeholder no slot fills', () => {
    assert.throws(() => fillSlots('Read {link}.', {}), /{link}/);
  });

  it('throws on a slot with no placeholder', () => {
    assert.throws(() => fillSlots('Read it.', { link: 'x' }), /{link}/);
  });
});
