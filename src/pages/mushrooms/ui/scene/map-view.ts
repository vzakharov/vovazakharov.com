import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import type { Point } from '../../model/geometry';
import { type Camera, D_SEE, type Eye, type Eyed } from '../../model/ground';
import { doorStations, paintedSpots } from '../../model/house';
import {
  headingOnMap,
  type MapFrame,
  mapFrame,
  onMap,
  thingScale,
} from '../../model/map-frame';
import {
  emerge,
  EMERGE_DURATION,
  sink,
  SINK_DURATION,
} from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import type { AtRatio } from './baking';
import { sizeOn } from './clump-layout';
import { paintFlowerHead, paintFlowerStem } from './draw-flower';
import { paintHouse } from './draw-house';
import { drawMushroom } from './draw-mushroom';
import { flowersOf } from './flower-plots';
import type { Stand } from './flower-sight';
import { iconLighting } from './hud';
import type { Lighting } from './ink';
import { PALETTE } from './palette';
import { azimuthAt } from './panorama';
import { BUTTON_INSET } from './tap-reach';

/** What the map is drawn from as it opens: the meadow as it stands, the eye, and the screen's pixel ratio. */
export type MapSnapshot = Eyed & AtRatio & { stand: Stand };

/** How long the map takes to unfold out of its button, and to fold back, in seconds. */
const UNFOLD = 0.3;
/** How far in from the sheet's edge the meadow is framed, in CSS px: room for the sun at the top. */
const MARGIN = 26;
const CORNER = 14;
/** The least a mushroom's cap stands across on the map, in CSS px, and a flower's height. */
const LEAST_CAP = 12;
const LEAST_FLOWER = 9;
/** The spore's dot against the clump's size, and its least radius in CSS px. */
const SPORE_RADIUS = 0.06;
const LEAST_SPORE = 2;
const SUN_RADIUS = 7;
const SUN_RAYS = 8;
const CHILD_RADIUS = 5;
const ARROW = 16;
const WEDGE_ALPHA = 0.14;

/** A thing on the map: where it stands there, and how it is painted at that point. */
type Mark = Point & { paint: () => void };

/**
 * The map: a sheet of paper over the meadow that unfolds out of the map
 * button and folds back into it, drawn once as it opens from a snapshot —
 * nothing walks while it is open. Up is the sun's azimuth; the child is a
 * dot with his heading and his view's wedge. Any tap while it is open runs
 * `tap`, the map button's own handler, so the two close it alike.
 */
export class MapView {
  private isOpen = false;
  private openedAt = -Infinity;
  private closedAt = -Infinity;
  private sheet: Phaser.GameObjects.Container | undefined;
  private pen: Phaser.GameObjects.Graphics | undefined;
  private catcher: Phaser.GameObjects.Zone | undefined;

  private readonly now: () => number;
  private readonly snapshot: () => MapSnapshot | undefined;
  /** What the meadow lets go of as the map opens over it: the moves the keys hold. */
  private readonly letGo: () => void;

  constructor(
    now: () => number,
    snapshot: () => MapSnapshot | undefined,
    letGo: () => void,
  ) {
    this.now = now;
    this.snapshot = snapshot;
    this.letGo = letGo;
  }

  get open(): boolean {
    return this.isOpen;
  }

  /** Makes the sheet and the catch for taps over everything at `depth` but the map button. */
  mount(scene: Phaser.Scene, depth: number, tap: () => void): void {
    this.pen = scene.make.graphics({}, false);
    this.sheet = scene.add
      .container(0, 0, [this.pen])
      .setScrollFactor(0)
      .setDepth(depth)
      .setVisible(false);
    this.catcher = scene.add
      .zone(0, 0, 1, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth);
    this.catcher.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, tap);
    if (this.isOpen) this.redraw();
  }

  flip(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.openedAt = this.now();
      this.letGo();
      this.redraw();
    } else {
      this.closedAt = this.now();
      this.catcher?.removeInteractive();
    }
  }

  /** Draws the open map afresh, as the meadow and the screen stand now. */
  redraw(): void {
    const shot = this.snapshot();
    const { isOpen, pen, sheet, catcher } = this;
    if (!isOpen || !shot || !pen || !sheet || !catcher) return;
    const { width, height, map } = shot.stand.layout;
    sheet.setPosition(map.x, map.y);
    pen.clear().setPosition(-map.x, -map.y);
    drawMap(pen, shot);
    // Afresh, so the catch takes the screen's size as it is now.
    catcher.removeInteractive().setSize(width, height).setInteractive();
  }

  /** Unfolds the sheet out of the button, or folds it back, scale and alpha both. */
  update(t: number): void {
    const shown = this.isOpen
      ? emerge(((t - this.openedAt) * EMERGE_DURATION) / UNFOLD)
      : sink(((t - this.closedAt) * SINK_DURATION) / UNFOLD);
    this.sheet
      ?.setVisible(shown > 0)
      .setScale(shown)
      .setAlpha(Math.min(1, shown));
  }
}

function drawMap(pen: Phaser.GameObjects.Graphics, shot: MapSnapshot): void {
  const { stand, eye, ratio } = shot;
  const { width, height, camera, sun } = stand.layout;
  const hairline = 1 / ratio;
  const sheet = {
    left: BUTTON_INSET,
    top: BUTTON_INSET,
    width: width - 2 * BUTTON_INSET,
    height: height - 2 * BUTTON_INSET,
  };
  pen
    .fillStyle(PALETTE.paper)
    .fillRoundedRect(sheet.left, sheet.top, sheet.width, sheet.height, CORNER)
    .lineStyle(3, PALETTE.paperEdge)
    .strokeRoundedRect(
      sheet.left + 3,
      sheet.top + 3,
      sheet.width - 6,
      sheet.height - 6,
      CORNER - 3,
    )
    .lineStyle(2, PALETTE.ink)
    .strokeRoundedRect(
      sheet.left,
      sheet.top,
      sheet.width,
      sheet.height,
      CORNER,
    );
  const middle = { x: width / 2, y: height / 2 };
  drawSun(pen, { ...pick(middle, 'x'), y: sheet.top + MARGIN / 2 + 2 });
  const flowers = flowersOf(stand);
  const frame = mapFrame(
    eye,
    azimuthAt(camera, sun.x),
    [
      ...stand.mushrooms.map(({ foot }) => foot),
      ...stand.spores.map(({ foot }) => foot),
      ...flowers.map(({ place }) => place),
    ],
    {
      middle,
      width: sheet.width - 2 * MARGIN,
      height: sheet.height - 2 * MARGIN,
    },
  );
  drawView(pen, frame, eye, camera);
  const lighting = iconLighting(hairline);
  const marks: Mark[] = [
    ...stand.spores.map(({ foot }) => {
      const at = onMap(frame, foot);
      return {
        ...at,
        paint: () => {
          const r = Math.max(LEAST_SPORE, frame.scale * SPORE_RADIUS);
          pen
            .fillStyle(PALETTE.spore)
            .fillCircle(at.x, at.y, r)
            .lineStyle(1, PALETTE.ink, 0.45)
            .strokeCircle(at.x, at.y, r);
        },
      };
    }),
    ...flowers.map((flower) => {
      const at = onMap(frame, flower.place);
      return {
        ...at,
        paint: () => {
          const genes = flowerGenes(flower);
          const size = thingScale(frame, flower.place.size, LEAST_FLOWER);
          const head = flowerHead(genes, size);
          pen.save();
          pen.translateCanvas(at.x, at.y);
          paintFlowerStem(pen, genes, size, lighting);
          pen.translateCanvas(head.x, head.y);
          paintFlowerHead(pen, genes, size, lighting);
          pen.restore();
        },
      };
    }),
    ...stand.mushrooms.map((mushroom) => {
      const at = onMap(frame, mushroom.foot);
      return {
        ...at,
        paint: () => {
          const grown = mushroomGenes(mushroom);
          const genes = {
            ...grown,
            spots: paintedSpots(grown, mushroom.house),
          };
          const least = LEAST_CAP / genes.capWidth;
          const size = thingScale(frame, sizeOn(mushroom.foot), least);
          pen.save();
          pen.translateCanvas(at.x, at.y);
          drawMushroom(pen, genes, size, lighting);
          paintHome(pen, genes, size, mushroom.house, lighting);
          pen.restore();
        },
      };
    }),
  ];
  // Farther up the map first, so the nearer the bottom draws over it.
  for (const mark of marks.toSorted((a, b) => a.y - b.y)) mark.paint();
  drawChild(pen, frame, eye);
}

type Genes = Parameters<typeof paintHouse>[1];

function paintHome(
  pen: Phaser.GameObjects.Graphics,
  genes: Genes,
  size: number,
  house: Parameters<typeof paintedSpots>[1],
  lighting: Lighting,
): void {
  if (house.windows.length === 0 && !house.door) return;
  const station = house.door ? doorStations(genes)[0] : undefined;
  const door = station && {
    station,
    popped: 1,
    out: 0,
    open: 0,
    look: 0,
    shut: false,
  };
  const windows = house.windows.map((kind) => ({ kind, popped: 1 }));
  const brush = {
    ink: Math.max(1, size * 0.02),
    tone: (colour: number) => colour,
    lighting,
  };
  paintHouse(pen, genes, size, windows, door, brush);
}

/** The map's compass: a little sun at the top edge's middle, up being its azimuth. */
function drawSun(pen: Phaser.GameObjects.Graphics, { x, y }: Point): void {
  pen.lineStyle(2, PALETTE.sunRay);
  for (let ray = 0; ray < SUN_RAYS; ray++) {
    const angle = (ray / SUN_RAYS) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    pen.lineBetween(
      x + dx * SUN_RADIUS * 1.35,
      y + dy * SUN_RADIUS * 1.35,
      x + dx * SUN_RADIUS * 1.85,
      y + dy * SUN_RADIUS * 1.85,
    );
  }
  pen
    .fillStyle(PALETTE.sun)
    .fillCircle(x, y, SUN_RADIUS)
    .lineStyle(1.5, PALETTE.ink)
    .strokeCircle(x, y, SUN_RADIUS);
}

/** The pale wedge of what the child sees: the view's half-angle either side of his heading, `D_SEE` deep. */
function drawView(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  eye: Eye,
  camera: Camera,
): void {
  const at = onMap(frame, eye);
  const half = (azimuthAt(camera, camera.width) - azimuthAt(camera, 0)) / 2;
  const angle = (heading: number) => {
    const along = headingOnMap(frame, heading);
    return Math.atan2(along.y, along.x);
  };
  pen
    .fillStyle(PALETTE.inkCool, WEDGE_ALPHA)
    .slice(
      at.x,
      at.y,
      D_SEE * frame.scale,
      angle(eye.heading - half),
      angle(eye.heading + half),
      false,
    )
    .fillPath();
}

/** The child: an indigo dot where he stands, an arrow on his heading. */
function drawChild(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  { heading, ...eye }: Eye,
): void {
  const at = onMap(frame, eye);
  const along = headingOnMap(frame, heading);
  const tip = { x: at.x + along.x * ARROW, y: at.y + along.y * ARROW };
  const barb = (side: number) => ({
    x: tip.x - along.x * 6 + side * along.y * 4,
    y: tip.y - along.y * 6 - side * along.x * 4,
  });
  const left = barb(1);
  const right = barb(-1);
  pen
    .lineStyle(2.5, PALETTE.inkCool)
    .lineBetween(at.x, at.y, tip.x, tip.y)
    .fillStyle(PALETTE.inkCool)
    .fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y)
    .fillCircle(at.x, at.y, CHILD_RADIUS)
    .lineStyle(1.5, PALETTE.hud)
    .strokeCircle(at.x, at.y, CHILD_RADIUS);
}
