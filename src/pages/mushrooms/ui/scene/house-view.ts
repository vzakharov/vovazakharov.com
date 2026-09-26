import * as Phaser from 'phaser';

import { placedAt, type Point } from '../../model/geometry';
import { doorPlace, type House, windowSlots } from '../../model/house';
import {
  blink,
  emerge,
  EMERGE_DURATION,
  lookAbout,
  mouseOut,
  type Tapped,
} from '../../model/motion';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import { mix } from './colour';
import { doorFrame, doorway, paintHouse } from './draw-house';
import { containsOutline, type WithGraphics } from './hit-areas';
import type { Footing, Hazed } from './layout';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';
import { puffSpores } from './spores';

/** How much sooner than its mouse's head a door swings all the way open. */
const DOOR_LEAD = 2;

/** The mushroom a house stands in, as the bed last stood and moved it. */
export type Body = WithGraphics &
  Pick<Footing, 'size'> &
  Hazed & {
    genes: MushroomGenes;
    turn: number;
  };

/**
 * One mushroom's windows and door, in a graphics of their own that takes the
 * mushroom's pose every frame, just in front of it, so they grow, wobble and
 * sink with it. The door is this graphics' hit area and the windows are not,
 * so a tap on a window falls through to the mushroom.
 */
export class HouseView {
  readonly graphics: Phaser.GameObjects.Graphics;
  /** When each window was put in, in `House.windows`' order. */
  private readonly windowsAt: number[] = [];
  /** When the door was put in; `undefined` while there is none. */
  private doorAt: number | undefined;
  private house: House | undefined;
  /** The door on screen, in the graphics' own frame; empty with no door. */
  private readonly hit: Point[] = [];
  /** The mouse's peeks, and when a tap on its door called it out. */
  readonly mouse: Tapped;
  /** How far out the mouse was at the last paint, so a still house is left be. */
  private shownOut = 0;
  private stale = true;
  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  private readonly now: () => number;
  private readonly puffDepth: number;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    phase: number,
    puffDepth: number,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.puffDepth = puffDepth;
    this.mouse = { phase, tappedAt: -Infinity };
    this.graphics = scene.add
      .graphics()
      .setInteractive({ hitArea: this.hit, hitAreaCallback: containsOutline });
    this.graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.mouse.tappedAt = this.now();
      this.voice.squeak();
    });
  }

  /**
   * Takes in `house` as of `clock`: each window or door new since the last
   * call pops in with a puff and a knock, unless the meadow is `opening`.
   */
  furnish(house: House, body: Body, clock: number, opening: boolean): void {
    if (house === this.house) return;
    const at = opening ? -Infinity : clock;
    const added =
      house.windows.length > this.windowsAt.length ||
      (house.door && this.doorAt === undefined);
    const slots = windowSlots(body.genes);
    for (
      let index = this.windowsAt.length;
      index < house.windows.length;
      index++
    ) {
      this.windowsAt.push(at);
      const slot = slots[index];
      if (slot && !opening) this.puff(body, capFrame(body.genes)(slot));
    }
    if (house.door && this.doorAt === undefined) {
      this.doorAt = at;
      const { x, y } = doorPlace(body.genes);
      if (!opening) this.puff(body, { x, y });
    }
    if (added && !opening) this.voice.knock();
    this.house = house;
    this.stale = true;
  }

  /** Marks the house for a repaint, as a resize or a repaint of its mushroom needs. */
  repaint(): void {
    this.stale = true;
  }

  /** Out of reach of a tap, as its mushroom sinks. */
  disable(): void {
    this.graphics.disableInteractive();
  }

  destroy(): void {
    this.graphics.destroy();
  }

  /** How far the mouse is out of its door at `t`: 0 with no door. */
  out(t: number): number {
    return this.doorAt === undefined ? 0 : mouseOut(t, this.mouse);
  }

  /** Follows `body`'s pose as of `t`, and repaints what has moved. */
  update(t: number, body: Body): void {
    const { graphics } = body;
    this.graphics
      .setPosition(graphics.x, graphics.y)
      .setScale(graphics.scaleX, graphics.scaleY)
      .setRotation(graphics.rotation)
      .setDepth(graphics.depth + 0.1)
      .setVisible(graphics.visible);
    const out = this.out(t);
    const popping = [...this.windowsAt, this.doorAt ?? -Infinity].some(
      (at) => t - at < EMERGE_DURATION,
    );
    if (!this.stale && !popping && out === 0 && this.shownOut === 0) return;
    this.stale = false;
    this.shownOut = out;
    this.paint(t, body, out);
  }

  private paint(t: number, body: Body, out: number): void {
    const { genes, size, haze } = body;
    const house = this.house;
    this.graphics.clear();
    this.hit.length = 0;
    if (!house) return;
    const brush = {
      ink: Math.max(1.5, size * 0.01),
      tone: (colour: number) => mix(colour, PALETTE.skyHorizon, haze),
    };
    const windows = house.windows.map((kind, index) => ({
      kind,
      popped: emerge(t - (this.windowsAt[index] ?? -Infinity)),
    }));
    const door =
      this.doorAt === undefined
        ? undefined
        : {
            popped: emerge(t - this.doorAt),
            open: Math.min(1, out * DOOR_LEAD),
            out,
            look: lookAbout(t, this.mouse.phase),
            shut: blink(t, this.mouse.phase),
          };
    paintHouse(this.graphics, genes, size, windows, door, brush);
    if (door) {
      const { place, aspect } = doorFrame(genes, size, 1);
      this.hit.push(...doorway(aspect).map((point) => place(point)));
    }
  }

  /** A puff of spores from `point`, in the mushroom's frame, where it stands on screen. */
  private puff({ graphics, turn, size, genes }: Body, point: Point): void {
    puffSpores(
      this.scene,
      placedAt(graphics, turn, toCanvas(size)(point)),
      genes.capWidth * size * 0.35,
      this.puffDepth,
    );
  }
}
