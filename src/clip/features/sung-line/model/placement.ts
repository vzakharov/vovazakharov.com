import type { Point } from '@/clip/shared/ink';
import { type Line, type LineKind, sectionAt } from '@/clip/shared/score';

/**
 * How a line is set: in the tape's dot face, a karaoke caption of the
 * channel, over a broadcast; in the marker hand over reality.
 */
type Setting = {
  idiom: 'dot' | 'hand';
  align: 'left' | 'center' | 'right';
  /** A dot's pitch for the dot face, a capital's height for the hand, in stage units. */
  size: number;
  /** The most characters a row holds before the line breaks in two. */
  rowChars: number;
  /** How unsteady the hand, 0 to 1. */
  jitter?: number;
};

/** A line's setting, and the top of the text at its left edge, centre or right edge by `align`. */
export type Placement = Setting & { at: Point };

/** A setting for the lines sung in `sections`, of `kinds` where given, set at each of `spots` in turn. */
type Rule = Setting & {
  sections: readonly string[];
  kinds?: readonly LineKind[];
  spots: readonly Point[];
};

const VERSE = ['verse, first half', 'verse, second half'];
/** The first call is shouted on the double time's last beat. */
const CALLED = ['double time', ...VERSE];

/**
 * Where the words go, a section at a time: the first rule matching the
 * section a line is mostly sung in, and its kind, places it. A broadcast is 4:3 in the
 * stage's middle (x 160 to 1120), with the VCR's display in its corners.
 */
const RULES: readonly Rule[] = [
  // A face on black, filling the frame: the line under its chin, at the left.
  {
    sections: ['intro'],
    idiom: 'hand',
    align: 'left',
    size: 30,
    rowChars: 30,
    jitter: 0.15,
    spots: [[84, 612]],
  },
  // The calls cut to a channel: shouted big across its middle, clear of the
  // channel's own lettering top and bottom.
  {
    sections: CALLED,
    kinds: ['call'],
    idiom: 'dot',
    align: 'center',
    size: 8,
    rowChars: 16,
    spots: [[640, 330]],
  },
  // The bedroom: low on the left, on the dark of the floor.
  {
    sections: VERSE,
    idiom: 'hand',
    align: 'left',
    size: 28,
    rowChars: 34,
    jitter: 0.2,
    spots: [[72, 640]],
  },
  // The meadow and its inserts: a karaoke caption above the letter blocks.
  {
    sections: ['chorus'],
    idiom: 'dot',
    align: 'center',
    size: 5,
    rowChars: 30,
    spots: [[640, 548]],
  },
  // The crawl through the channels: each chant a caption of its own, above
  // the channel's own.
  {
    sections: ['pre-bridge'],
    idiom: 'dot',
    align: 'center',
    size: 5,
    rowChars: 20,
    spots: [[640, 500]],
  },
  // The ward, falling asleep: each «Хорошо» scrawled somewhere else.
  {
    sections: ['melodic bridge'],
    idiom: 'hand',
    align: 'left',
    size: 40,
    rowChars: 20,
    jitter: 0.45,
    spots: [
      [110, 120],
      [760, 590],
      [150, 600],
      [720, 110],
    ],
  },
  // The last «Хорошо!», thrown across the top.
  {
    sections: ['breakdown'],
    idiom: 'hand',
    align: 'center',
    size: 104,
    rowChars: 12,
    jitter: 0.3,
    spots: [[640, 48]],
  },
];

/** Where line `n` of the song is set; throws for a line no rule places. */
export function placementOf(line: Line, n: number): Placement {
  const { name } = sectionAt((line.from + line.to) / 2);
  const rule = RULES.find(
    ({ sections, kinds }) =>
      sections.includes(name) && (kinds?.includes(line.kind) ?? true),
  );
  if (!rule) throw new Error(`No placement for «${line.text}» in ${name}`);
  const at = rule.spots[n % rule.spots.length];
  if (!at) throw new Error(`No spot for «${line.text}» in ${name}`);
  return { ...rule, at };
}
