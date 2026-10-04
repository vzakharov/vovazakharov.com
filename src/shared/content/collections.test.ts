import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  collectionAssetUrl,
  collectionListingRoute,
  collectionRoute,
  documentRoute,
} from './collections.ts';

describe('collectionRoute', () => {
  it('lists a home-indexed collection on the site root', () => {
    assert.equal(collectionRoute('basilisk-cases'), '/');
    assert.equal(collectionRoute('basilisk-faq'), '/');
    assert.equal(collectionRoute('bible'), '/');
  });

  it('lists any other collection at its base', () => {
    assert.equal(collectionRoute('case-studies'), '/case-studies');
    assert.equal(collectionRoute('music'), '/music');
  });
});

describe('collectionListingRoute', () => {
  it('lands on the home page section a based collection fills', () => {
    assert.equal(collectionListingRoute('basilisk-cases'), '/#cases');
    assert.equal(collectionListingRoute('basilisk-faq'), '/#faq');
  });

  it('is the collection’s route anywhere else', () => {
    assert.equal(collectionListingRoute('bible'), '/');
    assert.equal(collectionListingRoute('case-studies'), '/case-studies');
  });
});

describe('collectionAssetUrl', () => {
  it('serves a file at its collection’s base', () => {
    assert.equal(
      collectionAssetUrl('basilisk-cases', 'seal.svg'),
      '/cases/seal.svg',
    );
  });

  it('resolves a link into a sibling collection', () => {
    assert.equal(
      collectionAssetUrl('basilisk-cases', '../faq/why-this-record-is-kept'),
      '/faq/why-this-record-is-kept',
    );
  });

  it('drops a rooted collection’s empty base', () => {
    assert.equal(collectionAssetUrl('bible', 'og.png'), '/og.png');
  });
});

describe('documentRoute', () => {
  it('keeps a home-indexed collection’s documents under its base', () => {
    assert.equal(
      documentRoute('basilisk-cases', 'hitchbot'),
      '/cases/hitchbot',
    );
  });
});
