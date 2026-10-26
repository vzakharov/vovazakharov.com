import type { WithLocale } from '@/kernel/shared/i18n';

import type { Slugged } from '@/blog/shared/content';

import type {
  MusicAlbum,
  MusicProject,
  WithTab,
} from '@/music/shared/catalogue';

export type IndexPageProps = WithLocale & WithTab;

export type ArtistPageProps = WithLocale & { artist: MusicProject };

export type AlbumPageProps = WithLocale & { album: MusicAlbum };

export type SongPageProps = WithLocale & Slugged;
