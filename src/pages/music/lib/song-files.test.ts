import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { songFiles } from './song-files';

describe('songFiles', () => {
  it('lists the MP3 copy first, then the master it was cut from', () => {
    assert.deepEqual(
      songFiles({
        audio: 'https://example.com/a.FLAC',
        mp3: { url: 'https://example.com/a.master.mp3', bytes: 1 },
      }),
      [
        { extension: 'mp3', href: 'https://example.com/a.master.mp3' },
        { extension: 'flac', href: 'https://example.com/a.FLAC' },
      ],
    );
  });

  it('lists a master that is already an MP3 once', () => {
    assert.deepEqual(songFiles({ audio: '/a.mp3', mp3: { bytes: 1 } }), [
      { extension: 'mp3', href: '/a.mp3' },
    ]);
  });
});
