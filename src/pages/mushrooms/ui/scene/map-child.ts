import type * as Phaser from 'phaser';

import type { Box } from '../../model/geometry';
import { type Camera, D_SEE, type Eye } from '../../model/ground';
import { headingOnMap, type MapFrame, onMap } from '../../model/map-frame';
import { PALETTE } from './palette';
import { azimuthAt } from './panorama';
import { fillShape, strokeShape } from './shapes';

const CHILD_RADIUS = 5;
const ARROW = 16;
/** The wedge on the grass: a pale veil, edged in faint indigo. */
const WEDGE_ALPHA = 0.32;
const WEDGE_EDGE_ALPHA = 0.55;
/** How many rays the wedge's arc is sampled at. */
const WEDGE_RAYS = 48;

/** How far a ray from `start` on one axis, moving `step` a px along it, runs to `low` or `high`. */
const toEdge = (start: number, step: number, low: number, high: number) =>
  step > 0 ? (high - start) / step : step < 0 ? (low - start) / step : Infinity;

/**
 * The pale wedge of what the child sees: the view's half-angle either side of
 * his heading, `D_SEE` deep, cut off at `paper`. The eye stands inside it, so
 * the fan is star-shaped from there and cutting each ray clips it exactly.
 */
export function drawView(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  eye: Eye,
  camera: Camera,
  paper: Box,
): void {
  const at = onMap(frame, eye);
  const half = (azimuthAt(camera, camera.width) - azimuthAt(camera, 0)) / 2;
  const angle = (heading: number) => {
    const along = headingOnMap(frame, heading);
    return Math.atan2(along.y, along.x);
  };
  const from = angle(eye.heading - half);
  const to = angle(eye.heading + half);
  const sweep = (to - from + 2 * Math.PI) % (2 * Math.PI);
  const deep = D_SEE * frame.scale;
  const rim = Array.from({ length: WEDGE_RAYS + 1 }, (_, i) => {
    const a = from + (sweep * i) / WEDGE_RAYS;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const reach = Math.min(
      deep,
      toEdge(at.x, dx, paper.left, paper.right),
      toEdge(at.y, dy, paper.top, paper.bottom),
    );
    return { x: at.x + dx * reach, y: at.y + dy * reach };
  });
  const wedge = [at, ...rim];
  fillShape(pen.fillStyle(PALETTE.hud, WEDGE_ALPHA), wedge);
  strokeShape(pen.lineStyle(1.5, PALETTE.inkCool, WEDGE_EDGE_ALPHA), wedge);
}

/** The child: an indigo dot where he stands, an arrow on his heading. */
export function drawChild(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  { heading, ...eye }: Eye,
): void {
  const at = onMap(frame, eye);
  const along = headingOnMap(frame, heading);
  const tip = { x: at.x + along.x * ARROW, y: at.y + along.y * ARROW };
  const barb = (side: number) => ({
    x: tip.x - along.x * 6 + side * along.y * 4,
    y: tip.y - along.y * 6 - side * along.x * 4,
  });
  const left = barb(1);
  const right = barb(-1);
  pen
    .lineStyle(2.5, PALETTE.inkCool)
    .lineBetween(at.x, at.y, tip.x, tip.y)
    .fillStyle(PALETTE.inkCool)
    .fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y)
    .fillCircle(at.x, at.y, CHILD_RADIUS)
    .lineStyle(1.5, PALETTE.hud)
    .strokeCircle(at.x, at.y, CHILD_RADIUS);
}
