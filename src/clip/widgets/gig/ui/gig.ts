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

function playing(pen: Pen, role: Role, place: Place): void {
  const t = pen.playhead;
  player(pen, role, {
    beats: beatsAt(t),
    jaw: role === 'vocal' ? jaw(t) : 0,
    place,
    mark: PLAYER_SEEDS[role],
  });
}

/**
 * The whole band on the studio stage, the bunny among the lights at the back
 * at `nearness`; the audience's ears take off at the playhead `liftOff`, and
 * stay put without one.
 */
export const gigWide =
  (liftOff?: number, nearness = 0.2): Drawing =>
  (pen) => {
    broadcast(
      pen,
      (tape) => {
        const beats = beatsAt(tape.playhead);
        jolted(tape, () => {
          wash(tape, GIG_PALETTE.wall);
          beams(tape, beats);
          marquee(tape, beats, 40);
          stageFloor(tape, FLOOR - 40);
          bunny(tape, {
            x: 660,
            y: 250,
            nearness,
            arms: 'conduct',
            beat: beats / 4 - Math.floor(beats / 4),
            seed: 77,
          });
          for (const role of ROLES) {
            playing(tape, role, { ...WIDE[role], scale: 0.52 });
          }
          crowd(tape, {
            area: { x: -40, y: 560, width: 1040, height: 190 },
            rows: 2,
            headWidth: 115,
            liftOff,
            seed: 11,
          });
        });
      },
      { wear: 0.3 },
    );
  };

/** One of the band in close-up, against a backdrop of their own colour. */
export const gigClose =
  (role: Role, liftOff?: number): Drawing =>
  (pen) => {
    broadcast(
      pen,
      (tape) => {
        const beats = beatsAt(tape.playhead);
        jolted(tape, () => {
          wash(tape, GIG_PALETTE.backdrop[role]);
          beams(tape, beats, 1.6);
          playing(tape, role, CLOSE[role]);
          crowd(tape, {
            area: { x: -80, y: 690, width: 1120, height: 120 },
            rows: 1,
            headWidth: 120,
            liftOff,
            seed: 23 + PLAYER_SEEDS[role],
          });
        });
      },
      { wear: 0.3 },
    );
  };

// The insert's rotation: a different shot at each of its returns.
const ROTATION: readonly Drawing[] = [
  gigClose('vocal'),
  gigWide(undefined, 0.5),
  gigClose('drums'),
  gigClose('guitar'),
  gigClose('bass'),
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
