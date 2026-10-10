import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';

import {
  billingText,
  currentTrack,
  initialPlayerState,
  isQueued,
  placeTracks,
  playerReducer,
  type PlayerState,
  type PlayerTrack,
  shouldRestart,
  type WithTracks,
} from './player-state';
import { useStoredFlag } from './use-stored-flag';

/** How far a seek key moves, in seconds. */
const SEEK_STEP = 5;

export type PlayerControls = {
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

/** What is playing and where, as the bar and the track buttons read it. */
type Playback = {
  state: PlayerState;
  current?: PlayerTrack;
  /** Where playback sits, in seconds — the seek bar's value. */
  elapsed: number;
};

/** Playback, and the tracks it plays from. */
export type QueuedPlayback = Playback & WithTracks;

export type AudioPlayer = QueuedPlayback & { controls: PlayerControls };

/**
 * The one `<audio>` element on the site and everything that drives it: the
 * queue, the element's own events, the lock screen and the keyboard. The locale
 * is the page's, which the lock screen titles the track in.
 */
export function useAudioPlayer(
  catalogue: PlayerTrack[],
  locale: Locale,
): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState(catalogue);
  const [state, dispatch] = useReducer(
    playerReducer,
    catalogue.length,
    initialPlayerState,
  );
  const [elapsed, setElapsed] = useState(0);
  const [sessionYielded, setSessionYielded] = useState(false);
  const [shuffleStored, storeShuffle] = useStoredFlag('shuffle');

  // The stored switch leads and the queue follows, which is what restores a
  // remembered shuffle on load — before anything plays, so the cursor has
  // nothing to keep — as well as obeying the button.
  useEffect(() => {
    if (shuffleStored !== state.shuffled) {
      dispatch({ type: 'shuffle', seed: Date.now() });
    }
  }, [shuffleStored, state.shuffled]);

  const track = currentTrack(state);
  const current = track === undefined ? undefined : tracks[track];

  const controls = useMemo<PlayerControls>(
    () => ({
      play: (next) => {
        const position = tracks.findIndex(({ slug }) => slug === next.slug);

        if (position === -1) {
          setTracks([...tracks, next]);
          dispatch({ type: 'append' });

          return;
        }

        dispatch(
          position === track
            ? { type: 'toggle' }
            : { type: 'select', track: position },
        );
      },
      playInOrder: (wanted) => {
        const { positions, missing } = placeTracks(tracks, wanted);

        if (isQueued(state, positions)) {
          dispatch({ type: 'toggle' });

          return;
        }

        if (missing.length > 0) setTracks([...tracks, ...missing]);
        // Off before the queue lands, or the stored switch would shuffle the
        // order this control exists to keep.
        storeShuffle(false);
        dispatch({ type: 'queue', positions });
      },
      toggle: () => {
        dispatch({ type: 'toggle' });
      },
      resume: () => {
        if (!state.playing) dispatch({ type: 'toggle' });
      },
      pause: () => {
        if (state.playing) dispatch({ type: 'toggle' });
      },
      next: () => {
        dispatch({ type: 'step', by: 1 });
      },
      previous: () => {
        const audio = audioRef.current;

        if (audio !== null && shouldRestart(audio.currentTime)) {
          audio.currentTime = 0;

          return;
        }

        dispatch({ type: 'step', by: -1 });
      },
      shuffle: () => {
        storeShuffle(!shuffleStored);
      },
      // The seed is the action's, not the reducer's: a permutation has to be
      // reproducible from the number that produced it for the reducer to stay
      // pure and testable.
      shuffleAll: () => {
        storeShuffle(true);
        dispatch({ type: 'shuffleAll', seed: Date.now() });
      },
      seek: (seconds) => {
        const audio = audioRef.current;

        if (audio !== null) audio.currentTime = seconds;
      },
      seekBy: (seconds) => {
        const audio = audioRef.current;

        if (audio !== null) {
          audio.currentTime = Math.max(0, audio.currentTime + seconds);
        }
      },
      position: () => audioRef.current?.currentTime ?? 0,
      yieldMediaSession: setSessionYielded,
    }),
    [state, track, tracks, shuffleStored, storeShuffle],
  );

  // The element is an audio engine rather than page content — the bar is what
  // a reader operates — so it is constructed and never enters the document.
  // This effect comes before the ones that drive it, which is what puts the ref
  // in place ahead of them.
  useEffect(() => {
    const audio = new Audio();

    audio.preload = 'metadata';
    audioRef.current = audio;

    const listeners = [
      [
        'timeupdate',
        () => {
          setElapsed(audio.currentTime);
        },
      ],
      [
        'ended',
        () => {
          dispatch({ type: 'step', by: 1 });
        },
      ],
      [
        'play',
        () => {
          dispatch({ type: 'playback', playing: true });
        },
      ],
      [
        'pause',
        () => {
          dispatch({ type: 'playback', playing: false });
        },
      ],
    ] as const;

    for (const [event, handler] of listeners) {
      audio.addEventListener(event, handler);
    }

    return () => {
      for (const [event, handler] of listeners) {
        audio.removeEventListener(event, handler);
      }
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Loading a new source and obeying play/pause are one effect because they are
  // one decision: the element's `src` and its playback state both follow from
  // what the reducer says is current.
  useEffect(() => {
    const audio = audioRef.current;

    if (audio === null || current === undefined) return;

    // The attribute rather than the property: `src` reads back resolved to an
    // absolute URL, which a site-root path never equals, and every pause would
    // reload the track from the top.
    if (audio.getAttribute('src') !== current.audio) {
      audio.src = current.audio;
      setElapsed(0);
    }

    if (state.playing) {
      // A rejected play is the browser withholding autoplay, which is a state
      // the UI has to show rather than a failure to report.
      audio.play().catch(() => {
        dispatch({ type: 'playback', playing: false });
      });
    } else {
      audio.pause();
    }
  }, [current, state.playing]);

  // Lock screen, OS media keys, headphone buttons and car controls, all driving
  // the same queue rather than a second copy of its logic.
  useEffect(() => {
    const session = navigator.mediaSession as MediaSession | undefined;

    if (session === undefined || current === undefined) return;

    // The previous run's cleanup has already cleared the handlers; a state left
    // at `paused` would tell the browser nothing plays under a playing video.
    if (sessionYielded) {
      session.playbackState = 'none';

      return;
    }

    session.metadata = new MediaMetadata({
      ...pick(current.titles[locale], 'title'),
      artist: billingText(current.billing[locale]),
      album: 'vovazakharov.com/music',
    });
    session.playbackState = state.playing ? 'playing' : 'paused';

    // Not `toggle`: a browser may send either action whatever the state, and a
    // toggle would turn a pause into playback.
    const actions = [
      ['play', controls.resume],
      ['pause', controls.pause],
      ['nexttrack', controls.next],
      ['previoustrack', controls.previous],
    ] as const;

    for (const [action, handler] of actions) {
      session.setActionHandler(action, handler);
    }

    return () => {
      for (const [action] of actions) session.setActionHandler(action, null);
    };
  }, [current, state.playing, controls, locale, sessionYielded]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      // A key pressed inside a modal dialog is the dialog's — a song's video
      // takes the space bar for its own play/pause, and the song must stay
      // silent under it.
      const elsewhere =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.closest('[aria-modal="true"]') !== null);

      if (elsewhere || event.metaKey || event.ctrlKey || event.altKey) return;

      const handled: Record<string, () => void> = {
        ' ': controls.toggle,
        ArrowLeft: event.shiftKey
          ? controls.previous
          : () => {
              controls.seekBy(-SEEK_STEP);
            },
        ArrowRight: event.shiftKey
          ? controls.next
          : () => {
              controls.seekBy(SEEK_STEP);
            },
      };
      const handler = handled[event.key];

      if (handler === undefined) return;

      event.preventDefault();
      handler();
    }

    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [controls]);

  return { state, elapsed, tracks, controls, ...(current && { current }) };
}
