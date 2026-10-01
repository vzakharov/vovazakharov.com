/**
 * Page-side reads a drag that must tap nothing is checked by: what every tap
 * leaves behind, and bare ground to press on.
 */

/**
 * Everything a tap anywhere in the meadow leaves behind: the selection, the
 * pickers, a planting begun, and when each flower, insect and mouse was last
 * tapped. A drag that taps nothing leaves it as it was.
 */
export const TAPS = `(() => {
  const scene = __probe.scene;
  const { meadow } = scene;
  const stamp = (at) => (Number.isFinite(at) ? at : null);
  return JSON.stringify({
    selected: meadow.selected ?? null,
    picking: meadow.picking,
    furnishing: meadow.furnishing,
    planting: meadow.planting !== undefined,
    flowers: [...scene.flowers.shown].map(([id, { tappedAt }]) => [id, stamp(tappedAt)]),
    insects: [...scene.insects.shown].map(([id, { tappedAt }]) => [id, stamp(tappedAt)]),
    mice: [...scene.bed.shown].map(([id, { house }]) => [id, stamp(house.mouse.tappedAt)]),
  });
})()`;

/** Whether a press at \`point\` on screen lands on bare ground: nothing drawn over it and no tuft under it. */
const BARE = `(point) =>
  __probe.topAt(point) === null && !__probe.scene.grass?.at(__probe.toWorld(point))`;

/** A bare point on screen low in the meadow and near the middle, where a drag can start; \`null\` where none is. */
export const BARE_START = `(() => {
  const bare = ${BARE};
  const { width, height } = __probe.scene.layout;
  for (let row = 0; row <= 8; row++) {
    for (let column = 0; column <= 8; column++) {
      const point = {
        x: width * (0.3 + (0.4 * ((column * 5) % 9)) / 8),
        y: height * (0.6 + (0.3 * row) / 8),
      };
      if (bare(point)) return point;
    }
  }
  return null;
})()`;
