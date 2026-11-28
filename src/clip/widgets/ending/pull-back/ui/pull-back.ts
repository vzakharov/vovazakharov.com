import {
  at,
  clamp,
  lerp,
  type Pen,
  smoothstep,
  STAGE,
} from '@/clip/shared/ink';
import { reality, tubeOff } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { bunny, HELD_AT } from '@/clip/entities/bunny';

import { ENDING_PALETTE } from '../../palette';
import {
  HOSPITAL_WINDOW,
  hospitalNight,
  type Pane,
  pillsIn,
  WARD_WINDOW,
  wardWall,
  wardWindowBars,
} from './hospital';
import { channelGlobe, wardClose } from './ward-close';

/** The bunny holding the last globe, still, so the dome stays where the camera aims. */
const HOLDER = { x: 640, y: 200, bunnyScale: 0.8 } as const;
/** The dome's radius in the bunny's own units, and where it sits on the stage. */
const DOME_RADIUS = 150;
const DOME = {
  x: HOLDER.x + HELD_AT[0] * HOLDER.bunnyScale,
  y: HOLDER.y + HELD_AT[1] * HOLDER.bunnyScale,
  radius: DOME_RADIUS * HOLDER.bunnyScale,
} as const;
const INSCRIBED = Math.atan2(STAGE.height, STAGE.width);
/** The 16:9 pane inscribed in a dome of `radius`, centred on the origin. */
const inscribed = (radius: number): Pane => [
  -radius * Math.cos(INSCRIBED),
  -radius * Math.sin(INSCRIBED),
  2 * radius * Math.cos(INSCRIBED),
];
/** The pane inscribed in the dome on the stage: the hospital's picture fills it. */
const DOME_PANE: Pane = ((): Pane => {
  const [x, y, width] = inscribed(DOME.radius);
  return [DOME.x + x, DOME.y + y, width];
})();
/** How long each step of the pull back takes to settle, in seconds. */
const PULL_SECONDS = 0.75;

/** `inner` drawn to fill `pane`, cut to it. */
function seenThrough(
  pen: Pen,
  [x, y, width]: Pane,
  inner: (pen: Pen) => void,
): void {
  const { ctx } = pen;
  at(pen, { x, y, scale: width / STAGE.width }, () => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, STAGE.width, STAGE.height);
    ctx.clip();
    inner(pen);
    ctx.restore();
  });
}

const wardOutside = (pen: Pen): void => {
  wardWall(pen);
  seenThrough(pen, WARD_WINDOW, (inner) => {
    wardClose(inner, 0);
  });
  wardWindowBars(pen);
};

const hospital = (pen: Pen): void => {
  hospitalNight(pen);
  seenThrough(pen, HOSPITAL_WINDOW, wardOutside);
};

/** The night, and the bunny holding the hospital in a snow globe. */
const inPaws = (pen: Pen): void => {
  const { ctx } = pen;
  ctx.fillStyle = ENDING_PALETTE.night;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  bunny(pen, {
    ...HOLDER,
    nearness: 1,
    arms: 'hold',
    eyes: 'glow',
    grin: 0.8,
    swaying: 0,
    seed: 150,
    held: () => {
      channelGlobe(pen, DOME_RADIUS, 0, (r) => {
        ctx.fillStyle = ENDING_PALETTE.night;
        ctx.fillRect(-r, -r, 2 * r, 2 * r);
        seenThrough(pen, inscribed(r), hospital);
        pillsIn(pen, r);
      });
    },
  });
};

/** Each step out: its picture, and the pane in it the step before is seen through. */
const STEPS: ReadonlyArray<readonly [(pen: Pen) => void, Pane]> = [
  [wardOutside, WARD_WINDOW],
  [hospital, HOSPITAL_WINDOW],
  [inPaws, DOME_PANE],
];

/**
 * `picture` under a camera `e` of the way pulled back from `pane` filling
 * the frame to the whole picture: one straight zoom about the point both
 * framings share.
 */
function pulled(
  pen: Pen,
  picture: (pen: Pen) => void,
  pane: Pane,
  e: number,
): void {
  const [x, y, width] = pane;
  const deep = STAGE.width / width;
  const scale = deep ** (1 - e);
  const [fx, fy] = [(deep * x) / (deep - 1), (deep * y) / (deep - 1)];
  at(pen, { x: fx * (1 - scale), y: fy * (1 - scale), scale }, () => {
    picture(pen);
  });
}

/**
 * The end, from the last «Хорошо!» on: the bunny in the ward holding up the
 * globe, then in the silence the camera pulling away in steps at each of
 * `steps` (song times) — the ward's window from outside, the hospital, the
 * hospital in the globe in the bunny's paws — and the tube switching off
 * from `off`.
 */
export const pullBack =
  (steps: readonly [number, number, number], off: number): Drawing =>
  (pen: Pen, local: Local) => {
    const t = pen.playhead;
    const shout = t - local.sinceCut;
    const step = steps.filter((s) => s <= t).length;
    if (step === 0) {
      const push = lerp(
        1,
        1.06,
        smoothstep(0, 1, (t - shout) / (steps[0] - shout)),
      );
      const shaking = clamp(1 - (t - shout) / 1.2, 0, 1);
      reality(pen, (inner) => {
        at(
          inner,
          { x: STAGE.width / 2, y: STAGE.height / 2, scale: push },
          () => {
            at(inner, { x: -STAGE.width / 2, y: -STAGE.height / 2 }, () => {
              wardClose(inner, shaking);
            });
          },
        );
      });
      return;
    }
    const [picture, pane] = STEPS[step - 1] ?? [inPaws, DOME_PANE];
    const since = t - (steps[step - 1] ?? shout);
    const e = smoothstep(0, 1, since / PULL_SECONDS);
    const scene = (inner: Pen) => {
      reality(inner, (grained) => {
        pulled(grained, picture, pane, e);
      });
    };
    if (t < off) {
      scene(pen);
      return;
    }
    tubeOff(
      pen,
      clamp((t - off) / (local.seconds - (off - shout)), 0, 1),
      scene,
      'stage',
    );
  };
