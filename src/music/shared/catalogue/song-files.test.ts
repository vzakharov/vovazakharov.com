import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { playedName, songFiles } from './song-files.ts';

const RAW = 'https://raw.githubusercontent.com/vovas-music';

const SNOW = {
  artists: [{ original: 'Полуживые', latin: 'Poluzhivye' }],
  title: { original: 'Снег идёт', latin: 'Sneg idyot' },
} as const;

const BOOM = {
  artists: [{ original: 'GENERATED' }],
  title: { original: 'Boom!' },
} as const;

describe('songFiles', () => {
  it('lists the MP3 copy first, then the master, at the repository’s root on main, in each spelling', () => {
    assert.deepEqual(
      songFiles({ repo: 'snow', lossy: false }, SNOW).map(({ href }) => href),
      [
        {
          original: `${RAW}/snow/main/${encodeURIComponent('Полуживые - Снег идёт.mp3')}`,
          latin: `${RAW}/snow/main/Poluzhivye%20-%20Sneg%20idyot.mp3`,
        },
        {
          original: `${RAW}/snow/main/${encodeURIComponent('Полуживые - Снег идёт.flac')}`,
          latin: `${RAW}/snow/main/Poluzhivye%20-%20Sneg%20idyot.flac`,
        },
      ],
    );
  });

  it('lists a lossy master once, with one link where the name needs no second spelling', () => {
    assert.deepEqual(songFiles({ repo: 'boom', lossy: true }, BOOM), [
      {
        extension: 'mp3',
        href: { original: `${RAW}/boom/main/GENERATED%20-%20Boom!.mp3` },
      },
    ]);
  });
});

describe('playedName', () => {
  it('streams a FLAC master’s MP4 rewrap for lossless and its MP3 otherwise, in Latin letters', () => {
    assert.equal(
      playedName({ lossy: false }, SNOW, true),
      'Poluzhivye - Sneg idyot.mp4',
    );
    assert.equal(
      playedName({ lossy: false }, SNOW, false),
      'Poluzhivye - Sneg idyot.mp3',
    );
  });

  it('streams an MP3 master as it is either way', () => {
    assert.equal(
      playedName({ lossy: true }, BOOM, true),
      'GENERATED - Boom!.mp3',
    );
    assert.equal(
      playedName({ lossy: true }, BOOM, false),
      'GENERATED - Boom!.mp3',
    );
  });
});
