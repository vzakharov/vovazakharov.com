import type { Frame } from './clip';

/** A poster's sheet, in room sides: 1.8 m by 1.5 m to whoever stands by it. */
export const POSTER_WIDE = 0.36;
export const POSTER_TALL = 0.3;

export const MARGIN = 0.014;
export const TITLE_CAP = 0.011;
export const CAPTION_CAP = 0.0085;
export const RULER_CAP = 0.007;
/** A line of capitals' height to the next line's, baseline to baseline. */
export const LEADING = 1.75;

/** The baselines, up from the sheet's foot: the caption's last line, the ruler, the title. */
export const CAPTION_BASE = MARGIN;
export const RULER_BASE = CAPTION_BASE + CAPTION_CAP * (LEADING + 1) + 0.01;
export const TITLE_BASE = POSTER_TALL - MARGIN - TITLE_CAP;
/** How far under the title's baseline its rule runs. */
export const RULE_UNDER = 0.007;

/** Where the drawing goes: between the title's rule and the ruler. */
export const DRAWING_FRAME: Frame = {
  low: [MARGIN, RULER_BASE + RULER_CAP + 0.008],
  high: [POSTER_WIDE - MARGIN, TITLE_BASE - RULE_UNDER - 0.005],
};

export const FRAME_WIDE = DRAWING_FRAME.high[0] - DRAWING_FRAME.low[0];
export const FRAME_TALL = DRAWING_FRAME.high[1] - DRAWING_FRAME.low[1];
