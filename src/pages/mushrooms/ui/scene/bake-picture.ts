import type * as Phaser from 'phaser';

import type { Layered } from '../../model/ground';
import {
  bakeTiles,
  onPixels,
  pictureColumns,
  type Span,
  SUPERSAMPLE,
} from './baking';
import type { Band } from './grain';
import type { MeadowLayout } from './layout';

/**
 * A picture baked in columns side by side, left to right, each texture at
 * most `WIDEST_TEXTURE` texels wide.
 */
export type Picture = Phaser.GameObjects.RenderTexture[];

/** The side of a finished picture's square baked at a time, in texels, so the supersampled scratch stays 2048² whatever the screen. */
export const TILE = 1024;

/**
 * What a picture is baked from and where it lies: its stretch across the
 * screen, the rows it covers, its depth, and how much of the camera's bob it
 * takes (`GROUND_BOB` for the ground's, none for the sky's).
 */
export type Bake = Layered & {
  sources: readonly Phaser.GameObjects.GameObject[];
  span: Span;
  rows: Band;
  bobbing?: number;
};

/**
 * Bakes `sources`, drawn in CSS pixels, into a picture over `span` and
 * `rows` at `ratio` device pixels each, so a texel lands on one device
 * pixel, reusing `existing`'s columns: column by column, tile by tile, each
 * tile drawn into `scratch` at `SUPERSAMPLE` times that and shrunk into
 * place. The picture stands on the screen, bobbing by `bobbing`, and stacks
 * at `depth`.
 */
export function bake(
  scene: Phaser.Scene,
  existing: Picture | undefined,
  scratch: Phaser.GameObjects.RenderTexture,
  { sources, span, rows, depth, bobbing = 0 }: Bake,
  ratio: number,
): Picture {
  const columns = pictureColumns(Math.ceil(span.across * ratio));
  for (const spare of existing?.slice(columns.length) ?? []) spare.destroy();
  const tall = Math.max(2, Math.ceil((rows.bottom - rows.top) * ratio));
  scratch.camera.setOrigin(0, 0).setZoom(ratio * SUPERSAMPLE);
  return columns.map(({ left, across }, index) => {
    const picture = (
      existing?.[index] ?? scene.add.renderTexture(0, 0, 2, 2)
    ).setOrigin(0, 0);
    picture.resize(Math.max(2, across), tall);
    picture.camera.setOrigin(0, 0).setZoom(1).setScroll(0, 0);
    const x = span.left + left / ratio;
    picture
      .setPosition(x, rows.top)
      .setScale(1 / ratio)
      .setScrollFactor(0, bobbing)
      .setDepth(depth)
      .clear()
      .render();
    for (const tile of bakeTiles(picture.width, picture.height, TILE)) {
      scratch.camera.setScroll(
        x + tile.left / ratio,
        rows.top + tile.top / ratio,
      );
      scratch.clear().draw(sources).render();
      picture.draw(scratch, tile.left, tile.top).render();
    }
    return picture;
  });
}

/** The square `reach` either way of the sun's middle, across and down, on whole device pixels, never above the screen's top. */
export function aboutTheSun(
  { sun }: MeadowLayout,
  reach: number,
  ratio: number,
): Pick<Bake, 'span' | 'rows'> {
  const [left, right] = onPixels(sun.x - reach, sun.x + reach, ratio);
  const [top, bottom] = onPixels(
    Math.max(0, sun.y - reach),
    sun.y + reach,
    ratio,
  );
  return { span: { left, across: right - left }, rows: { top, bottom } };
}
