/**
 * How each kind of insect looks on screen, apart from where it flies: the
 * graphics its painter draws it into, and what each frame moves in them — a
 * butterfly's beating wings and its proboscis, a fly's or a bee's wings
 * turning about their roots and blurring in the air, a fly's rubbing legs, a
 * bee's pollen — and how far a fly's or a bee's fidgets move it off its seat.
 */

import type * as Phaser from 'phaser';

import type { BeeGenes } from '../../model/bee-genes';
import {
  crawl,
  hop,
  jitter,
  rubbing,
  trembleSize,
} from '../../model/buzz-rest';
import type { Timed } from '../../model/flight';
import type { FlyGenes } from '../../model/fly-genes';
import type { Point, WithMiddle } from '../../model/geometry';
import {
  type ButterflyGenes,
  insectGenes,
  type OfKind,
} from '../../model/insect-genes';
import { litTurn } from '../../model/insect-light';
import {
  aloft,
  proboscis,
  type Stay,
  wingBeat,
} from '../../model/insect-motion';
import { buzzTurn, type Side as BodySide } from '../../model/insect-outline';
import type { Airborne } from '../../model/insect-paths';
import type { Flier } from '../../model/insects';
import { turnedLight } from '../../model/light';
import { type Pollen, specksAt } from '../../model/pollen';
import { inBody } from '../../model/proboscis';
import { drawBee, paintBeeBody, paintBeeLegs } from './draw-bee';
import type { BuzzParts } from './draw-buzz';
import { drawFly, paintFlyBody, paintFlyLegs } from './draw-fly';
import {
  drawInsect,
  type InsectParts,
  paintProboscis,
  type Reaching,
} from './draw-insect';
import type { Lighted, Lighting } from './ink';
import type { Footing } from './layout';
import type { Perched } from './perch-hosts';

/** How far a butterfly's wings fold at the most closed, seen from above, as a share of open. */
const FOLDED = 0.12;
/** How much the hind wings trail the fore wings' beat, as a share of the way open. */
const HIND_LAG = 0.15;
/**
 * How far the proboscis moves before it is painted again: as a share of its
 * reach, and where it reaches to, in units of the insect's size.
 */
const REACH_STEP = 0.01;
const NECTAR_STEP = 0.01;
/** Where the proboscis reaches before it has drunk anywhere, in the body's frame: behind the tail. */
const NO_NECTAR = { x: 0, y: 0.45 };
/** How far a fly's front legs move in their rub before they are painted again. */
const RUB_STEP = 0.05;

/**
 * A butterfly's parts, and its proboscis as last painted: how far out, and
 * where it reaches, the flower's middle in the body's frame, held from the
 * last frame it sat at a flower, so it curls up where it drank; which side it
 * bows out to, fixed as each drink begins; and where it was last painted
 * reaching.
 */
type ButterflyLook = OfKind<'butterfly'> &
  InsectParts &
  Pick<Reaching, 'reach' | 'nectar'> & {
    genes: ButterflyGenes;
    side: BodySide | undefined;
    painted: Point;
  };
/** A fly's parts, and how far into a rub its front legs were last painted. */
type FlyLook = OfKind<'fly'> & BuzzParts & { genes: FlyGenes; rub: number };
/** A bee's parts, and how many specks of pollen its baskets were last painted with. */
type BeeLook = OfKind<'bee'> &
  BuzzParts &
  Pick<Pollen, 'specks'> & { genes: BeeGenes };
/**
 * Each look; the light it was last painted in, as the screen stands, which
 * its every repaint keeps; and the body's turn its parts were last painted
 * lit for, within `LIGHT_STEP` of the turn it is shown at.
 */
export type Look = (ButterflyLook | FlyLook | BeeLook) &
  Lighted & { litTurn: number };

/** What a frame poses a look by: the leg with its stay, the clock in ms, the flier and its motion, and its size to its unit in pixels. */
export type Moment = Timed &
  Flying &
  Pick<Footing, 'size'> & { stay: Stay; motion: Airborne };

/** An insect of the meadow's, as the scene shows it. */
export type Flying = { flier: Flier };

/** Where a drinking butterfly's middle and turn stand this frame, and the flower's middle it drinks from. */
export type Drinking = Pick<Perched, 'nectar'> &
  WithMiddle & {
    rotation: number;
  };

/**
 * A look for `flier`, its graphics made in `scene`, and those graphics in
 * the order its container stacks them, the lowest first.
 */
export function lookOf(
  scene: Phaser.Scene,
  flier: Flier,
  lighting: Lighting,
): { look: Look; stack: Phaser.GameObjects.Graphics[] } {
  const make = () => scene.add.graphics();
  const genes = insectGenes(flier);
  switch (genes.kind) {
    case 'butterfly': {
      const look: Look = {
        kind: 'butterfly',
        lighting,
        litTurn: 0,
        hind: make(),
        fore: make(),
        body: make(),
        proboscis: make(),
        genes,
        reach: 0,
        nectar: NO_NECTAR,
        side: undefined,
        painted: NO_NECTAR,
      };
      return {
        look,
        stack: [look.hind, look.fore, look.body, look.proboscis],
      };
    }
    case 'fly':
    case 'bee': {
      const parts: BuzzParts = {
        legs: make(),
        body: make(),
        left: make(),
        right: make(),
        blur: make(),
      };
      const stack = [
        parts.legs,
        parts.body,
        parts.left,
        parts.right,
        parts.blur,
      ];
      const look: Look =
        genes.kind === 'fly'
          ? { kind: 'fly', ...parts, genes, rub: 0, lighting, litTurn: 0 }
          : { kind: 'bee', ...parts, genes, specks: 0, lighting, litTurn: 0 };
      return { look, stack };
    }
    default: {
      return genes satisfies never;
    }
  }
}

/** Paints `look` afresh, `size` to its unit, as `flier` stands at `now`. */
export function drawLook(
  look: Look,
  size: number,
  flier: Flier,
  now: number,
): void {
  const lighting = ownLighting(look);
  switch (look.kind) {
    case 'butterfly': {
      drawInsect(look, look.genes, size, lighting);
      paintReach(look, size);
      return;
    }
    case 'fly': {
      drawFly(look, look.genes, size, lighting);
      paintFlyLegs(look.legs.clear(), look.genes, size, look.rub, lighting);
      return;
    }
    case 'bee': {
      look.specks = flier.kind === 'bee' ? specksAt(flier, now) : 0;
      drawBee(look, look.genes, size, look.specks, lighting);
      return;
    }
    default: {
      look satisfies never;
    }
  }
}

/** `look`'s light in its body's own frame, turned as its parts were last painted lit. */
function ownLighting(look: Look): Lighting {
  return turnedLight(look.lighting, look.litTurn);
}

/**
 * Paints afresh the parts of `look` the light falls on once its body, turned
 * `turn`, has turned more than `LIGHT_STEP` past the turn they show: a
 * butterfly's wings and body, a fly's body, a bee's body and the pollen in
 * its baskets. Its clear wings keep their plain edge, and its legs no side.
 */
function relight(look: Look, turn: number, size: number): void {
  const turned = litTurn(look.litTurn, turn);
  if (turned === look.litTurn) return;
  look.litTurn = turned;
  const lighting = ownLighting(look);
  switch (look.kind) {
    case 'butterfly': {
      drawInsect(look, look.genes, size, lighting);
      return;
    }
    case 'fly': {
      paintFlyBody(look.body.clear(), look.genes, size, lighting);
      return;
    }
    case 'bee': {
      paintBeeBody(look.body.clear(), look.genes, size, lighting);
      if (look.specks > 0) {
        paintBeeLegs(
          look.legs.clear(),
          look.genes,
          size,
          look.specks,
          lighting,
        );
      }
      return;
    }
    default: {
      look satisfies never;
    }
  }
}

/**
 * Sets what moves in `look` this frame: its lit parts kept to the sun as it
 * turns (`relight`), a butterfly's wings beating and its proboscis reaching,
 * `drinking` saying where it and the flower stand; a fly's or a bee's wings
 * turning, shown still at rest and as a blur in the air, a fly's front legs
 * rubbing, a bee's baskets filling and emptying.
 */
export function poseLook(look: Look, moment: Moment, drinking: Drinking): void {
  const { stay, now, motion, size } = moment;
  relight(look, drinking.rotation, size);
  const open = wingBeat(stay, now, motion);
  switch (look.kind) {
    case 'butterfly': {
      look.fore.setScale(FOLDED + (1 - FOLDED) * open, 1);
      const lagging = open + (1 - open) * HIND_LAG;
      look.hind.setScale(FOLDED + (1 - FOLDED) * lagging, 1);
      poseProboscis(look, moment, drinking);
      return;
    }
    case 'fly':
    case 'bee': {
      const up = aloft(stay, now);
      look.left.setRotation(buzzTurn(-1, open)).setAlpha(1 - up);
      look.right.setRotation(buzzTurn(1, open)).setAlpha(1 - up);
      look.blur.setAlpha(up);
      if (look.kind === 'fly') {
        const rub = rubbing(stay, now, motion);
        if (
          Math.abs(rub - look.rub) > RUB_STEP ||
          (rub === 0) !== (look.rub === 0)
        ) {
          look.rub = rub;
          paintFlyLegs(
            look.legs.clear(),
            look.genes,
            size,
            rub,
            ownLighting(look),
          );
        }
        return;
      }
      const { flier } = moment;
      const specks = flier.kind === 'bee' ? specksAt(flier, now) : 0;
      if (specks !== look.specks) {
        look.specks = specks;
        paintBeeLegs(
          look.legs.clear(),
          look.genes,
          size,
          specks,
          ownLighting(look),
        );
      }
      return;
    }
    default: {
      look satisfies never;
    }
  }
}

/**
 * How far a sitting fly's or bee's fidgets have moved it off its seat at
 * `now`, in pixels: a fly's jitter and its hops along the cap, a bee's crawl
 * about its flower; none for a butterfly, and none in flight.
 */
export function fidget(look: Look, { stay, now, motion, size }: Moment): Point {
  switch (look.kind) {
    case 'butterfly': {
      return { x: 0, y: 0 };
    }
    case 'fly': {
      const shake = jitter(stay, now, motion);
      const { along, rise } = hop(stay, now, motion);
      const trembling = trembleSize(size);
      return {
        x: shake.x * trembling + along * size,
        y: shake.y * trembling - rise * size,
      };
    }
    case 'bee': {
      const { x, y } = crawl(stay, now, motion);
      return { x: x * size, y: y * size };
    }
    default: {
      return look satisfies never;
    }
  }
}

/** Uncurls a butterfly's proboscis into the flower it drinks at, repainting it only as far as it has moved. */
function poseProboscis(
  look: ButterflyLook & Look,
  { stay, now, size }: Moment,
  { middle, rotation, nectar: flower }: Drinking,
): void {
  const reach = proboscis(stay, now);
  if (flower && now >= stay.arrives) {
    look.nectar = inBody(flower, middle, rotation, size);
  }
  if (reach > 0 && look.side === undefined) {
    look.side = look.nectar.x < 0 ? -1 : 1;
  }
  const { nectar, painted } = look;
  if (
    Math.abs(reach - look.reach) > REACH_STEP ||
    (reach === 0) !== (look.reach === 0) ||
    (reach > 0 &&
      Math.hypot(nectar.x - painted.x, nectar.y - painted.y) > NECTAR_STEP)
  ) {
    look.reach = reach;
    look.painted = nectar;
    paintReach(look, size);
  }
}

function paintReach(look: ButterflyLook & Look, size: number): void {
  const { genes, reach, nectar, side = 1 } = look;
  paintProboscis(
    look.proboscis.clear(),
    genes,
    size,
    { reach, nectar, side },
    ownLighting(look),
  );
}

/** A new leg's drink begins afresh: its proboscis bows out to whichever side the flower is, once it reaches. */
export function newDrink(look: Look): void {
  if (look.kind === 'butterfly') look.side = undefined;
}
