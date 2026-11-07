/**
 * The camera's own compositor layer (`#stage.lifted`), raised by a pan: on it
 * a pan frame moves tiles already drawn, where without it every frame repaints
 * and re-rasterises the board. A layer keeps the scale it was rasterised at,
 * blurring text zoomed past it, so any zoom drops it and the board repaints
 * at the new scale as it did before; zooming never raises it.
 */

export type Lift = {
  /** A pan frame: raise the layer, or keep it raised. */
  pan: () => void;
  /** Any other camera change: drop the layer if its scale is now stale. */
  rest: () => void;
};

/** `classes` is the stage's class list, the only part of it the lift touches. */
export function createLift(
  classes: Pick<DOMTokenList, 'add' | 'remove'>,
  zoom: () => number,
): Lift {
  let rasterZoom: number | undefined;
  return {
    pan: () => {
      if (rasterZoom === zoom()) return;
      rasterZoom = zoom();
      classes.add('lifted');
    },
    rest: () => {
      if (rasterZoom === undefined || rasterZoom === zoom()) return;
      classes.remove('lifted');
      rasterZoom = undefined;
    },
  };
}
