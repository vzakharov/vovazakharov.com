/**
 * Where a baked picture's texels lie, pure: the backdrop and the buttons are
 * drawn once a paint into textures the frame then only shows, and these say
 * which device pixels each texture covers and how it is baked tile by tile.
 */

import type { Circle, Cornered, Lefted, Wide } from '../../model/geometry';

/** A stretch across, in CSS px or texels: where it starts and how far it runs. */
export type Span = Lefted & Wide;

/**
 * How many texels a side a bake draws per device pixel before shrinking to
 * one: a framebuffer draws with no multisampling, so a shape baked at one
 * texel a pixel shows a stepped edge the screen's own canvas smooths. Two a
 * side, shrunk by exactly half, averages four samples to a pixel.
 */
export const SUPERSAMPLE = 2;

/**
 * How far a button's face reaches from its middle, in the button's radii, and
 * CSS pixels on top: past the disc, its ink ring and the shadow under it.
 */
const FACE_REACH = 1.25;
const FACE_MARGIN = 2;

/**
 * A button's face in device pixels: its top-left texel's pixel, whole so a
 * face at rest lies texel for pixel, its side, even, and the button's middle
 * within it as a share of the side, which is where it turns and presses.
 */
export type FaceFrame = Cornered & {
  side: number;
  origin: { x: number; y: number };
};

export function faceFrame({ x, y, r }: Circle, ratio: number): FaceFrame {
  const reach = r * FACE_REACH + FACE_MARGIN;
  const left = Math.floor((x - reach) * ratio);
  const top = Math.floor((y - reach) * ratio);
  // Even, as a render texture rounds its size up to one.
  const side = 2 * Math.ceil((reach * 2 * ratio + 1) / 2);
  return {
    left,
    top,
    side,
    origin: { x: (x * ratio - left) / side, y: (y * ratio - top) / side },
  };
}

/**
 * The widest texture a picture is baked into, in texels: a world-wide
 * picture on a dense screen passes the 4096 an older phone allows, so it is
 * baked as columns this wide at most, side by side.
 */
const WIDEST_TEXTURE = 2048;

/**
 * The columns, in texels, that a picture `width` texels wide is baked in,
 * left to right, each at most `widest` and all but the last even, as a
 * render texture rounds its size up to one.
 */
export function pictureColumns(
  width: number,
  widest: number = WIDEST_TEXTURE,
): Span[] {
  const count = Math.max(1, Math.ceil(width / widest));
  const each = 2 * Math.ceil(width / count / 2);
  return Array.from({ length: count }, (_, index) => ({
    left: index * each,
    across: Math.min(each, width - index * each),
  }));
}

/** The top-left corners of the tiles `tile` texels a side that cover a picture `width` by `height` texels, row by row: one square baked at a time. */
export function bakeTiles(
  width: number,
  height: number,
  tile: number,
): Cornered[] {
  const tiles: Cornered[] = [];
  for (let top = 0; top < height; top += tile) {
    for (let left = 0; left < width; left += tile) tiles.push({ left, top });
  }
  return tiles;
}

/**
 * The stretch `from` to `to`, in CSS px, widened to whole device pixels at
 * `ratio` either way, so a picture baked over it lays its texels on the very
 * pixels a screen-wide bake does.
 */
export function onPixels(
  from: number,
  to: number,
  ratio: number,
): readonly [number, number] {
  return [Math.floor(from * ratio) / ratio, Math.ceil(to * ratio) / ratio];
}
