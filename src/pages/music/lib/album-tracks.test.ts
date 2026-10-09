import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { albumTracks, songPlacements } from './album-tracks.ts';

const song = (
  slug: string,
  frontmatter: Parameters<typeof songPlacements>[0],
) => ({ slug, frontmatter });

const valentinesDay = song('valentines-day', {
  album: 'father-river',
  track: 6,
  alsoOn: [{ album: 'hamlet', track: 4 }],
});

const songs = [
  valentinesDay,
  song('stricken-deer', { album: 'hamlet', track: 5 }),
  song('hamlet', { album: 'hamlet', track: 1 }),
  song('my-offence-is-rank', {
    album: 'father-river',
    track: 5,
    alsoOn: [{ album: 'hamlet', track: 3 }],
  }),
  song('single', { album: null }),
];

const slugsOn = (album: Parameters<typeof albumTracks>[0]) =>
  albumTracks(album, songs).map(({ song: { slug }, track }) => [slug, track]);

describe('songPlacements', () => {
  it('puts the release a song is filed under ahead of the others', () => {
    assert.deepEqual(songPlacements(valentinesDay.frontmatter), [
      { album: 'father-river', track: 6 },
      { album: 'hamlet', track: 4 },
    ]);
  });

  it('places a single on nothing', () => {
    assert.deepEqual(songPlacements({ album: null }), []);
  });
});

describe('albumTracks', () => {
  it('lists a song filed elsewhere at its number on this album', () => {
    assert.deepEqual(slugsOn('hamlet'), [
      ['hamlet', 1],
      ['my-offence-is-rank', 3],
      ['valentines-day', 4],
      ['stricken-deer', 5],
    ]);
  });

  it('keeps the song on the album it is filed under', () => {
    assert.deepEqual(slugsOn('father-river'), [
      ['my-offence-is-rank', 5],
      ['valentines-day', 6],
    ]);
  });

  it('finds nothing on an album no song is on', () => {
    assert.deepEqual(slugsOn('ctfu'), []);
  });
});
