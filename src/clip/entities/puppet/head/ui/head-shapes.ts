import {
  ellipse,
  type Path,
  path,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import type { Hair, Look } from '../model/look';
import { mirrored } from './warp';

/**
 * The head's still outlines, face-on, in its own units: about 190 wide and
 * 340 tall, the origin between the eyes.
 */

export const LED_AT: Point = [-44, -30];
export const EYE_AT: Point = [44, -34];
/** Where the jaw plate hangs from, on the viewer's right; mirrored on the left. */
export const HINGE_AT: Point = [88, -2];

export const EAR = path('M 82,-40 C 114,-60 122,8 84,20 Z');
export const EAR_FOLD = path('M 92,-30 C 104,-30 104,-2 92,6');

export const SKULL = path(
  'M -86,-36 C -94,-130 -54,-176 0,-176 C 58,-176 96,-128 87,-36 C 85,12 72,66 42,104 C 26,124 -26,124 -42,104 C -72,66 -84,12 -86,-36 Z',
);

export const HAIR: Record<Hair, Path | null> = {
  cap: path(
    'M -82,-84 C -78,-152 -42,-182 2,-182 C 48,-182 82,-150 86,-82 C 78,-104 70,-118 58,-126 C 44,-116 24,-128 6,-134 C -28,-146 -62,-122 -82,-84 Z',
  ),
  mohawk: path(
    'M -26,-118 L -46,-214 L -18,-184 L -10,-250 L 8,-190 L 30,-232 L 30,-176 L 54,-196 L 28,-118 Z',
  ),
  bald: null,
  tuft: path(
    'M -40,-150 C -34,-206 22,-214 52,-158 C 30,-180 12,-170 2,-178 C -8,-166 -24,-170 -40,-150 Z',
  ),
};

export const EYE_WHITE = ellipse(EYE_AT, 25, 19);
export const EYE_BAG = path('M 24,-10 C 36,-2 54,-2 66,-12');

/** The fixed plate: the crest, the socket's surround, the nose and the cheekbones. */
export const MASK: Record<Look['eyes'], Path> = {
  one: path(
    'M -100,-22 L -78,-66 C -66,-98 -56,-130 -50,-192 C -34,-134 -22,-94 -8,-64 C 0,-44 4,-24 2,-8 C 30,2 62,-2 100,-20 L 88,10 L 86,36 C 60,58 -60,58 -86,36 L -88,10 Z',
  ),
  two: path(
    'M -100,-22 L -78,-66 C -66,-98 -56,-130 -50,-192 C -34,-134 -22,-96 0,-82 C 22,-96 34,-134 50,-192 C 56,-130 66,-98 78,-66 L 100,-22 L 88,10 L 86,36 C 60,58 -60,58 -86,36 L -88,10 Z',
  ),
};

const CREST_SHINE = path(
  'M -50,-180 C -46,-130 -34,-96 -16,-66 L -32,-70 C -48,-98 -54,-134 -50,-180 Z',
);
const CHEEK_SHADE = path(
  'M -86,-18 C -78,10 -72,26 -60,42 L -85,34 L -87,10 Z',
);

/** Light along each crest, on the plate's own metal. */
export const MASK_SHINE: Record<Look['eyes'], readonly Path[]> = {
  one: [CREST_SHINE],
  two: [CREST_SHINE, mirrored(CREST_SHINE)],
};
/** Shadow under each cheekbone. */
export const MASK_SHADE = [CHEEK_SHADE, mirrored(CHEEK_SHADE)] as const;
/** The seams, the cheekbones' creases and the scratches: thin ink on the plate. */
export const MASK_LINES = path(
  'M -66,2 C -50,14 -30,16 -16,8 M 66,6 C 50,18 30,18 16,10 M -76,-64 C -62,-58 -52,-58 -40,-62 M -66,-88 L -54,-76 M -30,24 L -22,36',
);
export const MASK_BOLTS: readonly Point[] = [
  [-70, -76],
  [-18, -52],
  [-74, 26],
  [74, 26],
];

export const SOCKET = ellipse(LED_AT, 27, 23);
export const NOSE = path(
  'M 0,-2 C -15,14 -20,36 -7,39 L 0,30 L 7,39 C 20,36 15,14 0,-2 Z',
);

/** The hinged plate at rest; it travels straight down with the jaw. */
export const JAW = path(
  'M -84,34 C -60,54 60,54 84,34 C 80,74 66,102 46,120 C 28,138 -28,138 -46,120 C -66,102 -80,74 -84,34 Z',
);
export const JAW_SHADE = path(
  'M -72,62 C -62,92 -48,110 -36,118 L -54,114 C -66,100 -74,82 -72,62 Z',
);
export const JAW_SHINE = path('M 32,114 C 46,104 58,88 64,72');
export const JAW_VENTS = path('M -14,106 L 14,106 M -10,116 L 10,116');
export const GOATEE = path(
  'M -12,126 L -24,154 L -9,146 L -2,172 L 7,146 L 22,156 L 12,126 Z',
);

/** A row of `count` teeth `width` across, hanging from `y`, the middle ones longest. */
function teeth(
  y: number,
  height: number,
  count: number,
  width: number,
  sag: number,
  points: 'down' | 'up',
): Path {
  return Array.from({ length: count }, (_, n) => {
    const t = (n + 0.5) / count - 0.5;
    const x = t * width;
    const top = y + sag * (1 - 4 * t * t);
    const half = ((width / count) * (0.9 - Math.abs(t) * 0.35)) / 2;
    const bottom = top + height * (1 - Math.abs(t) * 0.5);
    const [wide, narrow] = points === 'down' ? [top, bottom] : [bottom, top];
    return polygon([
      [x - half, wide],
      [x + half, wide],
      [x + half * 0.72, narrow],
      [x - half * 0.72, narrow],
    ]);
  }).flat();
}

export const UPPER_TEETH = teeth(42, 28, 8, 106, 6, 'down');
export const LOWER_TEETH = teeth(54, 24, 8, 98, 8, 'up');

/** A bead of sweat hanging from the origin. */
export const DROP = path('M 0,0 C -8,14 -8,22 0,24 C 8,22 8,14 0,0 Z');
/** Where each bead starts, most urgent first. */
export const DROP_STARTS: readonly Point[] = [
  [70, -110],
  [-64, -128],
  [94, -50],
  [-98, 20],
  [30, -150],
  [100, 40],
];
