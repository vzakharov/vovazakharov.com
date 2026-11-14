import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { REMEMBERED_SHADER } from './remembered.shader.generated';

const AIR = linear(hex(0x5a_4b_3a));

/**
 * The house itself, as far as it can still be called up. Every room swears
 * to a different colour of paper and the pattern will not hold while it is
 * looked at; the skirting wanders, doors are an oblong and a knob put
 * somewhere, and the photographs have kept their frames and lost their faces.
 */
export const REMEMBERED: FloorTheme = {
  name: 'Somebody’s house',
  air: AIR,
  pillar: 0.016,
  dark: 0.14,
  sound: { footing: 'carpet', hum: 0, air: 0.08, echo: 0.9 },
  decor: [
    { thing: 'armchair', perRoom: 0.4 },
    { thing: 'bed', perRoom: 0.3 },
    { thing: 'door', perRoom: 0.6 },
    { thing: 'wall-clock', perRoom: 0.3 },
    { thing: 'tv', perRoom: 0.2 },
    { thing: 'floor-lamp', perRoom: 0.3 },
    { thing: 'mirror', perRoom: 0.3 },
    { thing: 'staircase', perRoom: 0.05 },
  ],
  shader: {
    ...REMEMBERED_SHADER,
    needs: [
      ...REMEMBERED_SHADER.needs,
      ordinary('remembered', {
        lamp: [4.2, 3.5, 2.7],
        ambient: [0.014, 0.012, 0.01],
        grid: 1,
        panel: [0.4, 0.4],
        stutter: 0.05,
        visibility: 18,
        exposure: 1.05,
        glow: 0.42,
        fringe: 0.014,
        vignette: 0.5,
        noise: 0.02,
      }),
    ],
  },
};
