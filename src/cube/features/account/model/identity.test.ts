import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { identityOf, isPhrase, newIdentity } from './identity';
import { loginLink, pastedPhrase, phraseIn } from './login-link';

/** BIP-39's own first test vector: all zero entropy. */
const VECTOR = `${'abandon '.repeat(11)}about`;

describe('identityOf', () => {
  it('gives the same id for the same phrase, however it is typed', () => {
    const { id } = identityOf(VECTOR);
    assert.equal(identityOf(`  ${VECTOR.toUpperCase()}  `).id, id);
    assert.match(id, /^[\w-]{43}$/);
  });

  it('gives different phrases different ids', () => {
    assert.notEqual(newIdentity().id, identityOf(VECTOR).id);
  });

  it('refuses a phrase with a word misspelt or missing', () => {
    assert.throws(() => identityOf(VECTOR.replace('about', 'abouts')));
    assert.throws(() => identityOf(VECTOR.replace(' about', '')));
    assert.equal(isPhrase(VECTOR.replace('about', 'abandon')), false);
  });

  it('makes twelve-word phrases', () => {
    const { phrase } = newIdentity();
    assert.equal(phrase.split(' ').length, 12);
    assert.ok(isPhrase(phrase));
  });
});

describe('loginLink', () => {
  it('carries the phrase in the fragment and back', () => {
    const link = loginLink('https://example.com/cube', VECTOR);
    const fragment = new URL(link).hash.slice(1);
    assert.equal(link.split('#')[0], 'https://example.com/cube');
    assert.equal(phraseIn(fragment), VECTOR);
  });

  it('reads no phrase in a walk’s address or an empty fragment', () => {
    assert.equal(phraseIn('awake'), null);
    assert.equal(phraseIn(''), null);
    assert.equal(phraseIn('AbC-_09'), null);
  });
});

describe('pastedPhrase', () => {
  it('takes the phrase out of a pasted login link', () => {
    const link = loginLink('https://example.com/cube', VECTOR);
    assert.equal(pastedPhrase(link), VECTOR);
  });

  it('passes the words themselves, or anything else, through', () => {
    assert.equal(pastedPhrase(VECTOR), VECTOR);
    assert.equal(
      pastedPhrase('https://example.com/cube#awake'),
      'https://example.com/cube#awake',
    );
  });
});
