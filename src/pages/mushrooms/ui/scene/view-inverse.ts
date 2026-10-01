/**
 * The view run backwards: from a point on the screen to the ground under it,
 * on the plane and in the layout's world px. A screen point at or above the
 * horizon has no ground under it, and a plane point at or behind the opening
 * eye has no place in the layout, which the opening eye lays out; both are
 * `undefined`.
 */

import type { Point } from '../../model/geometry';
import {
  type Camera,
  EYE_HEIGHT,
  type Ground,
  OPENING_EYE,
  pinholeOf,
  scaleAt,
  viewOf,
  zAt,
} from '../../model/ground';
import type { View } from './view';

/** The plane point the ground under `screen`, in CSS px, stands at, seen through `view`. */
export function planeUnder(view: View, screen: Point): Point | undefined {
  const pinhole = pinholeOf(view);
  const below = screen.y - pinhole.y;
  if (below <= 0) return undefined;
  const ahead = (pinhole.focal * EYE_HEIGHT) / below;
  const across = ((screen.x - pinhole.x) * ahead) / pinhole.focal;
  const { x, y, heading } = view.eye;
  const cos = Math.cos(heading);
  const sin = Math.sin(heading);
  return {
    x: x + across * cos + ahead * sin,
    y: y - across * sin + ahead * cos,
  };
}

/** Where the layout, in world px, has the ground at `plane`: where the opening eye shows it, on the opening crop. */
export function layoutOf(camera: Camera, plane: Point): Point | undefined {
  const viewed = viewOf(camera, OPENING_EYE, plane, 0);
  if (viewed.ahead <= 0) return undefined;
  const { x, y } = viewed;
  return { x: x + (camera.world - camera.width) / 2, y };
}

/** The layout's world px of the ground under `screen`, seen through `view`. */
export function layoutUnder(view: View, screen: Point): Point | undefined {
  const plane = planeUnder(view, screen);
  return plane && layoutOf(view, plane);
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
