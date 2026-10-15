import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import type { Locale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';

import {
  currentTrack,
  isQueued,
  placeTracks,
  type PlayerTrack,
  seguePositions,
  shouldRestart,
  trackSource,
  type WithTracks,
} from './player-state';
import {
  initialRadioPlayerState,
  radioPlayerReducer,
  type RadioPlayerState,
} from './radio-state';
import { useMediaSession } from './use-media-session';
import { usePlayerKeys } from './use-player-keys';
import { type StationControls, useStation } from './use-station';
import { useStoredSetting } from './use-stored-setting';

/**
 * The seed is the action's, not the reducer's: a permutation has to be
 * reproducible from the number that produced it for the reducer to stay pure
 * and testable.
 */
function freshShuffle(tracks: readonly PlayerTrack[]) {
  return { seed: Date.now(), segues: seguePositions(tracks) };
}

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

/** What is playing and where, as the bar and the track buttons read it. */
type Playback = {
  state: RadioPlayerState;
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
 * is the page's, which the lock screen titles the track in, spelled as the
 * reader chose.
 */
export function useAudioPlayer(
  catalogue: PlayerTrack[],
  locale: Locale,
): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Where a switch of quality left the song, for the new file to seek to.
  const resumeAtRef = useRef<number | undefined>(undefined);
  const [tracks, setTracks] = useState(catalogue);
  const [state, dispatch] = useReducer(
    radioPlayerReducer,
    catalogue.length,
    initialRadioPlayerState,
  );
  const [elapsed, setElapsed] = useState(0);
  const [sessionYielded, setSessionYielded] = useState(false);
  const [shuffleStored, storeShuffle] = useStoredSetting('shuffle');
  const [lossless] = useStoredSetting('lossless');
  const [volume] = useStoredSetting('volume');

  // The stored switch leads and the queue follows, which is what restores a
  // remembered shuffle on load — before anything plays, so the cursor has
  // nothing to keep — as well as obeying the button.
  useEffect(() => {
    if (shuffleStored !== state.shuffled) {
      dispatch({ type: 'shuffle', ...freshShuffle(tracks) });
    }
  }, [shuffleStored, state.shuffled, tracks]);

  const track = currentTrack(state);
  const current = track === undefined ? undefined : tracks[track];
  const element = useCallback(() => audioRef.current, []);
  const source = useCallback(
    (playing: PlayerTrack) => trackSource(playing, lossless),
    [lossless],
  );
  const station = useStation({
    element,
    source,
    catalogue,
    ...pick(state, 'radio'),
    dispatch,
    storeShuffle,
  });
  const { tuneIn, tryTuneIn, onAir, keepTime, handOver } = station;
  const onMedia = useEffectEvent(() => {
    keepTime();
  });
  // On the radio a song's end hands over to the next slot of the timetable;
  // off it, to the next track of the queue.
  const onEnded = useEffectEvent(() => {
    if (!handOver()) dispatch({ type: 'step', by: 1 });
  });

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
          dispatch({ type: 'release' });
          audio.currentTime = 0;

          return;
        }

        dispatch({ type: 'step', by: -1 });
      },
      shuffle: () => {
        storeShuffle(!shuffleStored);
      },
      shuffleAll: () => {
        storeShuffle(true);
        dispatch({ type: 'shuffleAll', ...freshShuffle(tracks) });
      },
      // A seek moves the element rather than the queue, so it releases the
      // radio by an action of its own.
      seek: (seconds) => {
        const audio = audioRef.current;

        dispatch({ type: 'release' });
        if (audio !== null) audio.currentTime = seconds;
      },
      seekBy: (seconds) => {
        const audio = audioRef.current;

        dispatch({ type: 'release' });
        if (audio !== null) {
          audio.currentTime = Math.max(0, audio.currentTime + seconds);
        }
      },
      tuneIn,
      tryTuneIn,
      onAir,
      position: () => audioRef.current?.currentTime ?? 0,
      yieldMediaSession: setSessionYielded,
    }),
    [
      state,
      track,
      tracks,
      shuffleStored,
      storeShuffle,
      tuneIn,
      tryTuneIn,
      onAir,
    ],
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
        'loadedmetadata',
        () => {
          // Ahead of the station's own seek, which a tuned-in radio then wins.
          const resumeAt = resumeAtRef.current;

          resumeAtRef.current = undefined;
          if (resumeAt !== undefined) audio.currentTime = resumeAt;
          onMedia();
        },
      ],
      ['playing', onMedia],
      [
        'ended',
        () => {
          onEnded();
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
          // A track reaching its end pauses on the way to `ended`, which
          // decides what plays next; only any other pause is the reader's.
          if (!audio.ended) dispatch({ type: 'playback', playing: false });
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
    const loaded = audio.getAttribute('src');
    const wanted = source(current);

    if (loaded !== wanted) {
      // The same song in the other quality picks up where it was, once the new
      // file's metadata gives it somewhere to seek to; any other source starts
      // from the top, and drops a seek still owed to a file gone.
      const switched = loaded === trackSource(current, !lossless);

      resumeAtRef.current = switched ? audio.currentTime : undefined;
      audio.src = wanted;
      if (!switched) setElapsed(0);
    }

    if (state.playing) {
      // A rejected play is the browser withholding autoplay, which is a state
      // the UI has to show rather than a failure to report — unless it is an
      // abort, a source change cutting short the play before it, which is no
      // pause and must not release the radio.
      audio.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        dispatch({ type: 'playback', playing: false });
      });
    } else {
      audio.pause();
    }
  }, [current, state.playing, source, lossless]);

  useEffect(() => {
    if (audioRef.current !== null) audioRef.current.volume = volume;
  }, [volume]);

  useMediaSession({
    current,
    ...pick(state, 'playing'),
    controls,
    locale,
    yielded: sessionYielded,
  });
  usePlayerKeys(controls);

  return { state, elapsed, tracks, controls, ...(current && { current }) };
}
