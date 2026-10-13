import {
  generateAlbumMetadata,
  generateArtistMetadata,
  generateMusicMetadata,
} from '../lib/music-metadata';
import type { MusicAddress } from '../lib/music-route-params';
import { AlbumPage } from './album-page';
import { ArtistPage } from './artist-page';
import { MusicPage } from './music-page';
import { generateRadioMetadata, RadioPage } from './radio-page';
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
    case 'radio': {
      return <RadioPage {...address} />;
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
    case 'radio': {
      return generateRadioMetadata(address);
    }
    default: {
      return address satisfies never;
    }
  }
}
