import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { HOME_SHADER } from './home.shader.generated';

const AIR = linear(hex(0x1c_10_08));

/**
 * Under everything, smaller than a quark, somebody's flat: herringbone
 * parquet, striped wallpaper, one warm lamp, and on every wall the carpet
 * that hung over a grandmother's sofa east of Berlin. The one room in the
 * building that was finished, and loved.
 */
export const HOME: FloorTheme = {
  name: 'Home',
  air: AIR,
  pillar: 0.02,
  dark: 0,
  sound: { footing: 'wood', hum: 50, air: 0, echo: 0.3 },
  decor: [
    { thing: 'sofa', perRoom: 0.8 },
    { thing: 'armchair', perRoom: 0.6 },
    { thing: 'floor-lamp', perRoom: 0.6 },
    { thing: 'tv', perRoom: 0.5 },
    { thing: 'bookshelf', perRoom: 0.6 },
    { thing: 'rug', perRoom: 0.5 },
    { thing: 'potted-plant', perRoom: 0.6 },
    { thing: 'radiator', perRoom: 0.4 },
    { thing: 'wall-clock', perRoom: 0.3 },
  ],
  shader: {
    ...HOME_SHADER,
    needs: [
      ...HOME_SHADER.needs,
      ordinary('home', {
        lamp: [2.5, 1.7, 0.85],
        ambient: [0.014, 0.008, 0.004],
        grid: 1,
        panel: [0.4, 0.4],
        stutter: 0,
        visibility: 45,
        exposure: 1.1,
        glow: 0.22,
        fringe: 0.003,
        vignette: 0.45,
        noise: 0.014,
      }),
    ],
  },
};
