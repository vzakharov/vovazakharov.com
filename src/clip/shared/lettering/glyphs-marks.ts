import { arc, dot, type Glyph, line } from './glyph';

/** The digits. */
export const DIGITS: Readonly<Record<string, Glyph>> = {
  '0': { setWidth: 0.6, strokes: [arc(0.3, 0.5, 0.28, 0.5, -90, 270)] },
  '1': { setWidth: 0.44, strokes: [line(0.04, 0.26, 0.32, 0, 0.32, 1)] },
  '2': {
    setWidth: 0.6,
    strokes: [
      [...arc(0.29, 0.27, 0.26, 0.26, -170, 25), ...line(0.03, 1, 0.6, 1)],
    ],
  },
  '3': {
    setWidth: 0.6,
    strokes: [
      [
        ...arc(0.28, 0.24, 0.25, 0.24, -165, 90),
        ...arc(0.28, 0.74, 0.29, 0.26, -90, 160),
      ],
    ],
  },
  '4': {
    setWidth: 0.62,
    strokes: [line(0.46, 1, 0.46, 0, 0.02, 0.68, 0.62, 0.68)],
  },
  '5': {
    setWidth: 0.6,
    strokes: [
      [
        ...line(0.55, 0, 0.11, 0, 0.07, 0.45),
        ...arc(0.3, 0.69, 0.28, 0.31, -125, 160),
      ],
    ],
  },
  '6': {
    setWidth: 0.6,
    strokes: [
      [
        ...line(0.5, 0, 0.2, 0.24, 0.04, 0.6),
        ...arc(0.31, 0.7, 0.27, 0.3, 180, 540),
      ],
    ],
  },
  '7': { setWidth: 0.6, strokes: [line(0.02, 0, 0.58, 0, 0.22, 1)] },
  '8': {
    setWidth: 0.6,
    strokes: [
      arc(0.3, 0.24, 0.22, 0.24, 90, 450),
      arc(0.3, 0.74, 0.28, 0.26, -90, 270),
    ],
  },
  '9': {
    setWidth: 0.6,
    strokes: [
      arc(0.29, 0.3, 0.27, 0.3, 0, 360),
      line(0.56, 0.3, 0.5, 0.7, 0.2, 1),
    ],
  },
};

/** Punctuation and the space. */
export const MARKS: Readonly<Record<string, Glyph>> = {
  ' ': { setWidth: 0.4, strokes: [] },
  '.': { setWidth: 0.24, strokes: [dot(0.1, 0.95)] },
  ',': { setWidth: 0.24, strokes: [line(0.13, 0.9, 0.03, 1.16)] },
  '!': {
    setWidth: 0.26,
    strokes: [line(0.12, 0, 0.12, 0.66), dot(0.12, 0.95)],
  },
  '?': {
    setWidth: 0.56,
    strokes: [
      [...arc(0.28, 0.25, 0.25, 0.25, -170, 60), ...line(0.28, 0.66)],
      dot(0.28, 0.95),
    ],
  },
  ':': { setWidth: 0.24, strokes: [dot(0.1, 0.35), dot(0.1, 0.95)] },
  ';': {
    setWidth: 0.24,
    strokes: [dot(0.12, 0.35), line(0.13, 0.9, 0.03, 1.16)],
  },
  '-': { setWidth: 0.44, strokes: [line(0.04, 0.55, 0.4, 0.55)] },
  '+': {
    setWidth: 0.56,
    strokes: [line(0.04, 0.55, 0.52, 0.55), line(0.28, 0.31, 0.28, 0.79)],
  },
  '«': {
    setWidth: 0.58,
    strokes: [
      line(0.28, 0.34, 0.06, 0.56, 0.28, 0.78),
      line(0.54, 0.34, 0.32, 0.56, 0.54, 0.78),
    ],
  },
  '»': {
    setWidth: 0.58,
    strokes: [
      line(0.04, 0.34, 0.26, 0.56, 0.04, 0.78),
      line(0.3, 0.34, 0.52, 0.56, 0.3, 0.78),
    ],
  },
  '"': {
    setWidth: 0.36,
    strokes: [line(0.1, 0, 0.08, 0.26), line(0.28, 0, 0.26, 0.26)],
  },
  "'": { setWidth: 0.2, strokes: [line(0.1, 0, 0.08, 0.26)] },
  '(': { setWidth: 0.34, strokes: [arc(0.5, 0.5, 0.4, 0.62, -125, -235)] },
  ')': { setWidth: 0.34, strokes: [arc(-0.16, 0.5, 0.4, 0.62, -55, 55)] },
};
