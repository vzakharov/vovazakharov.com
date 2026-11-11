import type { Floors } from '../../kit';
import { CLEAN_ROOM } from './36-clean-room';
import { WET_LAB } from './37-wet-lab';
import { COLD_ROOM } from './38-cold-room';
import { DARKROOM } from './39-darkroom';
import { AGAR } from './40-agar';
import { MEMBRANE } from './41-membrane';
import { STAINED_SECTION } from './42-stained-section';
import { CRYSTAL } from './43-crystal';
import { CIRCUIT_BOARD } from './44-circuit-board';
import { WAFER } from './45-wafer';
import { MICROGRAPH } from './46-micrograph';
import { FLUORESCENCE } from './47-fluorescence';
import { GEL } from './48-gel';
import { FIGURE } from './49-figure';
import { INCUBATOR } from './50-incubator';
import { TUNNELLING_SCAN } from './51-tunnelling-scan';
import { BUBBLE_CHAMBER } from './52-bubble-chamber';

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
  44: CIRCUIT_BOARD,
  45: WAFER,
  46: MICROGRAPH,
  47: FLUORESCENCE,
  48: GEL,
  49: FIGURE,
  50: INCUBATOR,
  51: TUNNELLING_SCAN,
  52: BUBBLE_CHAMBER,
};
