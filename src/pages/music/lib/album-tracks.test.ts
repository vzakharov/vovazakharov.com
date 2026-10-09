import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { albumTracks, songPlacements } from './album-tracks.ts';

const song = (
  slug: string,
  frontmatter: Parameters<typeof songPlacements>[0],
) => ({ slug, frontmatter });

const ophelia = song('ophelia', {
  album: 'father-river',
  track: 6,
  alsoOn: [{ album: 'hamlet', track: 4 }],
});

const songs = [
  ophelia,
  song('deer', { album: 'hamlet', track: 5 }),
  song('hamlet', { album: 'hamlet', track: 1 }),
  song('rank', {
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
    assert.deepEqual(songPlacements(ophelia.frontmatter), [
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
      ['rank', 3],
      ['ophelia', 4],
      ['deer', 5],
    ]);
  });

  it('keeps the song on the album it is filed under', () => {
    assert.deepEqual(slugsOn('father-river'), [
      ['rank', 5],
      ['ophelia', 6],
    ]);
  });

  it('finds nothing on an album no song is on', () => {
    assert.deepEqual(slugsOn('cheer-the-fuck-up'), []);
  });
});
