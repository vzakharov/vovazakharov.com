/**
 * Fading a cloud's twin — its dark rain twin, its dusk twin — in over the
 * cloud whole. A graphics' own alpha falls on each puff, so the puffs'
 * overlaps would show through one another; between 0 and 1 the twin is drawn
 * whole off screen and its filter camera lays it on at the fade. Where
 * filters are not to be had (the canvas renderer) it falls back to the
 * graphics' own alpha.
 */

import type * as Phaser from 'phaser';

/**
 * Points each of `twins`' filter cameras at the screen as `camera` draws it.
 * A twin stands fixed on the screen, so its filter camera sees the screen as
 * the scene's camera does, zoom and all, but unscrolled. Run on every paint,
 * after the camera's zoom is set.
 */
export function focusTwins(
  twins: readonly Phaser.GameObjects.Graphics[],
  camera: Phaser.Cameras.Scene2D.Camera,
): void {
  for (const twin of twins) {
    if (twin.filters === null) continue;
    twin
      .setFiltersAutoFocus(false)
      .setFiltersFocusContext(true)
      .setFilterSize(camera.width, camera.height)
      .filterCamera.setOrigin(0, 0)
      .setZoom(camera.zoomX, camera.zoomY)
      .setScroll(0, 0);
  }
}

/** Shows `twin` whole at `alpha`, from 0 (unseen) to 1. */
export function shade(twin: Phaser.GameObjects.Graphics, alpha: number): void {
  const fading = alpha > 0 && alpha < 1 && twin.filters !== null;
  twin.setAlpha(fading ? 1 : alpha).setFiltersForceComposite(fading);
  if (fading) twin.filterCamera.setAlpha(alpha);
}
