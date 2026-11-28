import { arc, dot, type Glyph, line, type Stroke } from './glyph';

// The bowls several letters share, open on the stem's side.
const upperBowl = (stem: number, right: number): Stroke => [
  [stem, 0],
  [right - 0.24, 0],
  ...arc(right - 0.24, 0.24, 0.24, 0.24, -90, 90),
  [stem, 0.48],
];
const lowerBowl = (stem: number, top: number, right: number): Stroke => {
  const ry = (1 - top) / 2;
  return [
    [stem, top],
    [right - ry, top],
    ...arc(right - ry, top + ry, ry, ry, -90, 90),
    [stem, 1],
  ];
};
// The soft sign's bowl hangs off the bottom of its stem, drawn up from it.
const softSign = (stem: number, right: number): Stroke => [
  [stem, 0],
  [stem, 1],
  [right - 0.27, 1],
  ...arc(right - 0.27, 0.73, 0.27, 0.27, 90, -90),
  [stem, 0.46],
];
const E: readonly Stroke[] = [
  line(0.56, 0, 0.05, 0, 0.05, 1, 0.56, 1),
  line(0.05, 0.5, 0.46, 0.5),
];
const I: Stroke = line(0.05, 0, 0.05, 1, 0.65, 0, 0.65, 1);

/** The Russian capitals, Ё included. */
export const CYRILLIC: Readonly<Record<string, Glyph>> = {
  А: {
    setWidth: 0.78,
    strokes: [line(0, 1, 0.39, 0, 0.78, 1), line(0.15, 0.64, 0.63, 0.64)],
  },
  Б: {
    setWidth: 0.64,
    strokes: [line(0.6, 0, 0.05, 0, 0.05, 1), lowerBowl(0.05, 0.44, 0.64)],
  },
  В: {
    setWidth: 0.64,
    strokes: [
      line(0.05, 0, 0.05, 1),
      upperBowl(0.05, 0.58),
      lowerBowl(0.05, 0.48, 0.64),
    ],
  },
  Г: { setWidth: 0.56, strokes: [line(0.05, 1, 0.05, 0, 0.56, 0)] },
  Д: {
    setWidth: 0.82,
    strokes: [
      line(0.08, 0.84, 0.18, 0.45, 0.22, 0, 0.7, 0, 0.7, 0.84),
      line(0, 1.16, 0, 0.84, 0.82, 0.84, 0.82, 1.16),
    ],
  },
  Е: { setWidth: 0.56, strokes: E },
  Ё: { setWidth: 0.56, strokes: [...E, dot(0.17, -0.2), dot(0.41, -0.2)] },
  Ж: {
    setWidth: 1,
    strokes: [
      line(0.5, 0, 0.5, 1),
      line(0.04, 0, 0.44, 0.5, 0.02, 1),
      line(0.96, 0, 0.56, 0.5, 0.98, 1),
    ],
  },
  З: {
    setWidth: 0.62,
    strokes: [
      [
        ...arc(0.29, 0.24, 0.26, 0.24, -165, 90),
        ...arc(0.29, 0.74, 0.3, 0.26, -90, 160),
      ],
    ],
  },
  И: { setWidth: 0.7, strokes: [I] },
  Й: { setWidth: 0.7, strokes: [I, arc(0.35, -0.24, 0.16, 0.1, 180, 0)] },
  К: {
    setWidth: 0.66,
    strokes: [
      line(0.05, 0, 0.05, 1),
      line(0.62, 0, 0.05, 0.56),
      line(0.26, 0.37, 0.66, 1),
    ],
  },
  Л: {
    setWidth: 0.7,
    strokes: [line(0, 1, 0.12, 0.9, 0.2, 0.4, 0.25, 0, 0.65, 0, 0.65, 1)],
  },
  М: {
    setWidth: 0.86,
    strokes: [line(0.05, 1, 0.1, 0, 0.43, 0.72, 0.76, 0, 0.81, 1)],
  },
  Н: {
    setWidth: 0.66,
    strokes: [
      line(0.05, 0, 0.05, 1),
      line(0.61, 0, 0.61, 1),
      line(0.05, 0.5, 0.61, 0.5),
    ],
  },
  О: { setWidth: 0.76, strokes: [arc(0.38, 0.5, 0.35, 0.5, -90, 270)] },
  П: { setWidth: 0.66, strokes: [line(0.05, 1, 0.05, 0, 0.61, 0, 0.61, 1)] },
  Р: { setWidth: 0.6, strokes: [line(0.05, 0, 0.05, 1), upperBowl(0.05, 0.6)] },
  С: { setWidth: 0.68, strokes: [arc(0.4, 0.5, 0.37, 0.5, -38, -322)] },
  Т: {
    setWidth: 0.66,
    strokes: [line(0, 0, 0.66, 0), line(0.33, 0, 0.33, 1)],
  },
  У: {
    setWidth: 0.66,
    strokes: [
      line(0.02, 0, 0.34, 0.62),
      line(0.66, 0, 0.3, 0.86, 0.2, 1, 0.06, 1),
    ],
  },
  Ф: {
    setWidth: 0.86,
    strokes: [
      line(0.43, -0.06, 0.43, 1.06),
      arc(0.43, 0.42, 0.41, 0.3, 0, 360),
    ],
  },
  Х: { setWidth: 0.66, strokes: [line(0, 0, 0.66, 1), line(0.66, 0, 0, 1)] },
  Ц: {
    setWidth: 0.74,
    strokes: [
      line(0.05, 0, 0.05, 1, 0.74, 1, 0.74, 1.18),
      line(0.62, 0, 0.62, 1),
    ],
  },
  Ч: {
    setWidth: 0.62,
    strokes: [
      line(0.05, 0, 0.05, 0.3, 0.12, 0.47, 0.3, 0.53, 0.57, 0.46),
      line(0.57, 0, 0.57, 1),
    ],
  },
  Ш: {
    setWidth: 0.88,
    strokes: [line(0.05, 0, 0.05, 1, 0.83, 1, 0.83, 0), line(0.44, 0, 0.44, 1)],
  },
  Щ: {
    setWidth: 0.94,
    strokes: [
      line(0.05, 0, 0.05, 1, 0.94, 1, 0.94, 1.18),
      line(0.44, 0, 0.44, 1),
      line(0.83, 0, 0.83, 1),
    ],
  },
  Ъ: { setWidth: 0.74, strokes: [line(0, 0, 0.16, 0), softSign(0.16, 0.74)] },
  Ы: { setWidth: 0.84, strokes: [softSign(0.05, 0.6), line(0.8, 0, 0.8, 1)] },
  Ь: { setWidth: 0.6, strokes: [softSign(0.05, 0.6)] },
  Э: {
    setWidth: 0.68,
    strokes: [arc(0.3, 0.5, 0.36, 0.5, -142, 142), line(0.26, 0.5, 0.64, 0.5)],
  },
  Ю: {
    setWidth: 0.96,
    strokes: [
      line(0.05, 0, 0.05, 1),
      line(0.05, 0.5, 0.31, 0.5),
      arc(0.63, 0.5, 0.31, 0.5, 180, 540),
    ],
  },
  Я: {
    setWidth: 0.62,
    strokes: [
      [
        ...line(0.57, 1, 0.57, 0, 0.32, 0),
        ...arc(0.32, 0.26, 0.26, 0.26, -90, -270),
        [0.57, 0.52],
      ],
      line(0.34, 0.52, 0.03, 1),
    ],
  },
};
