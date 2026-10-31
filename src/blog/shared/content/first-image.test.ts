import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstImage } from './first-image';

describe('firstImage', () => {
  it('takes the first image the body shows', () => {
    assert.equal(
      firstImage(
        '# T\n\nText.\n\n![a](./assets/a.svg)\n\n![b](./assets/b.svg)',
      ),
      './assets/a.svg',
    );
  });

  it('passes over an image off-site', () => {
    assert.equal(
      firstImage('![a](https://example.com/a.png)\n\n![b](./assets/b.png)'),
      './assets/b.png',
    );
  });

  it('reads no image out of a code fence', () => {
    assert.equal(firstImage('```\n![a](./assets/a.png)\n```'), undefined);
  });
});
