'use client';

import type { WithTracks } from '@/music/shared/catalogue/index.node-safe';

import { isQueued, placeTracks } from '../model/player-state';
import { usePlayer } from './player-context';
import { ListenButton } from './song-play-button';

/**
 * An album page's play control: the album from its first track, in track
 * order — and, once the album is what the player is playing through, pause and
 * resume.
 */
export function AlbumPlayButton({ tracks }: WithTracks) {
  const { state, labels, playInOrder, tracks: known } = usePlayer();
  const { positions } = placeTracks(known, tracks);
  const playing = isQueued(state, positions) && state.playing;

  return (
    <ListenButton
      {...{ playing, labels }}
      onClick={() => {
        playInOrder(tracks);
      }}
    />
  );
}
