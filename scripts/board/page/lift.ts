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

export function createLift(stage: HTMLElement, zoom: () => number): Lift {
  let rasterZoom: number | undefined;
  return {
    pan: () => {
      if (rasterZoom === zoom()) return;
      rasterZoom = zoom();
      stage.classList.add('lifted');
    },
    rest: () => {
      if (rasterZoom === undefined || rasterZoom === zoom()) return;
      stage.classList.remove('lifted');
      rasterZoom = undefined;
    },
  };
}
