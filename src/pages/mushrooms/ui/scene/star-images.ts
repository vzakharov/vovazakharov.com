import * as Phaser from 'phaser';

import type { Circle } from '../../model/geometry';
import { DEPTHS } from './backdrop-depths';
import { starTexels } from './dusk-stars';
import { paintStar } from './paint-sky';

/** The texture every star is shown from: one star (`paintStar`) in the middle of its square. */
const STAR_KEY = 'dusk-star';

/** The shared star texture, painted afresh at `r` texels' radius on a `side`-texel square. */
function bakeStar(scene: Phaser.Scene, r: number, side: number): void {
  const found = scene.textures.exists(STAR_KEY)
    ? scene.textures.get(STAR_KEY)
    : scene.textures.createCanvas(STAR_KEY, side, side);
  if (!(found instanceof Phaser.Textures.CanvasTexture)) {
    throw new TypeError(`The texture ${STAR_KEY} is not a canvas`);
  }
  found.setSize(side, side);
  found.clear(0, 0, side, side, false);
  const scratch = scene.make.graphics({}, false);
  paintStar(scratch, { x: side / 2, y: side / 2, r });
  scratch.generateTexture(found.canvas, side, side).destroy();
  found.refresh();
}

/**
 * The dusk sky's `stars`, fixed on the screen at their depth, each an image
 * of one shared star texture scaled to its radius, so a frame draws them as
 * quads in one batch. Reuses `existing`'s images and destroys the spares;
 * the texture is baked again for `ratio` on every call.
 */
export function starImages(
  scene: Phaser.Scene,
  existing: readonly Phaser.GameObjects.Image[] | undefined,
  stars: readonly Circle[],
  ratio: number,
): Phaser.GameObjects.Image[] {
  const { r, side } = starTexels(
    Math.max(0, ...stars.map((star) => star.r)),
    ratio,
  );
  bakeStar(scene, r, side);
  for (const spare of existing?.slice(stars.length) ?? []) spare.destroy();
  return stars.map((star, index) =>
    (
      existing?.[index] ??
      scene.add.image(0, 0, STAR_KEY).setScrollFactor(0).setDepth(DEPTHS.stars)
    )
      .setTexture(STAR_KEY)
      .setPosition(star.x, star.y)
      .setScale(star.r / r),
  );
}
