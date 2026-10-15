import { useEffect } from 'react';

import type { Locale } from '@/shared/i18n';
import { useScriptPreference } from '@/shared/lib/use-script-preference';
import { spelledText } from '@/shared/music-catalogue/index.node-safe';

import { billingText, type PlayerTrack } from './player-state';
import type { PlayerControls } from './use-audio-player';

type MediaSessionInput = {
  current: PlayerTrack | undefined;
  playing: boolean;
  controls: PlayerControls;
  /** The page's, which the lock screen titles the track in. */
  locale: Locale;
  /** Set while other media on the page holds the lock screen. */
  yielded: boolean;
};

/**
 * Lock screen, OS media keys, headphone buttons and car controls, all driving
 * the same queue rather than a second copy of its logic.
 */
export function useMediaSession({
  current,
  playing,
  controls,
  locale,
  yielded,
}: MediaSessionInput) {
  const { script } = useScriptPreference();

  useEffect(() => {
    const session = navigator.mediaSession as MediaSession | undefined;

    if (session === undefined || current === undefined) return;

    // The previous run's cleanup has already cleared the handlers; a state left
    // at `paused` would tell the browser nothing plays under a playing video.
    if (yielded) {
      session.playbackState = 'none';

      return;
    }

    session.metadata = new MediaMetadata({
      title: spelledText(current.titles[locale], script),
      artist: billingText(current.billing[locale], script),
      album: 'vovazakharov.com/music',
    });
    session.playbackState = playing ? 'playing' : 'paused';

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
  }, [current, playing, controls, locale, script, yielded]);
}
