import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { songFiles } from './song-files';

const RAW = 'https://raw.githubusercontent.com/vovas-music';

describe('songFiles', () => {
  it('lists the MP3 copy first, then the master it was cut from', () => {
    assert.deepEqual(
      songFiles({
        audio: 'https://example.com/a.FLAC',
        mp3: { url: 'https://example.com/a.master.mp3', bytes: 1 },
      }),
      [
        {
          extension: 'mp3',
          href: { original: 'https://example.com/a.master.mp3' },
        },
        { extension: 'flac', href: { original: 'https://example.com/a.FLAC' } },
      ],
    );
  });

  it('lists a master that is already an MP3 once', () => {
    assert.deepEqual(songFiles({ audio: '/a.mp3', mp3: { bytes: 1 } }), [
      { extension: 'mp3', href: { original: '/a.mp3' } },
    ]);
  });

  it('links a repository’s file under the billing’s name, in each spelling', () => {
    assert.deepEqual(
      songFiles(
        {
          audio: `${RAW}/snow/main/stems/snow.flac`,
          mp3: { url: `${RAW}/snow/main/stems/snow.master.mp3`, bytes: 1 },
        },
        {
          artists: [{ original: 'Полуживые', latin: 'Poluzhivye' }],
          title: { original: 'Снег идёт', latin: 'Sneg idyot' },
        },
      ).map(({ href }) => href),
      [
        {
          original: `${RAW}/snow/main/stems/${encodeURIComponent('Полуживые - Снег идёт.mp3')}`,
          latin: `${RAW}/snow/main/stems/Poluzhivye%20-%20Sneg%20idyot.mp3`,
        },
        {
          original: `${RAW}/snow/main/stems/${encodeURIComponent('Полуживые - Снег идёт.flac')}`,
          latin: `${RAW}/snow/main/stems/Poluzhivye%20-%20Sneg%20idyot.flac`,
        },
      ],
    );
  });

  it('keeps one link where the name needs no second spelling', () => {
    assert.deepEqual(
      songFiles(
        { audio: `${RAW}/boom/main/boom.master.mp3`, mp3: { bytes: 1 } },
        {
          artists: [{ original: 'GENERATED' }],
          title: { original: 'Boom!' },
        },
      ),
      [
        {
          extension: 'mp3',
          href: { original: `${RAW}/boom/main/GENERATED%20-%20Boom!.mp3` },
        },
      ],
    );
  });

  it('keeps a file the site hosts at its own path', () => {
    assert.deepEqual(
      songFiles(
        { audio: '/music/assets/a.mp3', mp3: { bytes: 1 } },
        { artists: [{ original: 'A' }], title: { original: 'B' } },
      ),
      [{ extension: 'mp3', href: { original: '/music/assets/a.mp3' } }],
    );
  });
});
