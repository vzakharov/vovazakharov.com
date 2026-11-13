import { assemble } from '../shader/wgsl';
import { WAVE_EVOLVE } from './wave-evolve.shader';
import { WAVE_HALVE } from './wave-halve.shader';
import { WAVE_LAY } from './wave-lay.shader';
import { WAVE_TRANSFORM } from './wave-transform.shader';

/** The wave field's first pass, `evolve`: the spectra at the clock's moment. */
export const EVOLVE_SHADER = assemble([WAVE_EVOLVE]);

/** One stage of the inverse transform along one axis, `transform`. */
export const TRANSFORM_SHADER = assemble([WAVE_TRANSFORM]);

/** The last pass, `lay`: the transformed fields as the sea's three maps. */
export const LAY_SHADER = assemble([WAVE_LAY]);

/** A map's next mip, `halve`. */
export const HALVE_MAP_SHADER = assemble([WAVE_HALVE]);
