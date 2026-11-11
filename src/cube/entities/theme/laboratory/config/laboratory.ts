import type { Floors } from '../../kit';
import { CLEAN_ROOM } from './36-clean-room';
import { WET_LAB } from './37-wet-lab';
import { COLD_ROOM } from './38-cold-room';
import { DARKROOM } from './39-darkroom';
import { AGAR } from './40-agar';
import { MEMBRANE } from './41-membrane';
import { STAINED_SECTION } from './42-stained-section';
import { CRYSTAL } from './43-crystal';

/** Floors 36 to 52: rooms for studying what is, by now, bigger than the viewer. */
export const LABORATORY_FLOORS: Floors = {
  36: CLEAN_ROOM,
  37: WET_LAB,
  38: COLD_ROOM,
  39: DARKROOM,
  40: AGAR,
  41: MEMBRANE,
  42: STAINED_SECTION,
  43: CRYSTAL,
};
