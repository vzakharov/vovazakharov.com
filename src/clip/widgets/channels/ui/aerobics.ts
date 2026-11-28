import { smoothstep } from '@/clip/shared/ink';
import { pulse } from '@/clip/shared/score';
import { bunny } from '@/clip/entities/bunny';
import { cardboardSun } from '@/clip/entities/meadow';
import { FORM_LOOKS, puppet } from '@/clip/entities/puppet';

import { routineAt } from './aerobics-moves';
import { CHANNELS_PALETTE } from './palette-channels';
import { box, caption, HEIGHT, type Show, WIDTH } from './screen';

const { aerobics } = CHANNELS_PALETTE;

const COUNTS = ['РАЗ', 'ДВА', 'ТРИ', 'ЧЕТЫРЕ'] as const;
const FLOOR = 520;
// The backing line, each a count behind the instructor: x, floor, scale, mark.
const LINE = [
  [140, 590, 0.42, 5100],
  [820, 590, 0.42, 5200],
] as const;
// The nearness over which the backing line stops dead and turns to the camera.
const LINE_FREEZES = [0.55, 0.68] as const;

function studio(pen: Parameters<Show>[0], stare: number): void {
  box(pen, aerobics.wall);
  for (let n = 0; n < 7; n += 1) {
    box(pen, aerobics.band, [n * 160 - 40, 0, 56, FLOOR]);
  }
  cardboardSun(pen, {
    x: 700,
    y: 170,
    scale: 0.8,
    smile: 1.3,
    gaze: [-0.7 * (1 - stare), 0.4 * (1 - stare)],
    seed: 21,
  });
  box(pen, aerobics.floor, [0, FLOOR, WIDTH, HEIGHT - FLOOR]);
  box(pen, aerobics.stripe, [0, FLOOR - 10, WIDTH, 14]);
  caption(pen, 'ЗАРЯДКА', [WIDTH / 2, 34], 8);
}

/**
 * Morning exercises: the puppet in his toy suit leads a routine that changes
 * move every four counts — jumping jacks, squats, side bends, punches — and
 * shouts each count. Two more of him follow a count behind; past a nearness of
 * 0.55 they stop dead and turn to the camera. The bunny is in the class,
 * stepping forward through it as it comes nearer.
 */
export const workout: Show = (pen, nearness, _since, stare) => {
  const { index, fraction } = pulse(pen.playhead);
  const moving = 1 - stare;
  const frozen = smoothstep(LINE_FREEZES[0], LINE_FREEZES[1], nearness);
  studio(pen, stare);

  for (const [x, y, scale, mark] of LINE) {
    const late = frozen > 0.5 ? index - 1 - (index % 4) : index - 1;
    puppet(pen, {
      place: { x, y, scale },
      pose: routineAt(late, frozen > 0.5 ? 1 : fraction),
      outfit: 'toy',
      look: {
        ...FORM_LOOKS.vocal,
        jaw: 0.25 * (1 - frozen),
        gaze: [0, 0],
        turn: 0.5 * (x < WIDTH / 2 ? 1 : -1) * (1 - frozen),
        brow: frozen * 0.8,
      },
      mark,
    });
  }

  const step = smoothstep(0.45, 0.8, nearness);
  bunny(pen, {
    x: 600 - 20 * step,
    y: 330 + 60 * step,
    nearness,
    scale: 0.32 + 0.3 * step,
    hop: index % 2 === 0 ? fraction : undefined,
    arms: index % 2 === 0 ? 'hop' : 'up',
    swaying: 0.4,
    seed: 15,
  });

  // A shout on each count, its jaw falling shut through it.
  const shout = 0.7 * (1 - smoothstep(0, 0.6, fraction)) * moving;
  puppet(pen, {
    place: { x: 380, y: 690, scale: 0.72 },
    pose: routineAt(index, stare > 0.5 ? 1 : fraction),
    outfit: 'toy',
    look: {
      ...FORM_LOOKS.vocal,
      jaw: 0.2 + shout,
      gaze: [0.6 * moving, 0],
      turn: 0.55 * moving,
      brow: stare * 0.7 - 0.6 * moving,
    },
    mark: 5000,
  });

  const count = COUNTS[((index % 4) + 4) % 4] ?? COUNTS[0];
  caption(pen, count, [760, 600], 10 - 3 * fraction, aerobics.count);
};
