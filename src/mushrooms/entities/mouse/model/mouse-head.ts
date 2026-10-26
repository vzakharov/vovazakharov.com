/** The mouse's head radius, in door widths, drawn at its door's own scale. */
export const MOUSE_HEAD_R = 0.3;

/** How far across, in pixels, the mouse's head is drawn at a door `doorWidth` pixels wide. */
export function mouseHead(doorWidth: number): number {
  return 2 * MOUSE_HEAD_R * doorWidth;
}
