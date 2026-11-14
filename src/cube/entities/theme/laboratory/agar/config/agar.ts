import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { AGAR_SHADER } from './agar.shader.generated';

const AIR = linear(hex(0x1c_11_03));

/**
 * A culture plate left on a lightbox: the floor is amber gel lit from under,
 * colonies stand on it as islands, and the dish's walls sweat.
 */
export const AGAR: FloorTheme = {
  name: 'Agar plate',
  air: AIR,
  pillar: 0.016,
  dark: 0.1,
  sound: { footing: 'soft', hum: 60, air: 0.05, echo: 0.3 },
  decor: [
    { thing: 'tank', perRoom: 0.3 },
    { thing: 'lab-bench', perRoom: 0.2 },
    { thing: 'balloon', perRoom: 0.1 },
    { thing: 'rug', perRoom: 0.2 },
  ],
  shader: {
    ...AGAR_SHADER,
    needs: [
      ...AGAR_SHADER.needs,
      ordinary('agar', {
        lamp: [0.75, 0.66, 0.46],
        ambient: [0.02, 0.011, 0.002],
        grid: 2,
        panel: [0.7, 0.7],
        stutter: 0,
        visibility: 36,
        exposure: 1.1,
        glow: 0.3,
        fringe: 0.006,
        vignette: 0.4,
        noise: 0.014,
      }),
    ],
  },
};
