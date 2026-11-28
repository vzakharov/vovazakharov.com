import type { Point, Scaling } from '@/scene/shared/lib/plane';

import { FILM_QUERY, STILL_QUERY } from '@/clip/shared/film';
import { STAGE } from '@/clip/shared/ink';

/** Where the stage's top-left corner sits in a viewport, in CSS pixels, and how much it is scaled. */
export type StageFit = Scaling & { corner: Point };

/** The stage letterboxed into a `width` × `height` viewport: as large as fits, centred. */
export function fitStage(width: number, height: number): StageFit {
  const scale = Math.min(width / STAGE.width, height / STAGE.height);
  return {
    corner: {
      x: (width - STAGE.width * scale) / 2,
      y: (height - STAGE.height * scale) / 2,
    },
    scale,
  };
}

/** What the page does: plays against the song, holds a still, or waits on a film script. */
export type PlayerMode =
  | { kind: 'play' }
  | { kind: 'still'; t: number }
  | { kind: 'film' };

/** The mode a page address asks for: `?film`, `?t=<seconds>`, or neither. */
export function readMode(search: string): PlayerMode {
  const query = new URLSearchParams(search);
  if (query.has(FILM_QUERY)) return { kind: 'film' };
  const still = Number(query.get(STILL_QUERY) ?? Number.NaN);
  return Number.isFinite(still)
    ? { kind: 'still', t: still }
    : { kind: 'play' };
}
