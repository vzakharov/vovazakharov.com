import type { Pen } from '@/clip/shared/ink';
import { type Audience, earFlights } from '@/clip/entities/bunny';
import {
  CONFETTI_PALETTE,
  flecks,
  type SerotoninPalette,
} from '@/clip/entities/serotonin';

import { burstPieces } from '../model/burst';

/**
 * The audience's ears bursting, each where its flight tops out, into the
 * serotonin fall's pills thrown as confetti. Drawn over `studioAudience` with
 * the same `audience`, its `liftOff` set; nothing shows until the first ear
 * bursts.
 */
export function earFireworks(
  pen: Pen,
  audience: Audience,
  palette: SerotoninPalette = CONFETTI_PALETTE,
): void {
  const { playhead } = pen;
  const { seed = 0 } = audience;
  const pieces = earFlights(audience).flatMap((flight) =>
    burstPieces(flight, playhead, seed),
  );
  if (pieces.length > 0) flecks(pen, pieces, palette);
}
