/**
 * The camera's own compositor layer (`#stage.lifted`), held while it
 * moves: on it a pan or zoom frame is a transform applied to tiles already
 * drawn, where without it every frame repaints and re-rasterises the board. A
 * layer keeps the scale it was rasterised at, blurring text zoomed past it, so
 * the camera resting at another zoom drops it and the board repaints sharp; at
 * the zoom it was raised at (after a pan) it stays for the next gesture.
 */

/** How long the camera stays still before a gesture counts as over. */
const SETTLE_MS = 150;

export type Lift = {
  /** A gesture frame: raise the layer, or keep it raised. */
  moving: () => void;
  /** A camera change outside a gesture: drop the layer if its scale is stale. */
  rest: () => void;
};

export function createLift(stage: HTMLElement, zoom: () => number): Lift {
  let rasterZoom: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const rest = (): void => {
    clearTimeout(timer);
    if (rasterZoom === undefined || rasterZoom === zoom()) return;
    stage.classList.remove('lifted');
    rasterZoom = undefined;
  };
  return {
    moving: () => {
      if (rasterZoom === undefined) {
        rasterZoom = zoom();
        stage.classList.add('lifted');
      }
      clearTimeout(timer);
      timer = setTimeout(rest, SETTLE_MS);
    },
    rest,
  };
}
