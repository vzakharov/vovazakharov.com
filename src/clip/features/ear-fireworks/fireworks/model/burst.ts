import { rng } from '@/clip/shared/ink';
import type { EarFlight } from '@/clip/entities/bunny';
import { KINDS, type PlacedFleck } from '@/clip/entities/serotonin';

/** How many pieces one ear bursts into. */
export const PIECES = 18;
/** Seconds from a burst until its last piece has faded. */
export const BURST_LIFE = 2.8;
// The last of that life, in seconds, over which the pieces fade.
const FADE = 0.9;
// Stage units a second each piece is thrown at, before the air slows it.
const THROW = 300;
// How quickly the air takes a piece's throw, per second.
const DRAG = 2.4;
// Confetti's fall once the throw is spent: a steady drift, gently quickening.
const DRIFT = 55;
const SETTLE = 30;

/**
 * The pieces `flight`'s ear has burst into at `playhead`: a ring thrown out
 * from where it burst, slowed by the air, then drifting down as confetti and
 * fading. None before the burst or after `BURST_LIFE`; fixed by `seed`.
 */
export function burstPieces(
  flight: EarFlight,
  playhead: number,
  seed: number,
): readonly PlacedFleck[] {
  const since = playhead - flight.bursts;
  if (since < 0 || since >= BURST_LIFE) return [];
  const { from, earSide: side, apex } = flight;
  const [cx, cy] = apex;
  const next = rng(seed * 4099 + from.seat * 2 + (side + 1) / 2);
  const reach = ((1 - Math.exp(-DRAG * since)) / DRAG) * from.headScale;
  const fall = DRIFT * since + 0.5 * SETTLE * since * since;
  const solidity = Math.min(1, (BURST_LIFE - since) / FADE);
  return Array.from({ length: PIECES }, (): PlacedFleck => {
    const heading = Math.PI * 2 * next();
    const speed = THROW * (0.55 + next() * 0.6);
    const shape = KINDS[Math.floor(next() * KINDS.length)] ?? 'flake';
    return {
      shape,
      colouring: Math.floor(next() * 3),
      // Pieces from the back rows burst smaller and unoutlined, as far flecks.
      layer: from.rank === 0 ? 2 : 1,
      x: cx + Math.cos(heading) * speed * reach,
      y: cy + Math.sin(heading) * speed * reach + fall,
      angle: (next() + since * (next() - 0.5) * 6) * Math.PI * 2,
      fleckSize: 16 * from.headScale * (0.8 + next() * 0.4),
      solidity,
    };
  });
}
