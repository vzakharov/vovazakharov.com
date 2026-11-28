import type { Pen, Place } from '@/clip/shared/ink';
import { beatSeconds, jaw, pulse, sectionAt } from '@/clip/shared/score';
import { broadcast } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import { player, type Role, ROLES } from '@/clip/entities/puppet';

import { GIG_PALETTE } from './palette-gig';
import { beams, crowd, jolted, marquee, stageFloor, wash } from './studio';

/** The song's beat counter at the playhead, in the tempo of the section it is in. */
export function beatsAt(t: number): number {
  const section = sectionAt(t);
  return (t - section.downbeat) / beatSeconds(section);
}

const FLOOR = 560;
const PLAYER_SEEDS: Record<Role, number> = {
  guitar: 0,
  vocal: 1000,
  bass: 2000,
  drums: 3000,
};

/** Where each player stands in the wide shot, by the floor between its soles. */
const WIDE: Record<Role, { x: number; y: number }> = {
  guitar: { x: 140, y: FLOOR + 20 },
  vocal: { x: 330, y: FLOOR + 30 },
  bass: { x: 520, y: FLOOR + 20 },
  drums: { x: 790, y: FLOOR - 10 },
};

/** Where each player stands in its close-up: big, cut off at the waist. */
const CLOSE: Record<Role, Place> = {
  guitar: { x: 470, y: 1020, scale: 1.3 },
  vocal: { x: 470, y: 1040, scale: 1.35 },
  bass: { x: 420, y: 1020, scale: 1.3 },
  drums: { x: 480, y: 780, scale: 1.1 },
};

/** `fury` headbangs on every beat and sweats; `joy` bounces on the pulse, agape. */
type Mood = 'fury' | 'joy';

function playing(
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
  player(pen, role, {
    beats,
    jaw: mood === 'joy' ? Math.max(0.7, sung) : sung,
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

// Each close-up's Dutch angle, in degrees, leaning the way its player does.
const TILT: Record<Role, number> = {
  guitar: -9,
  vocal: 7,
  bass: 10,
  drums: -6,
};

/**
 * The whole band on the studio stage, the bunny among the lights at the back
 * at `nearness`; the audience's ears take off at the playhead `liftOff`, and
 * stay put without one.
 */
export const gigWide =
  (liftOff?: number, nearness = 0.2, mood: Mood = 'fury'): Drawing =>
  (pen) => {
    broadcast(
      pen,
      (tape) => {
        const beats = beatsAt(tape.playhead);
        jolted(
          tape,
          () => {
            wash(tape, GIG_PALETTE.wall);
            beams(tape, beats);
            marquee(tape, beats, 40);
            stageFloor(tape, FLOOR - 40);
            bunny(tape, {
              x: 660,
              y: 250,
              nearness,
              ...(mood === 'joy'
                ? { hop: pulse(tape.playhead).fraction }
                : {
                    arms: 'conduct' as const,
                    beat: beats / 4 - Math.floor(beats / 4),
                  }),
              seed: 77,
            });
            for (const role of ROLES) {
              playing(tape, role, { ...WIDE[role], scale: 0.52 }, mood);
            }
            crowd(tape, {
              area: { x: -40, y: 560, width: 1040, height: 190 },
              rows: 2,
              headWidth: 115,
              liftOff,
              seed: 11,
            });
          },
          { push: 1.25, kick: 0.06 },
        );
      },
      { wear: 0.3 },
    );
  };

/** One of the band in close-up, against a backdrop of their own colour. */
export const gigClose =
  (role: Role, liftOff?: number, mood: Mood = 'fury'): Drawing =>
  (pen) => {
    broadcast(
      pen,
      (tape) => {
        const beats = beatsAt(tape.playhead);
        jolted(
          tape,
          () => {
            wash(tape, GIG_PALETTE.backdrop[role]);
            beams(tape, beats, 1.6);
            playing(tape, role, CLOSE[role], mood);
            crowd(tape, {
              area: { x: -80, y: 690, width: 1120, height: 120 },
              rows: 1,
              headWidth: 120,
              liftOff,
              seed: 23 + PLAYER_SEEDS[role],
            });
          },
          { push: 1.08, tilt: mood === 'joy' ? 0 : TILT[role], kick: 0.07 },
        );
      },
      { wear: 0.3 },
    );
  };

// The insert's rotation: a different shot at each of its returns, all of
// them sharing the chorus's joy.
const ROTATION: readonly Drawing[] = [
  gigClose('vocal', undefined, 'joy'),
  gigWide(undefined, 0.5, 'joy'),
  gigClose('drums', undefined, 'joy'),
  gigClose('guitar', undefined, 'joy'),
  gigClose('bass', undefined, 'joy'),
];

/**
 * The band live, cut into the chorus: whichever shot of the rotation the
 * song's pulse at the playhead names, so each return shows another.
 */
export const gigInsert: Drawing = (pen, local) => {
  const { index } = pulse(pen.playhead - local.sinceCut);
  const shot =
    ROTATION[((index % ROTATION.length) + ROTATION.length) % ROTATION.length];
  shot?.(pen, local);
};
