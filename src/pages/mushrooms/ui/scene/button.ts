import * as Phaser from 'phaser';

import type { Meadow } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import { shake, wobble } from '../../model/motion';
import { faceFrame } from './baking';
import { containsCircle, type WithCircleHit } from './hit-areas';
import { tapReach } from './sky-layout';

/** How deep a pressed button sinks in, against a mushroom's squash. */
const PRESS_DEPTH = 0.6;
/** A head shake's reach to either side, in the button's radii, and its turn in radians. */
const SHAKE_REACH = 0.3;
const SHAKE_TURN = 0.25;
/** A control that cannot act now, faded; a tap on it still shakes its head. */
export const DIMMED_ALPHA = 0.4;
/**
 * Texels a side per device pixel a face is drawn at before it is shrunk to
 * one: a framebuffer draws with no multisampling, so this is what smooths
 * the pictogram's edges as the screen's own canvas would.
 */
const SUPERSAMPLE = 2;

/**
 * A button as the screen shows it: its picture baked into `face` whenever
 * what it shows or where it stands changes, so a frame draws one textured
 * quad per button rather than replaying its pictogram's shapes. `hit` is in
 * the face's own texels, which is where a tap on it is tested.
 */
export type Button = WithCircleHit & {
  face: Phaser.GameObjects.RenderTexture;
  /** What `face` was last baked from; a paint that changes none of it bakes nothing. */
  baked: string | undefined;
  /** Device pixels to a CSS pixel as of the last bake; the face's scale at rest is its inverse. */
  ratio: number;
  /** Where the layout stands it; each frame's movement is an offset from here. */
  home: Circle;
  pressedAt: number;
  /** When it last shook its head at a tap it could not act on. */
  refusedAt: number;
  /** Bakes `draw` into `face`, the button's middle at the graphics' origin. */
  bake: (draw: Draw, home: Circle, ratio: number) => void;
};

/** Paints a button's picture into `graphics`, centred on its origin; `hairline` is one device pixel, in CSS pixels. */
type Draw = (
  graphics: Phaser.GameObjects.Graphics,
  hairline: number,
) => void;

/** What a button shows: `look` names it, so the same look is never baked twice. */
export type Face = { look: string; draw: Draw };

/** Whether a control can act on `meadow`. */
export type Able = (meadow: Meadow) => boolean;

/**
 * Makes buttons that press in and `act` when tapped while `can` holds for the
 * meadow `meadow()` returns, and shake their heads and `refuse` when it does
 * not. The buttons it makes share one graphics object and one scratch
 * texture to bake their faces through, off the display list.
 */
export function buttonMaker(
  scene: Phaser.Scene,
  depth: number,
  now: () => number,
  meadow: () => Meadow | undefined,
  refuse: () => void,
): (act: () => void, can?: Able) => Button {
  const pen = scene.make.graphics({}, false);
  const scratch = scene.make
    .renderTexture({ width: 2, height: 2 }, false)
    .setOrigin(0, 0)
    .setScale(1 / SUPERSAMPLE);
  const bake =
    (face: Phaser.GameObjects.RenderTexture) =>
    (draw: Draw, home: Circle, ratio: number): void => {
      const { left, top, side, origin } = faceFrame(home, ratio);
      face.resize(side, side);
      const wide = face.width * SUPERSAMPLE;
      const tall = face.height * SUPERSAMPLE;
      if (scratch.width < wide || scratch.height < tall) {
        scratch.resize(
          Math.max(scratch.width, wide),
          Math.max(scratch.height, tall),
        );
      }
      pen.clear().setPosition(home.x, home.y);
      draw(pen, 1 / ratio);
      scratch.camera
        .setOrigin(0, 0)
        .setZoom(ratio * SUPERSAMPLE)
        .setScroll(left / ratio, top / ratio);
      scratch.clear().draw(pen).render();
      face.camera.setOrigin(0, 0).setZoom(1).setScroll(0, 0);
      face.clear().draw(scratch).render();
      face.setOrigin(origin.x, origin.y);
    };
  return (act, can = () => true) => {
    const hit = new Phaser.Geom.Circle();
    const face = scene.add
      .renderTexture(0, 0, 2, 2)
      .setDepth(depth)
      .setInteractive(hit, containsCircle);
    const button: Button = {
      face,
      hit,
      baked: undefined,
      ratio: 1,
      home: { x: 0, y: 0, r: 0 },
      pressedAt: -Infinity,
      refusedAt: -Infinity,
      bake: bake(face),
    };
    face.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      const shown = meadow();
      if (shown && !can(shown)) {
        button.refusedAt = now();
        refuse();
        return;
      }
      button.pressedAt = now();
      act();
    });
    return button;
  };
}

/** Sets `button` at `x, y` and `grown` of its size, pressing or shaking as its last tap has it. */
export function standButton(
  button: Button,
  t: number,
  { x, y }: Point,
  grown: number,
): void {
  const no = shake(t - button.refusedAt);
  const press = 1 + wobble(t - button.pressedAt) * PRESS_DEPTH;
  button.face
    .setVisible(grown > 0)
    .setPosition(x + no * button.home.r * SHAKE_REACH, y)
    .setRotation(no * SHAKE_TURN)
    .setScale((press * grown) / button.ratio);
}

/**
 * Stands `button` at `home` showing `face`, `ratio` device pixels to a CSS
 * pixel, baking its face afresh only when one of the three has changed.
 */
export function placeButton(
  button: Button,
  home: Circle,
  ratio: number,
  { look, draw }: Face,
): void {
  const key = [home.x, home.y, home.r, ratio, look].join(' ');
  if (key !== button.baked) {
    button.bake(draw, home, ratio);
    button.baked = key;
  }
  button.home = home;
  button.ratio = ratio;
  button.face.setPosition(home.x, home.y);
  button.hit.setTo(
    button.face.displayOriginX,
    button.face.displayOriginY,
    tapReach(home.r) * ratio,
  );
}
