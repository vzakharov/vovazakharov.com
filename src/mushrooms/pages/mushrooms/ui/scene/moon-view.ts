import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { SUPERSAMPLE } from './baking';
import { drawMoon, moonReach } from './paint-moon';

/** The moon's outline, in CSS px. */
const MOON_INK = 1.5;

/**
 * The meadow's moon as a picture: drawn once per paint (`drawMoon`) into
 * `whole`, a texel to a device pixel, and shown in `face`, which stands on
 * the screen, fades whole by its alpha, and has the clouds in front of it
 * erased from it on the frames any is.
 */
export class MoonView {
  private readonly face: Phaser.GameObjects.RenderTexture;
  private readonly whole: Phaser.GameObjects.RenderTexture;
  private readonly pen: Phaser.GameObjects.Graphics;
  /** Where the moon is drawn at `SUPERSAMPLE` before it is shrunk into `whole`. */
  private readonly scratch: Phaser.GameObjects.RenderTexture;
  /** From the picture's middle to its edge, in CSS px. */
  private half = 0;
  private ratio = 1;
  /**
   * Where the clouds cut out of `face` stood, in device pixels from its
   * corner, and how stretched: `''` while it holds `whole` uncut, `undefined`
   * once it is to be drawn afresh.
   */
  private cut: string | undefined;

  constructor(scene: Phaser.Scene, depth: number) {
    this.face = scene.add
      .renderTexture(0, 0, 2, 2)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(0);
    this.whole = scene.make
      .renderTexture({ width: 2, height: 2 }, false)
      .setOrigin(0, 0);
    this.pen = scene.make.graphics({}, false);
    this.scratch = scene.make
      .renderTexture({ width: 2, height: 2 }, false)
      .setOrigin(0, 0)
      .setScale(1 / SUPERSAMPLE);
  }

  /** Draws the moon of radius `r` at `ratio` device pixels to the CSS px. */
  paint(r: number, ratio: number): void {
    const { face, whole, pen, scratch } = this;
    const side = Math.max(2, Math.ceil(2 * moonReach(r, MOON_INK) * ratio));
    const half = side / 2 / ratio;
    this.half = half;
    this.ratio = ratio;
    drawMoon(pen.clear(), { x: half, y: half, r }, MOON_INK);
    scratch.resize(side * SUPERSAMPLE, side * SUPERSAMPLE);
    scratch.camera
      .setOrigin(0, 0)
      .setZoom(ratio * SUPERSAMPLE)
      .setScroll(0, 0);
    scratch.clear().draw(pen).render();
    whole.resize(side, side);
    whole.camera.setOrigin(0, 0).setZoom(1).setScroll(0, 0);
    whole.clear().draw(scratch).render();
    // Drawn into `face` through its zoom, a texel lands on a texel.
    whole.setScale(1 / ratio);
    face.resize(side, side).setScale(1 / ratio);
    face.camera.setOrigin(0, 0).setZoom(ratio).setScroll(0, 0);
    this.cut = undefined;
  }

  /**
   * Shows the moon round `at` at `alpha`, its picture on whole device
   * pixels, with `clouds` — graphics standing on the screen, the same as it —
   * cut out of it, each on the device pixel nearest it. The picture is drawn
   * afresh only when a cut moves by a device pixel, so a cloud drifting a
   * few pixels a second costs a few draws a second.
   */
  show(
    at: Point,
    alpha: number,
    clouds: readonly Phaser.GameObjects.Graphics[],
  ): void {
    const { face, whole, half, ratio } = this;
    const left = Math.round((at.x - half) * ratio) / ratio;
    const top = Math.round((at.y - half) * ratio) / ratio;
    face.setPosition(left, top).setAlpha(alpha);
    if (alpha <= 0) return;
    const cuts = clouds.map((cloud) => ({
      cloud,
      across: Math.round((cloud.x - left) * ratio),
      down: Math.round((cloud.y - top) * ratio),
    }));
    const cut = cuts
      .map(({ cloud, across, down }) =>
        [across, down, cloud.scaleX, cloud.scaleY].join(','),
      )
      .join(';');
    if (cut === this.cut) return;
    this.cut = cut;
    face.clear().draw(whole);
    for (const { cloud, across, down } of cuts) {
      face.erase(cloud, across / ratio - cloud.x, down / ratio - cloud.y);
    }
    face.render();
  }
}
