import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { CONFERENCE_HOTEL_SHADER } from './conference-hotel.shader.generated';

const AIR = linear(hex(0x1a_10_08));

/**
 * A conference hotel between conferences: a carpet nobody chose, damask over
 * mahogany, coffers with a downlight each. Its wall lights are on a circuit
 * of their own, so a room whose ceiling has failed is lit by them alone.
 */
export const CONFERENCE_HOTEL: FloorTheme = {
  name: 'Conference hotel',
  air: AIR,
  pillar: 0.04,
  dark: 0.3,
  sound: { footing: 'carpet', hum: 60, air: 0.25, echo: 0.4 },
  decor: [
    { thing: 'chair-stack', perRoom: 0.8 },
    { thing: 'door', perRoom: 1.4 },
    { thing: 'potted-plant', perRoom: 0.6 },
    { thing: 'armchair', perRoom: 0.4 },
    { thing: 'mirror', perRoom: 0.3 },
    { thing: 'water-cooler', perRoom: 0.15 },
    { thing: 'whiteboard', perRoom: 0.15 },
    { thing: 'curtain', perRoom: 0.3 },
    { thing: 'payphone', perRoom: 0.1 },
    { thing: 'exit-sign', perRoom: 0.2 },
  ],
  shader: CONFERENCE_HOTEL_SHADER,
};
