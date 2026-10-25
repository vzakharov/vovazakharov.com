import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { albumsTogether, albumTracks, songPlacements } from './album-tracks.ts';
import type { MusicAlbum } from './name-brands.ts';

// The catalogue's own schema stays out of the barrel a client component
// enters; a fixture brands its slugs with a schema of the same brand.
const albumSlug = (slug: string): MusicAlbum =>
  z.string().brand<'MusicAlbum'>().parse(slug);

const HAMLET = albumSlug('hamlet');
const FATHER_RIVER = albumSlug('father-river');

const song = (
  slug: string,
  frontmatter: Parameters<typeof songPlacements>[0],
) => ({ slug, frontmatter });

const valentinesDay = song('valentines-day', {
  album: FATHER_RIVER,
  track: 6,
  alsoOn: [{ album: HAMLET, track: 4 }],
});

const songs = [
  valentinesDay,
  song('stricken-deer', { album: HAMLET, track: 5 }),
  song('hamlet', { album: HAMLET, track: 1 }),
  song('my-offence-is-rank', {
    album: FATHER_RIVER,
    track: 5,
    alsoOn: [{ album: HAMLET, track: 3 }],
  }),
  song('single', { album: null }),
];

const slugsOn = (album: Parameters<typeof albumTracks>[0]) =>
  albumTracks(album, songs).map(({ song: { slug }, track }) => [slug, track]);

describe('songPlacements', () => {
  it('puts the release a song is filed under ahead of the others', () => {
    assert.deepEqual(songPlacements(valentinesDay.frontmatter), [
      { album: FATHER_RIVER, track: 6 },
      { album: HAMLET, track: 4 },
    ]);
  });

  it('places a single on nothing', () => {
    assert.deepEqual(songPlacements({ album: null }), []);
  });
});

describe('albumTracks', () => {
  it('lists a song filed elsewhere at its number on this album', () => {
    assert.deepEqual(slugsOn(HAMLET), [
      ['hamlet', 1],
      ['my-offence-is-rank', 3],
      ['valentines-day', 4],
      ['stricken-deer', 5],
    ]);
  });

  it('keeps the song on the album it is filed under', () => {
    assert.deepEqual(slugsOn(FATHER_RIVER), [
      ['my-offence-is-rank', 5],
      ['valentines-day', 6],
    ]);
  });

  it('finds nothing on an album no song is on', () => {
    assert.deepEqual(slugsOn(albumSlug('ctfu')), []);
  });
});

describe('albumsTogether', () => {
  it('walks each album in track order from where its first song stood, past gaps in the numbering', () => {
    assert.deepEqual(
      albumsTogether(songs).map(({ slug }) => slug),
      [
        'my-offence-is-rank',
        'valentines-day',
        'hamlet',
        'stricken-deer',
        'single',
      ],
    );
  });
});
