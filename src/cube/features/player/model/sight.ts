import type { WithEye } from '@/cube/shared/lib/vec';
import type { Box } from '@/cube/shared/outside';
import type { Gazing } from '@/cube/entities/world';

/**
 * The half-angle of the square of view a thing must sit inside to be seen
 * whole: inside the page's 70° field of view on a screen of any shape.
 */
const HALF_VIEW = 0.52;
const SPREAD = Math.tan(HALF_VIEW);

/**
 * Whether every corner of `box` is ahead of an eye at `eye` looking along
 * `yaw` and `elevation`, within the square of view.
 */
export function seesWhole(
  { eye: [eyeX, eyeY, eyeZ], yaw, elevation }: Gazing & WithEye,
  { min, max }: Box,
): boolean {
  const [cosYaw, sinYaw] = [Math.cos(yaw), Math.sin(yaw)];
  const [cosEl, sinEl] = [Math.cos(elevation), Math.sin(elevation)];
  return [min[0], max[0]].every((x) =>
    [min[1], max[1]].every((y) =>
      [min[2], max[2]].every((z) => {
        const [dx, dy, dz] = [x - eyeX, y - eyeY, z - eyeZ];
        const along = dx * cosYaw + dz * sinYaw;
        const right = -dx * sinYaw + dz * cosYaw;
        const ahead = along * cosEl + dy * sinEl;
        const up = dy * cosEl - along * sinEl;
        return (
          ahead > 0 &&
          Math.abs(right) <= SPREAD * ahead &&
          Math.abs(up) <= SPREAD * ahead
        );
      }),
    ),
  );
}
