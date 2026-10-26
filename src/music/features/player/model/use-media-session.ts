import { useEffect } from 'react';

import type { WithLocale } from '@/kernel/shared/i18n';
import { useScriptPreference } from '@/kernel/shared/lib/use-script-preference';

import {
  billingText,
  type PlayerTrack,
  spelledText,
} from '@/music/shared/catalogue/index.node-safe';

import type { Playing } from './player-state';
import type { WithControls } from './use-audio-player';

/** The locale is the page's, which the lock screen titles the track in. */
type MediaSessionInput = WithControls &
  WithLocale &
  Playing & {
    current: PlayerTrack | undefined;
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
