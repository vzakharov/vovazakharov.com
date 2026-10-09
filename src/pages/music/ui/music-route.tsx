import {
  generateAlbumMetadata,
  generateArtistMetadata,
  generateMusicMetadata,
} from '../lib/music-metadata';
import type { MusicAddress } from '../lib/music-route-params';
import { AlbumPage } from './album-page';
import { ArtistPage } from './artist-page';
import { MusicPage } from './music-page';
import { generateSongMetadata, SongPage } from './song-page';

export type MusicRouteProps = { address: MusicAddress };

/** The page an address under `/music` resolves to. */
export function MusicRoute({ address }: MusicRouteProps) {
  switch (address.page) {
    case 'index': {
      return <MusicPage {...address} />;
    }
    case 'artist': {
      return <ArtistPage {...address} />;
    }
    case 'album': {
      return <AlbumPage {...address} />;
    }
    case 'song': {
      return <SongPage {...address} />;
    }
    default: {
      return address satisfies never;
    }
  }
}

export function generateMusicRouteMetadata({ address }: MusicRouteProps) {
  switch (address.page) {
    case 'index': {
      return generateMusicMetadata(address);
    }
    case 'artist': {
      return generateArtistMetadata(address);
    }
    case 'album': {
      return generateAlbumMetadata(address);
    }
    case 'song': {
      return generateSongMetadata(address);
    }
    default: {
      return address satisfies never;
    }
  }
}
