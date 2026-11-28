import type { Pen } from '../ink';
import { dotText } from './dot-text';
import { TAPE_PALETTE } from './palette-tape';

/** What the VCR shows over the picture. Every field is optional. */
export type Osd = {
  /** The deck's state in the top left: `PLAY ►` by default, a red `●REC`, or nothing. */
  deck?: 'play' | 'rec' | 'stop';
  /** The clip time the tape counter reads `0:00:00` at. */
  counterFrom?: number;
  /** The channel tuned in. */
  channel?: number;
  /** Seconds since that channel was tuned; its number shows for the first. */
  sinceChange?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** The tape counter at `seconds`: `H:MM:SS`, from zero, never negative. */
export function counterText(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 3600)}:${pad(Math.floor(whole / 60) % 60)}:${pad(whole % 60)}`;
}

/** The channel's number as the TV shows it: `CH 07`. */
export const channelText = (channel: number): string =>
  `CH ${pad(Math.max(0, Math.floor(channel)))}`;

// How long a newly tuned channel's number stays up.
const CHANNEL_SHOWN = 1;

/** The VCR's display over a picture whose top-left corner is at `origin`. */
export function drawOsd(
  pen: Pen,
  osd: Osd,
  [x, y]: readonly [number, number],
): void {
  const { t } = pen;
  const { deck = 'play', counterFrom = 0, channel, sinceChange } = osd;
  const style = {
    dot: 4,
    color: TAPE_PALETTE.osd,
    shadow: TAPE_PALETTE.osdShadow,
  };
  if (deck === 'rec') {
    // The dot blinks at a second's beat; the word holds.
    const lit = Math.floor(t * 2) % 2 === 0;
    dotText(pen, lit ? '●REC' : ' REC', [x + 48, y + 44], {
      ...style,
      color: TAPE_PALETTE.osdRec,
    });
  } else if (deck === 'play') {
    dotText(pen, 'PLAY ►', [x + 48, y + 44], style);
  }
  dotText(pen, `SP ${counterText(t - counterFrom)}`, [x + 48, y + 648], style);
  if (
    channel !== undefined &&
    sinceChange !== undefined &&
    sinceChange >= 0 &&
    sinceChange < CHANNEL_SHOWN
  ) {
    dotText(pen, channelText(channel), [x + 912, y + 124], {
      ...style,
      dot: 7,
      color: TAPE_PALETTE.osdChannel,
      align: 'right',
    });
  }
}
