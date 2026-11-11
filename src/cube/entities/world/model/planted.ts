import worldJson from '../config/world.json';
import { parseWorld } from './hole';

/** The committed world, `scripts/plant.ts`'s output. */
export const planted = parseWorld(worldJson);
