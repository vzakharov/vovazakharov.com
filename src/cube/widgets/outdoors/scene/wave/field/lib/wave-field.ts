import { assemble } from '@/cube/shared/shader';

import { WAVE_EVOLVE } from './wave-evolve.shader.generated';
import { WAVE_HALVE } from './wave-halve.shader.generated';
import { WAVE_LAY } from './wave-lay.shader.generated';
import { WAVE_TRANSFORM } from './wave-transform.shader.generated';

/** The wave field's first pass, `evolve`: the spectra at the clock's moment. */
export const EVOLVE_SHADER = assemble([WAVE_EVOLVE]);

/** One stage of the inverse transform along one axis, `transform`. */
export const TRANSFORM_SHADER = assemble([WAVE_TRANSFORM]);

/** The last pass, `lay`: the transformed fields as the sea's three maps. */
export const LAY_SHADER = assemble([WAVE_LAY]);

/** A map's next mip, `halve`. */
export const HALVE_MAP_SHADER = assemble([WAVE_HALVE]);
