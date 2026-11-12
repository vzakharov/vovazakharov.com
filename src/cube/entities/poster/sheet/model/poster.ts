import {
  bounds,
  LATIN,
  measure,
  placedAt,
  type Point,
  type Polyline,
  type Script,
  scriptOf,
  strokes,
} from '@/cube/shared/lettering';
import { hsl, hueOf, type Rgb } from '@/cube/shared/lib/colour';

import {
  CAPTION_CAP,
  clipped,
  DRAWING_FRAME,
  FRAME_TALL,
  FRAME_WIDE,
  LEADING,
  lengthLabel,
  MARGIN,
  POSTER_TALL,
  POSTER_WIDE,
  rounded,
  roundLength,
  RULE_UNDER,
  RULER_BASE,
  RULER_CAP,
  sidesPerMetre,
  TITLE_BASE,
  TITLE_CAP,
  visitorMetres,
} from '../../frame';
import { sketchOf, type Subject, subjectOf } from '../../subject';

type Tinted = { tint: Rgb };

/** The sheet itself: the first thing drawn, under everything inked on it. */
type Sheet = Tinted & {
  part: 'paper';
  sheetWide: number;
  sheetTall: number;
};

const INKED = ['title', 'drawing', 'ruler', 'caption'] as const;

/**
 * Strokes inked on the sheet, in room sides from its lower left corner, y
 * upward, with a nib `nibWide` across.
 */
export type Inked = Tinted & {
  part: (typeof INKED)[number];
  strokes: readonly Polyline[];
  nibWide: number;
};

/** One thing to draw of a poster; they are drawn in the order given. */
export type PosterPart = Sheet | Inked;

/** A lettering nib's width over the cap height it writes. */
const NIB = 0.12;
/** The drawing's nib, in room sides, and the least it thins to on a speck. */
const DRAWING_NIB = 0.0015;
const FINEST_NIB = 0.000_25;
/** How much of the frame a thing with no size of its own fills. */
const FILL = 0.8;
/** The longest a ruler may be, in room sides. */
const RULER_LONG = 0.12;
const TICK = 0.005;

const paperOf = (n: number): Rgb => hsl(hueOf(n), 0.16, 0.9);
const inkOf = (n: number): Rgb => hsl(hueOf(n), 0.3, 0.17);
/** The title's and the ruler's ink: quieter than the drawing's. */
const quietOf = (n: number): Rgb => hsl(hueOf(n), 0.14, 0.46);

const TEXT_WIDE = POSTER_WIDE - 2 * MARGIN;

/**
 * `text` in `script` with capitals `cap` tall, on the baseline `base`, set
 * from the left margin or up to the right one, and narrowed to fit between
 * them when it runs long.
 */
function written(
  text: string,
  script: Script,
  cap: number,
  base: number,
  flush: 'left' | 'right' = 'left',
): Polyline[] {
  const wide = measure(text, script) * cap;
  const fit = Math.min(1, TEXT_WIDE / wide);
  const left = flush === 'left' ? MARGIN : POSTER_WIDE - MARGIN - wide * fit;
  return placedAt(strokes(text, script), cap * fit, left, base);
}

/** How a thing `times` the visitor's size stands to them, in words. */
function standing(times: number): string {
  if (times > 1.25) return `${rounded(times)} TIMES YOUR SIZE`;
  if (times < 0.8) return `${rounded(1 / times)} TIMES SMALLER THAN YOU`;
  return 'YOUR SIZE';
}

/** A caption's two lines: what the thing is, then how big, and against you. */
export function captionOf(subject: Subject, n: number): readonly string[] {
  const { name, metres, measured, unsizedNote } = subject;
  if (measured === undefined) return [name, unsizedNote ?? ''];
  return [
    name,
    `${lengthLabel(metres)} ${measured}. ${standing(metres / visitorMetres(n))}.`,
  ];
}

const centre = (low: number, high: number): number => (low + high) / 2;

/**
 * Where the drawing's origin goes along one axis: the thing centred when it
 * fits between `low` and `high`, and otherwise its `focus` centred, as near as
 * leaves no part of the frame past the thing's end.
 */
function origin(
  [from, to]: readonly [number, number],
  focus: number,
  low: number,
  high: number,
): number {
  if (to - from <= high - low) return centre(low, high) - centre(from, to);
  const wanted = centre(low, high) - focus;
  return Math.min(Math.max(wanted, high - to), low - from);
}

/**
 * `subject` as floor `n` draws it: life-size in the visitor's frame, a thing
 * too big for the frame cut down to the detail round its focus, and a thing
 * with no size set to fill the frame.
 */
function drawn(subject: Subject, n: number): Inked {
  const { low, high } = DRAWING_FRAME;
  const sketch = sketchOf(subject, n);
  const [left, bottom, right, top] = bounds(sketch);
  const fill = Math.min(
    FRAME_WIDE / (right - left),
    FRAME_TALL / (top - bottom),
  );
  const unit =
    subject.measured === undefined
      ? fill * FILL
      : subject.metres * sidesPerMetre(n);
  const at: Point = [
    origin(
      [left * unit, right * unit],
      subject.focus[0] * unit,
      low[0],
      high[0],
    ),
    origin(
      [bottom * unit, top * unit],
      subject.focus[1] * unit,
      low[1],
      high[1],
    ),
  ];
  const size = Math.max(right - left, top - bottom) * unit;
  return {
    part: 'drawing',
    strokes: clipped(placedAt(sketch, unit, ...at), DRAWING_FRAME),
    nibWide: Math.min(Math.max(size / 60, FINEST_NIB), DRAWING_NIB),
    tint: inkOf(n),
  };
}

/** A ruler in the lower left: a round real length, ticked in fifths, named. */
function ruler(n: number): Polyline[] {
  const metres = roundLength(RULER_LONG / sidesPerMetre(n));
  const long = metres * sidesPerMetre(n);
  const ticks = [0, 1, 2, 3, 4, 5].map((fifth): Polyline => {
    const x = MARGIN + (long * fifth) / 5;
    const tall = fifth % 5 === 0 ? TICK : TICK / 2;
    return [
      [x, RULER_BASE],
      [x, RULER_BASE + tall],
    ];
  });
  return [
    [
      [MARGIN, RULER_BASE],
      [MARGIN + long, RULER_BASE],
    ],
    ...ticks,
    ...placedAt(
      strokes(lengthLabel(metres), LATIN),
      RULER_CAP,
      MARGIN + long + RULER_CAP,
      RULER_BASE,
    ),
  ];
}

/**
 * Floor `n`'s poster as the things to draw, in order: the paper; a quiet
 * title, with how tall the visitor now is; the thing they are now the size
 * of, life-size; a ruler; and a caption in the floor's script. The title and
 * the ruler stay in plain capitals on every floor.
 */
export function posterOf(n: number): PosterPart[] {
  const subject = subjectOf(n);
  const script = scriptOf(n);
  const [name = '', detail = ''] = captionOf(subject, n);
  const rule: Polyline = [
    [MARGIN, TITLE_BASE - RULE_UNDER],
    [POSTER_WIDE - MARGIN, TITLE_BASE - RULE_UNDER],
  ];
  return [
    {
      part: 'paper',
      sheetWide: POSTER_WIDE,
      sheetTall: POSTER_TALL,
      tint: paperOf(n),
    },
    {
      part: 'title',
      strokes: [
        ...written('ACTUAL SIZE', LATIN, TITLE_CAP, TITLE_BASE),
        ...written(
          `YOU: ${lengthLabel(visitorMetres(n))}`,
          LATIN,
          TITLE_CAP,
          TITLE_BASE,
          'right',
        ),
        rule,
      ],
      nibWide: TITLE_CAP * NIB,
      tint: quietOf(n),
    },
    drawn(subject, n),
    {
      part: 'ruler',
      strokes: ruler(n),
      nibWide: RULER_CAP * NIB,
      tint: quietOf(n),
    },
    {
      part: 'caption',
      strokes: [
        ...written(name, script, CAPTION_CAP, MARGIN + CAPTION_CAP * LEADING),
        ...written(detail, script, CAPTION_CAP, MARGIN),
      ],
      nibWide: CAPTION_CAP * NIB,
      tint: inkOf(n),
    },
  ];
}
