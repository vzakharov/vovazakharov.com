import type { Pen, Place } from '@/clip/shared/ink';
import { beatSeconds, jaw, pulse, sectionAt } from '@/clip/shared/score';
import { player, type Role } from '@/clip/entities/puppet';

/** The song's beat counter at the playhead, in the tempo of the section it is in. */
export function beatsAt(t: number): number {
  const section = sectionAt(t);
  return (t - section.downbeat) / beatSeconds(section);
}

/** Tells each player's boil apart from the others'. */
export const PLAYER_SEEDS: Record<Role, number> = {
  guitar: 0,
  vocal: 1000,
  bass: 2000,
  drums: 3000,
};

/** `fury` headbangs on every beat and sweats; `joy` bounces on the pulse, agape. */
export type Mood = 'fury' | 'joy';

/** One of the band at `place`, playing in `mood`; the singer's jaw follows the voice. */
export function playing(
  pen: Pen,
  role: Role,
  place: Place,
  mood: Mood = 'fury',
): void {
  const t = pen.playhead;
  const beats = beatsAt(t);
  const { fraction } = pulse(t);
  // The head slams down on the beat and comes back up through it.
  const bang = Math.cos(Math.PI * 2 * (beats - Math.floor(beats)));
  const bounce = mood === 'joy' ? Math.sin(Math.PI * fraction) * 50 : 0;
  const sung = role === 'vocal' ? jaw(t) : 0;
  // In fury every mouth snaps open on the beat, singing or not.
  const snap = 0.2 + 0.7 * (1 - fraction) ** 3;
  player(pen, role, {
    beats,
    jaw: Math.max(mood === 'joy' ? 0.7 : snap, sung),
    place: { ...place, y: (place.y ?? 0) - bounce * (place.scale ?? 1) },
    look:
      mood === 'joy'
        ? { brow: -1, nod: -0.3 * bounce * 0.02, sweat: 0.2 }
        : {
            nod: 0.9 * bang,
            turn: 0.25 * Math.sin(Math.PI * beats),
            brow: 0.8,
            sweat: 0.9,
          },
    mark: PLAYER_SEEDS[role],
  });
}
