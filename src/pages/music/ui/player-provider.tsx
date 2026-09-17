'use client';

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { usePathname } from 'next/navigation';

import type { Locale, Messages } from '@/shared/i18n';
import type { WithChildren } from '@/shared/typings';

import { pathLocale } from '../lib/music-locale';

import {
  currentTrack,
  initialPlayerState,
  playerReducer,
  type PlayerState,
  type PlayerTrack,
  shouldRestart,
  type WithTracks,
} from '../lib/player-state';
import classes from './music.module.scss';
import { PlayerBar } from './player-bar';

/** How far a seek key moves, in seconds. */
const SEEK_STEP = 5;

export type PlayerControls = {
  /** Play this catalogue position, or pause it if it is the one already playing. */
  play: (track: number) => void;
  toggle: () => void;
  next: () => void;
  /** Restarts the track before it steps back, once past `RESTART_AFTER_SECONDS`. */
  previous: () => void;
  shuffle: () => void;
  seek: (seconds: number) => void;
  /** Relative to where playback is now, which is what the arrow keys want. */
  seekBy: (seconds: number) => void;
};

/** The bar's own words, in one language, as the catalogue spells them. */
export type PlayerLabels = Messages['music']['player'];

export type PlayerContextValue = PlayerControls &
  WithTracks & {
    /** The language of the page the bar is currently sitting under. */
    locale: Locale;
    labels: PlayerLabels;
    state: PlayerState;
    current?: PlayerTrack;
    /** Where playback sits, in seconds — the seek bar's value. */
    elapsed: number;
  };

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function usePlayer(): PlayerContextValue {
  const value = use(PlayerContext);

  if (value === undefined) {
    throw new Error('usePlayer is only available under the music layout');
  }

  return value;
}

export type PlayerProviderProps = WithChildren &
  WithTracks & {
    /** Every language's labels, the layout being above the segment that picks one. */
    labels: Record<Locale, PlayerLabels>;
  };

/**
 * Owns the one `<audio>` element on the site. It is mounted by the music
 * layout and never unmounted, which is the whole reason the player is not a
 * component a page drops in: React preserves a layout's subtree across a
 * navigation into and out of `/music/<slug>`, so a track keeps playing.
 */
export function PlayerProvider({
  children,
  tracks,
  labels,
}: PlayerProviderProps) {
  const locale = pathLocale(usePathname());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, dispatch] = useReducer(
    playerReducer,
    tracks.length,
    initialPlayerState,
  );
  const [elapsed, setElapsed] = useState(0);

  const track = currentTrack(state);
  const current = track === undefined ? undefined : tracks[track];

  const controls = useMemo<PlayerControls>(
    () => ({
      play: (next) => {
        dispatch(
          next === track ? { type: 'toggle' } : { type: 'select', track: next },
        );
      },
      toggle: () => {
        dispatch({ type: 'toggle' });
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
      // The seed is the action's, not the reducer's: a permutation has to be
      // reproducible from the number that produced it for the reducer to stay
      // pure and testable.
      shuffle: () => {
        dispatch({ type: 'shuffle', seed: Date.now() });
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
    }),
    [track],
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

    if (audio.src !== current.audio) {
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

    session.metadata = new MediaMetadata({
      title: current.titles[locale],
      artist: current.billing,
      album: 'vovazakharov.com/music',
    });
    session.playbackState = state.playing ? 'playing' : 'paused';

    const actions = [
      ['play', controls.toggle],
      ['pause', controls.toggle],
      ['nexttrack', controls.next],
      ['previoustrack', controls.previous],
    ] as const;

    for (const [action, handler] of actions) {
      session.setActionHandler(action, handler);
    }

    return () => {
      for (const [action] of actions) session.setActionHandler(action, null);
    };
  }, [current, state.playing, controls, locale]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

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

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks,
      state,
      elapsed,
      locale,
      labels: labels[locale],
      ...controls,
      ...(current && { current }),
    }),
    [tracks, state, elapsed, controls, current, locale, labels],
  );

  return (
    <PlayerContext {...{ value }}>
      {children}
      {current !== undefined && (
        <>
          <div className={classes['playerClearance']} aria-hidden />
          <PlayerBar />
        </>
      )}
    </PlayerContext>
  );
}
