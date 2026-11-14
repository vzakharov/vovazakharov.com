import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { SERVER_FLOOR_SHADER } from './server-floor.shader.generated';

const AIR = linear(hex(0x03_07_10));

/**
 * A server floor serving nobody: every wall a row of racks whose lamps keep
 * blinking, a raised floor with cold blue air under its grilles, few lights
 * and those dim. Seen as a camera sees it, its shutter rolling against the
 * lamps' flicker.
 */
export const SERVER_FLOOR: FloorTheme = {
  name: 'Server floor',
  air: AIR,
  pillar: 0.02,
  dark: 0.4,
  sound: { footing: 'hollow', hum: 180, air: 0.9, echo: 0.5 },
  decor: [
    { thing: 'server-rack', perRoom: 1.6 },
    { thing: 'cable-reel', perRoom: 0.2 },
    { thing: 'vent', perRoom: 0.6 },
    { thing: 'crate', perRoom: 0.15 },
    { thing: 'fire-extinguisher', perRoom: 0.3 },
    { thing: 'office-chair', perRoom: 0.08 },
    { thing: 'ladder', perRoom: 0.06 },
    { thing: 'monolith', perRoom: 0.02 },
  ],
  shader: SERVER_FLOOR_SHADER,
};
