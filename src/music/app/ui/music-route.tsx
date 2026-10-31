import { AlbumPage, generateAlbumMetadata } from '@/music/pages/album';
import { ArtistPage, generateArtistMetadata } from '@/music/pages/artist';
import { generateMusicMetadata, MusicPage } from '@/music/pages/music';
import { generateRadioMetadata, RadioPage } from '@/music/pages/radio';
import { generateSongMetadata, SongPage } from '@/music/pages/song';

import type { MusicAddress } from '../lib/music-route-params';

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
