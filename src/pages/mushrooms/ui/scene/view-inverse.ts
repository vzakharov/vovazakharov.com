/**
 * The view run backwards: from a point on the screen to the ground under it,
 * on the plane and in the layout's world px. A screen point at or above the
 * horizon has no ground under it, and a plane point the opening crop sees at
 * or behind its eye has no place in the layout, which the opening eye lays
 * out; both are `undefined`.
 */

import type { Point } from '../../model/geometry';
import {
  type Camera,
  type Ground,
  planeSeen,
  scaleAt,
  zAt,
} from '../../model/ground';
import { layoutOfPlane, type View } from './view';

/** The plane point the ground under `screen`, in CSS px, stands at, seen through `view`. */
export function planeUnder(view: View, screen: Point): Point | undefined {
  return planeSeen(view, view.eye, screen);
}

/** The layout's world px of the ground under `screen`, seen through `view`. */
export function layoutUnder(view: View, screen: Point): Point | undefined {
  const plane = planeUnder(view, screen);
  return plane && layoutOfPlane(view, plane);
}

/** The ground point the layout has at `layout`, in world px: `project`'s inverse. */
export function groundOfLayout(camera: Camera, layout: Point): Ground {
  const z = zAt((layout.y - camera.groundTop) / camera.ground);
  return { x: (layout.x - camera.midline) / (camera.unit * scaleAt(z)), z };
}

/** The ground point under `screen`, seen through `view`. */
export function groundUnder(view: View, screen: Point): Ground | undefined {
  const layout = layoutUnder(view, screen);
  return layout && groundOfLayout(view, layout);
}
