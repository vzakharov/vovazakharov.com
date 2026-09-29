import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { type DoorPlace, type House, windowSlots } from '../../model/house';
import {
  blink,
  emerge,
  EMERGE_DURATION,
  lookAbout,
  mouseOut,
  type Tapped,
} from '../../model/motion';
import { capFrame, type Splayed } from '../../model/mushroom-pose';
import { mix } from './colour';
import { doorHitArea, mouseHead } from './door-reach';
import { paintHouse } from './draw-house';
import { containsOutline } from './hit-areas';
import type { Lighted } from './ink';
import type { Footing } from './layout';
import type { HazedGraphics } from './mushroom-paint';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';
import { puffFrom } from './spores';

/** How much sooner than its mouse's head a door swings all the way open. */
const DOOR_LEAD = 2;

/** Where `body`'s door stands, which the bed seats before any door goes in. */
function seated({ door }: Body): DoorPlace {
  if (!door) throw new Error('A door put in with no seat on its stem');
  return door;
}

/**
 * The mushroom a house stands in, as the bed last stood and moved it, and
 * where on its stem the bed seated its door: `undefined` until a door needs
 * one.
 */
export type Body = HazedGraphics &
  Pick<Footing, 'size'> &
  Lighted &
  Splayed & {
    door: DoorPlace | undefined;
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
  /** Where the door answers a tap (`doorHitArea`), in the graphics' own frame; empty with no door. */
  private readonly hit: Point[] = [];
  /** The mouse's peeks, and when a tap on its door called it out. */
  readonly mouse: Tapped;
  /** How far across its mouse's head was drawn at the last paint, in the graphics' own pixels: 0 with no door. */
  private shownHead = 0;
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
    nearest: (house: HouseView, at: Point) => boolean,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.puffDepth = puffDepth;
    this.mouse = { phase, tappedAt: -Infinity };
    this.graphics = scene.add.graphics().setInteractive({
      hitArea: this.hit,
      // Where two doors' tap areas overlap, the bed hands the tap to one (`tappedDoor`).
      hitAreaCallback: (area: readonly Point[], x: number, y: number) =>
        containsOutline(area, x, y) && nearest(this, this.onScreen({ x, y })),
    });
    // A door is part of its mushroom, not the meadow: its tap leaves an open picker open.
    this.graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.mouse.tappedAt = this.now();
      this.voice.squeak();
    });
  }

  /** The middle of the door's tap area on screen; `undefined` with no door. */
  doorMiddle(): Point | undefined {
    if (this.hit.length === 0) return undefined;
    const count = this.hit.length;
    return this.onScreen({
      x: this.hit.reduce((sum, { x }) => sum + x, 0) / count,
      y: this.hit.reduce((sum, { y }) => sum + y, 0) / count,
    });
  }

  /** Whether the door's tap area holds `at`, on screen: never with no door, or once out of reach (`disable`). */
  holdsTap(at: Point): boolean {
    if (this.graphics.input?.enabled !== true) return false;
    const { x, y } = this.graphics
      .getWorldTransformMatrix()
      .applyInverse(at.x, at.y);
    return containsOutline(this.hit, x, y);
  }

  private onScreen({ x, y }: Point): Point {
    const { x: sx, y: sy } = this.graphics
      .getWorldTransformMatrix()
      .transformPoint(x, y, { x: 0, y: 0 });
    return { x: sx, y: sy };
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
      const { x, y } = seated(body);
      if (!opening) this.puff(body, { x, y });
    }
    if (added && !opening) this.voice.knock();
    this.house = house;
    this.stale = true;
  }

  /** Whether its door is in, so that where it stands on the stem is settled. */
  get doored(): boolean {
    return this.doorAt !== undefined;
  }

  /** How far across the mouse's head is drawn on screen, as the probe reads it. */
  get drawnHead(): number {
    return this.shownHead * this.graphics.scaleX;
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
    const { genes, size, haze, lighting } = body;
    const house = this.house;
    this.graphics.clear();
    this.hit.length = 0;
    this.shownHead = 0;
    if (!house) return;
    const brush = {
      ink: Math.max(1.5, size * 0.01),
      tone: (colour: number) => mix(colour, PALETTE.air, haze),
      lighting,
    };
    const windows = house.windows.map((kind, index) => ({
      kind,
      popped: emerge(t - (this.windowsAt[index] ?? -Infinity)),
    }));
    const door =
      this.doorAt === undefined
        ? undefined
        : {
            station: seated(body),
            popped: emerge(t - this.doorAt),
            open: Math.min(1, out * DOOR_LEAD),
            out,
            look: lookAbout(t, this.mouse.phase),
            shut: blink(t, this.mouse.phase),
          };
    paintHouse(this.graphics, genes, size, windows, door, brush);
    if (!door) return;
    this.hit.push(...doorHitArea(door.station, size));
    this.shownHead = mouseHead(door.station.width * size * door.popped);
  }

  /** A puff of spores from `point`, in the mushroom's frame, where it stands on screen. */
  private puff(body: Body, point: Point): void {
    puffFrom(this.scene, body, point, 0.35, this.puffDepth);
  }
}
