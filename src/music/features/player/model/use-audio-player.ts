import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import type { Locale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import {
  type PlayerTrack,
  trackSource,
  type WithTracks,
} from '@/music/shared/catalogue/index.node-safe';

import { createDecks, currentTrack, type Decks, initialRadioPlayerState, isQueued, placeTracks, type PlayerControls, radioPlayerReducer, type RadioPlayerState, seguePositions, shouldRestart, upcomingTrack, useMediaSession, useStation,type WithControls } from '../station';
import { createFetchingDeck, isIOS } from './fetching-deck';
import { usePlayerKeys } from './use-player-keys';
import { useStoredSetting } from './use-stored-setting';

/**
 * The seed is the action's, not the reducer's: a permutation has to be
 * reproducible from the number that produced it for the reducer to stay pure
 * and testable.
 */
function freshShuffle(tracks: readonly PlayerTrack[]) {
  return { seed: Date.now(), segues: seguePositions(tracks) };
}

/** What is playing and where, as the bar and the track buttons read it. */
type Playback = {
  state: RadioPlayerState;
  current?: PlayerTrack;
  /** Where playback sits, in seconds — the seek bar's value. */
  elapsed: number;
  /** From a change of quality until the new file can play from where it was. */
  switching: boolean;
};

/** Playback, and the tracks it plays from. */
export type QueuedPlayback = Playback & WithTracks;

export type AudioPlayer = QueuedPlayback & WithControls;

/**
 * The site's audio and everything that drives it: the queue, the elements' own
 * events, the lock screen and the keyboard. The locale is the page's, which the
 * lock screen titles the track in, spelled as the reader chose.
 */
export function useAudioPlayer(
  catalogue: PlayerTrack[],
  locale: Locale,
): AudioPlayer {
  const decksRef = useRef<Decks | null>(null);
  // Where a switch of quality left the song, for the new file to seek to.
  const resumeAtRef = useRef<number | undefined>(undefined);
  const [tracks, setTracks] = useState(catalogue);
  const [state, dispatch] = useReducer(
    radioPlayerReducer,
    catalogue.length,
    initialRadioPlayerState,
  );
  const [elapsed, setElapsed] = useState(0);
  const [switching, setSwitching] = useState(false);
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
  const currentDecks = useCallback(() => decksRef.current, []);
  const element = useCallback(() => decksRef.current?.active() ?? null, []);
  const source = useCallback(
    (playing: PlayerTrack) => trackSource(playing, lossless),
    [lossless],
  );
  const station = useStation({
    decks: currentDecks,
    source,
    catalogue,
    ...pick(state, 'radio'),
    dispatch,
    storeShuffle,
  });
  const { tuneIn, tryTuneIn, onAir, keepTime, upNext, handOver } = station;
  const nextSource = useCallback(() => {
    const position = upcomingTrack(state);
    const queued = position === undefined ? undefined : tracks[position];
    const next = state.radio ? upNext() : queued;

    return next && source(next);
  }, [state, tracks, source, upNext]);
  // A rejected play is the browser withholding autoplay, which is a state the
  // UI has to show rather than a failure to report.
  const refused = useCallback(() => {
    dispatch({ type: 'playback', playing: false });
  }, []);
  const onMedia = useEffectEvent(() => {
    keepTime();
  });
  // The deck holding what is due next starts here, before the queue moves on,
  // which is what leaves no gap between the songs.
  const onEnded = useEffectEvent(() => {
    const decks = decksRef.current;
    const next = nextSource();

    if (decks !== null && next !== undefined && decks.cue(next)) {
      decks.play(refused);
      setElapsed(0);
    }
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
        const audio = element();

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
        const audio = element();

        dispatch({ type: 'release' });
        if (audio !== null) audio.currentTime = seconds;
      },
      seekBy: (seconds) => {
        const audio = element();

        dispatch({ type: 'release' });
        if (audio !== null) {
          audio.currentTime = Math.max(0, audio.currentTime + seconds);
        }
      },
      tuneIn,
      tryTuneIn,
      onAir,
      position: () => element()?.currentTime ?? 0,
      yieldMediaSession: setSessionYielded,
    }),
    [
      state,
      track,
      tracks,
      element,
      shuffleStored,
      storeShuffle,
      tuneIn,
      tryTuneIn,
      onAir,
    ],
  );

  // This effect comes before the ones that drive the decks, which is what puts
  // the ref in place ahead of them.
  useEffect(() => {
    const decks = (isIOS() ? createFetchingDeck : createDecks)([
      [
        'timeupdate',
        (audio) => {
          // A new source reports its reset to 0 before a switch of quality
          // seeks it back, which would flick the seek bar to the start.
          if (resumeAtRef.current === undefined) setElapsed(audio.currentTime);
        },
      ],
      [
        'canplay',
        () => {
          setSwitching(false);
        },
      ],
      [
        'loadedmetadata',
        (audio) => {
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
        (audio) => {
          // A track reaching its end pauses on the way to `ended`, which
          // decides what plays next; only any other pause is the reader's.
          if (!audio.ended) dispatch({ type: 'playback', playing: false });
        },
      ],
    ]);

    decksRef.current = decks;

    return () => {
      decks.stop();
      decksRef.current = null;
    };
  }, []);

  // Loading a new source and obeying play/pause are one effect because they are
  // one decision: the element's `src` and its playback state both follow from
  // what the reducer says is current.
  useEffect(() => {
    const decks = decksRef.current;

    if (decks === null || current === undefined) return;

    const wanted = source(current);
    const cued = decks.cue(wanted);
    const audio = decks.active();
    const loaded = decks.loaded();

    if (cued || loaded !== wanted) {
      // The same song in the other quality picks up where it was, once the new
      // file's metadata gives it somewhere to seek to; any other source — a
      // preloaded one included — starts from the top, and drops a seek still
      // owed to a file gone.
      const switched = loaded === trackSource(current, !lossless);

      resumeAtRef.current = switched ? audio.currentTime : undefined;
      setSwitching(switched);
      if (!cued) decks.load(wanted);
      if (!switched) setElapsed(0);
    }

    if (state.playing) {
      decks.play(refused);
    } else {
      audio.pause();
    }
  }, [current, state.playing, source, lossless, refused]);

  // After the effect above, which may yet cue the deck this would re-point.
  useEffect(() => {
    decksRef.current?.arm(nextSource());
  }, [nextSource]);

  useEffect(() => {
    decksRef.current?.setVolume(volume);
  }, [volume]);

  useMediaSession({
    current,
    ...pick(state, 'playing'),
    controls,
    locale,
    yielded: sessionYielded,
  });
  usePlayerKeys(controls);

  return {
    state,
    elapsed,
    switching,
    tracks,
    controls,
    ...(current && { current }),
  };
}
