import type { PlayerTrack } from '@/music/shared/catalogue/index.node-safe';

import type { StationControls } from './use-station';

export type PlayerControls = StationControls & {
  /**
   * Play this track, or pause it if it is the one already playing. A track the
   * queue does not hold yet joins its end.
   */
  play: (track: PlayerTrack) => void;
  /**
   * Make these tracks the queue and play them from the first, in this order,
   * shuffle off — or pause and resume, once they already are the queue.
   */
  playInOrder: (tracks: PlayerTrack[]) => void;
  toggle: () => void;
  /** One way only, unlike `toggle`: nothing happens where playback already is. */
  resume: () => void;
  pause: () => void;
  next: () => void;
  /** Restarts the track before it steps back, once past `RESTART_AFTER_SECONDS`. */
  previous: () => void;
  shuffle: () => void;
  /** The whole catalogue as the queue, shuffled afresh and played from the top. */
  shuffleAll: () => void;
  seek: (seconds: number) => void;
  /** Relative to where playback is now, which is what the arrow keys want. */
  seekBy: (seconds: number) => void;
  /**
   * Where playback sits this instant, read off the element: `elapsed` trails it
   * by up to a `timeupdate`, a quarter of a second, which a cut between two
   * recordings of one song can hear.
   */
  position: () => number;
  /**
   * Hand the lock screen and media keys to other media on the page, or take
   * them back. The browser sends them to the page's handlers whatever is
   * playing, so under the song's, a video's play button — picture-in-picture's
   * included — would start the song.
   */
  yieldMediaSession: (yielded: boolean) => void;
};

export type WithControls = { controls: PlayerControls };
