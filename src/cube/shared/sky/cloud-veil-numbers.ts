import { f32, wgsl } from '../shader/wgsl';
import { CLOUDS } from './cloud-field';

/**
 * The cumulus layer as `cloudGlance` holds it: the height its clouds are seen
 * at, in kilometres, and the share of a ray straight up through it that meets
 * one — the share of the sea the clouds stand over, about.
 */
const GLANCE = {
  height: CLOUDS.base + 1,
  thick:
    (CLOUDS.chance *
      Math.PI *
      ((CLOUDS.radius.least + CLOUDS.radius.most) / 2) ** 2 *
      0.5) /
    CLOUDS.cell ** 2,
} as const;

/** The layer `cloudGlance` holds, its height and thickness as WGSL constants. */
export const CLOUD_VEIL_NUMBERS = wgsl(
  'sky/cloud-veil-numbers',
  /* wgsl */ `
const CLOUD_GLANCE_HEIGHT = ${f32(GLANCE.height)};
const CLOUD_GLANCE_THICK = ${f32(GLANCE.thick)};
`,
);
