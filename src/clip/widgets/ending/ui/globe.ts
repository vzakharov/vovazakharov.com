import {
  at,
  ellipse,
  ink,
  lerp,
  type Pen,
  polygon,
  smoothstep,
  STAGE,
} from '@/clip/shared/ink';
import { KICKS, punch } from '@/clip/shared/score';
import { dotText, reality, tubeOff } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import { serotoninFall } from '@/clip/entities/serotonin';
import { snowGlobe } from '@/clip/entities/snow-globe';

import { ENDING_PALETTE } from './palette-ending';

/** The kick the globe jolts to: the song's last but one. */
const SHAKE_AT = KICKS.slice(-2, -1);
/** Where the dome sits on the stage with the bunny wide, and its radius. */
const DOME = { x: 640, y: 430, radius: 96 } as const;
/** How far in the pull back starts: the dome filling the frame. */
const DEEP = 4.2;
const FLECK_SCALE = 0.2;

const rect = (x: number, y: number, w: number, h: number) =>
  polygon([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

/** The hospital, origin at the dome's centre, one window lit: the ward's. */
function hospital(pen: Pen, r: number): void {
  const { ctx } = pen;
  ctx.fillStyle = ENDING_PALETTE.dome;
  ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ink(pen, ellipse([0, r * 0.62], r * 1.1, r * 0.3), {
    fill: ENDING_PALETTE.ground,
    stroke: null,
    seed: 121,
  });
  const [w, h] = [r * 1.1, r * 0.7];
  ink(pen, rect(-w / 2, r * 0.55 - h, w, h), {
    fill: ENDING_PALETTE.hospital,
    width: 2,
    seed: 122,
  });
  ink(pen, rect(-w / 2, r * 0.55 - h, w * 0.18, h), {
    fill: ENDING_PALETTE.hospitalShade,
    stroke: null,
    seed: 123,
  });
  const cell = w / 7;
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const lit = row === 1 && column === 3;
      ink(
        pen,
        rect(
          -w / 2 + cell * (1 + column) + cell * 0.15,
          r * 0.55 - h + cell * 0.6 + row * cell * 1.2,
          cell * 0.6,
          cell * 0.7,
        ),
        {
          fill: lit ? ENDING_PALETTE.lit : ENDING_PALETTE.window,
          width: 1,
          seed: 124 + row * 5 + column,
        },
      );
    }
  }
  ink(
    pen,
    rect(-cell * 0.15, r * 0.55 - h - cell * 0.9, cell * 0.3, cell * 0.8),
    {
      fill: ENDING_PALETTE.cross,
      stroke: null,
      seed: 140,
    },
  );
  ink(
    pen,
    rect(-cell * 0.4, r * 0.55 - h - cell * 0.65, cell * 0.8, cell * 0.3),
    {
      fill: ENDING_PALETTE.cross,
      stroke: null,
      seed: 141,
    },
  );
  // The pills fall at a fifth of their stage size, to fit the dome.
  at(pen, { x: -r, y: -r, scale: FLECK_SCALE }, () => {
    serotoninFall(pen, {
      width: (2 * r) / FLECK_SCALE,
      height: (2 * r) / FLECK_SCALE,
      density: 0.5,
      seed: 142,
    });
  });
}

/** The night, the bunny holding the globe, the hospital in it; the stage as is. */
function globeScene(pen: Pen): void {
  const { ctx, playhead } = pen;
  ctx.fillStyle = ENDING_PALETTE.night;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const shaking = punch(SHAKE_AT, playhead);
  bunny(pen, {
    x: 640,
    y: 300,
    nearness: 1,
    bunnyScale: 0.62,
    arms: 'hold',
    eyes: 'glow',
    grin: 0.8,
    swaying: 0.3,
    seed: 150,
    held: () => {
      snowGlobe(pen, {
        domeRadius: DOME.radius,
        shaking,
        plaque: 'ХОРОШО',
        seed: 151,
        inside: (r) => {
          hospital(pen, r);
        },
      });
    },
  });
}

/** From inside the dome back out to the bunny holding it, wide. */
export const globePullBack: Drawing = (pen: Pen, { p }: Local) => {
  const zoom = lerp(DEEP, 1, smoothstep(0, 0.85, p));
  const [fx, fy] = [
    lerp(DOME.x, STAGE.width / 2, smoothstep(0.3, 1, p)),
    lerp(DOME.y, STAGE.height / 2, smoothstep(0.3, 1, p)),
  ];
  reality(pen, (inner) => {
    at(inner, { x: STAGE.width / 2, y: STAGE.height / 2, scale: zoom }, () => {
      at(inner, { x: -fx, y: -fy }, () => {
        globeScene(inner);
      });
    });
  });
};

/** The channel's address over the held globe, then the tube collapsing to its dot. */
export const switchOff: Drawing = (pen: Pen, { p }: Local) => {
  tubeOff(
    pen,
    smoothstep(0.35, 1, p),
    (inner) => {
      reality(inner, globeScene);
      dotText(inner, 'T.ME/FKNBALL', [STAGE.width / 2, 40], {
        dot: 6,
        color: ENDING_PALETTE.paleDot,
        align: 'center',
      });
    },
    'stage',
  );
};
