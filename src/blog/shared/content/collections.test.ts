import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  collectionAssetUrl,
  collectionListingRoute,
  collectionRoute,
  documentRoute,
  isDocumentFile,
  resolveAuthoredPath,
  resolveAuthoredUrl,
} from './collections.ts';

describe('collectionRoute', () => {
  it('lists a home-indexed collection on the site root', () => {
    assert.equal(collectionRoute('basilisk-cases'), '/');
    assert.equal(collectionRoute('basilisk-faq'), '/');
    assert.equal(collectionRoute('bible'), '/');
  });

  it('lists any other collection at its base', () => {
    assert.equal(collectionRoute('case-studies'), '/case-studies');
    assert.equal(collectionRoute('music'), '/music/songs');
  });
});

describe('collectionListingRoute', () => {
  it('lands on the home page section a based collection fills', () => {
    assert.equal(collectionListingRoute('basilisk-cases'), '/#cases');
    assert.equal(collectionListingRoute('basilisk-faq'), '/#faq');
    assert.equal(collectionListingRoute('maya-blog'), '/#blog');
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

describe('resolveAuthoredPath', () => {
  it('links a root document’s sibling to its route', () => {
    assert.equal(
      resolveAuthoredPath('music', 'slime.md', './after-us.md'),
      '/music/songs/after-us',
    );
  });

  it('resolves a sibling directory’s link beside its own file', () => {
    assert.equal(
      resolveAuthoredPath(
        'music',
        '../albums/wings.md',
        '../songs/after-us.md',
      ),
      '/music/songs/after-us',
    );
    assert.equal(
      resolveAuthoredPath('music', '../albums/wings.md', './cover.jpg'),
      '/music/albums/cover.jpg',
    );
    assert.equal(
      resolveAuthoredPath('music', 'breathe.md', '../assets/vagabond.png'),
      '/music/assets/vagabond.png',
    );
  });

  it('keeps a cut’s suffix', () => {
    assert.equal(
      resolveAuthoredPath('case-studies', 'playgram.md', './playgram.mini.md'),
      '/case-studies/playgram.mini',
    );
  });
});

describe('resolveAuthoredUrl', () => {
  it('links a sibling song’s file to its page, fragment kept', () => {
    assert.equal(
      resolveAuthoredUrl('music', 'invitation.md', './butterfly-rock.md'),
      '/music/songs/butterfly-rock',
    );
    assert.equal(
      resolveAuthoredUrl('music', 'invitation.md', 'butterfly-rock.md#lyrics'),
      '/music/songs/butterfly-rock#lyrics',
    );
  });

  it('leaves an absolute, site-root or in-page address as written', () => {
    for (const url of ['https://example.com/x.md', '/music', '#lyrics']) {
      assert.equal(resolveAuthoredUrl('music', 'invitation.md', url), url);
    }
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

describe('isDocumentFile', () => {
  it('takes a document and its cuts', () => {
    assert.equal(isDocumentFile('hitchbot.md'), true);
    assert.equal(isDocumentFile('playgram.mini.md'), true);
  });

  it('leaves out a companion and anything not markdown', () => {
    assert.equal(isDocumentFile('hitchbot.clerk.reflections.md'), false);
    assert.equal(isDocumentFile('hitchbot.pdf'), false);
  });
});
