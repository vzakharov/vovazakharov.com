import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Meadow, Planted } from '../../model/game';
import { placedAt, type Point } from '../../model/geometry';
import { paintedSpots } from '../../model/house';
import {
  beckon,
  breath,
  emerge,
  letGo,
  lightUp,
  type Lit,
  phaseOf,
  sink,
  SINK_DURATION,
  type Sprouted,
  type Tapped,
  UNLIT,
  widthFor,
  wobble,
} from '../../model/motion';
import { type MushroomGenes, mushroomGenes } from '../../model/mushroom-genes';
import {
  TAP_PARTS,
  type TapArea,
  tapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { capFrame, capSeat, splayed } from '../../model/mushroom-pose';
import { capSurface } from '../../model/mushroom-profile';
import type { Footed } from '../../model/placement';
import { bedPlace, layoutPlace, standAt, UNPLACED } from './bed-place';
import { placeIn } from './clump-layout';
import { doorInSight, standingAt } from './door-sight';
import { tappedDoor } from './door-tap';
import { drawMushroom, drawMushroomShadow } from './draw-mushroom';
import { containsMushroom } from './hit-areas';
import { type Body, HouseView } from './house-view';
import type { Lighting } from './ink';
import type { MeadowLayout } from './layout';
import { mushroomLights } from './mushroom-light';
import { MushroomSelection, type Selected } from './mushroom-selection';
import { hazeAhead, repaintsDue } from './repaint-queue';
import type { MeadowSound } from './sound';
import { puffFrom, puffSpores } from './spores';
import type { Following, View } from './view';

/** Above everything in the meadow, whose depth is where its foot stands. */
const SPORE_DEPTH = 1e5;
/** A tapped mushroom's rock to and fro, against its squash. */
const WOBBLE_ROCK = 0.35;
/** How much wider a shadow spreads per unit of the mushroom's squash. */
const SHADOW_SPREAD = 0.6;
/** How much nearer than its mushroom its shadow is drawn: just behind it, before anything standing behind it. */
const SHADOW_NEARER = -0.5;

/** `spots`: those its house left painted (`paintedSpots`) when it was last drawn. */
type Shown = Tapped &
  Sprouted &
  Lit &
  Body &
  Pick<MushroomGenes, 'spots'> &
  Footed &
  Selected & {
    /** Apart from `graphics`, so it stays on the ground as the mushroom moves. */
    shadow: Phaser.GameObjects.Graphics;
    /** Its windows and door, which follow it. */
    house: HouseView;
    /** When it was removed, and starts sinking; `Infinity` while it stands. */
    goneAt: number;
    /** Where the layout stands its foot, in world px at the opening eye. */
    laid: Point;
  };

/**
 * The meadow's mushrooms on screen, reconciled with the state by id: a new
 * one grows out of the ground, a removed one sinks back into it and is
 * destroyed once it has, and every one stands where the layout stands its foot.
 */
export class MushroomBed implements Following {
  private readonly shown = new Map<string, Shown>();
  /** The view it last followed; `undefined` while it stands as laid out. */
  private view: View | undefined;
  private readonly selection: MushroomSelection;
  private selected: string | undefined;
  /** The screen's light as it last stood, which each mushroom takes from where it stands (`mushroomLights`). */
  private lighting: Lighting | undefined;

  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  private readonly onTap: (id: string) => void;
  /** Seconds on the scene's clock, which every movement is timed by. */
  private readonly now: () => number;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    onTap: (id: string) => void,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.onTap = onTap;
    this.now = now;
    this.selection = new MushroomSelection(scene);
  }

  /**
   * Shows what `meadow` holds as of `clock`. A mushroom already there when
   * the meadow opens is shown standing, with no growth.
   */
  reconcile(
    { mushrooms, selected }: Meadow,
    layout: MeadowLayout,
    clock: number,
    opening = false,
  ): void {
    const ids = new Set(mushrooms.map(({ id }) => id));
    for (const [id, shown] of this.shown) {
      if (ids.has(id) || shown.goneAt !== Infinity) continue;
      shown.goneAt = clock;
      shown.graphics.disableInteractive();
      shown.house.disable();
      this.voice.sink();
    }
    const planted = new Set<string>();
    for (const mushroom of mushrooms) {
      if (this.shown.has(mushroom.id)) continue;
      const shown = this.show(mushroom, opening ? -Infinity : clock);
      this.place(shown, mushroom, layout);
      planted.add(mushroom.id);
      if (!opening) {
        puffSpores(
          this.scene,
          () => ({ ...pick(shown.graphics, 'x', 'y'), r: shown.size * 0.5 }),
          SPORE_DEPTH,
        );
        this.voice.grow();
      }
    }
    // A door going in is seated among the mushrooms standing now; one
    // already in stays where it is, whatever grows in front of it since.
    this.seatDoors(
      mushrooms,
      layout,
      (shown, { house }) => house.door && !shown.house.doored,
    );
    for (const mushroom of mushrooms) {
      const shown = this.shown.get(mushroom.id);
      if (!shown) continue;
      // A window over a spot takes its place, so the mushroom is drawn again without it.
      const spots = paintedSpots(shown.genes, mushroom.house);
      if (spots.length !== shown.spots.length) {
        this.place(shown, mushroom, layout);
      }
      shown.house.furnish(
        mushroom.house,
        shown,
        clock,
        opening || planted.has(mushroom.id),
      );
    }
    if (selected !== this.selected) {
      const was = this.lit();
      if (was) Object.assign(was, letGo(was, clock));
      this.selected = selected;
      const now = this.lit();
      if (now) Object.assign(now, lightUp(now, clock));
    }
    this.selection.paint(this.lit());
  }

  /**
   * Stands every mushroom where `layout` stands its foot, into the objects it has,
   * and seats every door afresh among them as they now stand.
   */
  paint(meadow: Meadow, layout: MeadowLayout, lighting: Lighting): void {
    this.lighting = lighting;
    for (const mushroom of meadow.mushrooms) {
      const shown = this.shown.get(mushroom.id);
      if (shown) this.place(shown, mushroom, layout);
    }
    this.seatDoors(meadow.mushrooms, layout, (shown) => shown.house.doored);
    this.selection.paint(this.lit());
  }

  /**
   * Stands every mushroom where `view` sees its foot, and repaints the
   * nearest few whose haze there has drifted from their paint (`repaintsDue`).
   */
  follow(view: View): void {
    this.view = view;
    const hazing = [...this.shown.values()].flatMap((shown) => {
      this.stand(shown);
      const haze = this.hazeHere(shown);
      return haze === undefined || shown.goneAt !== Infinity
        ? []
        : [
            {
              shown,
              haze,
              painted: shown.haze,
              ...pick(shown.stands, 'ahead'),
            },
          ];
    });
    const lit = this.lit();
    if (lit) this.selection.stand(lit);
    for (const { shown, haze } of repaintsDue(hazing)) {
      shown.haze = haze;
      this.paintBody(shown);
    }
  }

  update(t: number): void {
    for (const [id, shown] of this.shown) {
      const {
        graphics,
        shadow,
        house,
        plantedAt,
        goneAt,
        tappedAt,
        phase,
        turn,
        stands: { zoom },
      } = shown;
      const grown = Math.min(emerge(t - plantedAt), sink(t - goneAt));
      if (t - goneAt >= SINK_DURATION) {
        graphics.destroy();
        shadow.destroy();
        house.destroy();
        this.shown.delete(id);
        continue;
      }
      const bounce = wobble(t - tappedAt);
      const stretch = breath(t, phase) + bounce + beckon(t, shown);
      graphics
        .setScale(
          widthFor(stretch) * grown * zoom,
          (1 + stretch) * grown * zoom,
        )
        .setRotation(turn + bounce * WOBBLE_ROCK);
      house.update(t, shown);
      shadow.setScale(
        (1 + Math.max(0, -stretch) * SHADOW_SPREAD) * grown * zoom,
        grown * zoom,
      );
      if (id === this.selected) this.selection.pose(shown);
    }
  }

  /**
   * Where a butterfly sits on `id`'s cap as it stands this frame, `across`
   * from -1 to 1 of the way from the crown toward either rim, in world px at
   * the opening eye, where the insects fly; `undefined` once it has sunk away.
   */
  capTop(id: string, across: number): Point | undefined {
    const shown = this.shown.get(id);
    if (!shown) return undefined;
    const { genes, size, graphics, laid, stands } = shown;
    const seat = toCanvas(size)(capSeat(genes, across));
    return placedAt(laid, graphics.rotation, {
      x: (seat.x * graphics.scaleX) / stands.zoom,
      y: (seat.y * graphics.scaleY) / stands.zoom,
    });
  }

  /**
   * Seats the door of each of `mushrooms` that `due` picks where the ones in
   * front of it, as `layout` stands them, leave it in sight (`doorInSight`).
   */
  private seatDoors(
    mushrooms: readonly Planted[],
    layout: MeadowLayout,
    due: (shown: Shown, mushroom: Planted) => boolean,
  ): void {
    const standing = mushrooms.flatMap((mushroom) => {
      const shown = this.shown.get(mushroom.id);
      const place = placeIn(layout.mushrooms, mushroom);
      return shown && place
        ? [{ mushroom, shown, standing: standingAt(place, mushroom) }]
        : [];
    });
    const everyone = standing.map((each) => each.standing);
    for (const { mushroom, shown, standing: self } of standing) {
      if (!due(shown, mushroom)) continue;
      shown.door = doorInSight(self, everyone);
      shown.house.repaint();
    }
  }

  private lit(): Shown | undefined {
    return this.selected === undefined
      ? undefined
      : this.shown.get(this.selected);
  }

  private place(shown: Shown, mushroom: Planted, layout: MeadowLayout): void {
    const place = placeIn(layout.mushrooms, mushroom);
    if (!place) return;
    const { x, y, size, splay, haze } = place;
    const stood = splayed(mushroomGenes(mushroom), splay);
    const { genes, turn } = stood;
    const spots = paintedSpots(genes, mushroom.house);
    const { body: lighting, ground } = mushroomLights(
      this.requireLighting(),
      stood,
      place,
      layout.sun,
    );
    Object.assign(shown, { genes, turn, size, spots, lighting });
    shown.laid = { x, y };
    this.stand(shown);
    shown.haze = this.hazeHere(shown) ?? haze;
    this.paintBody(shown);
    shown.shadow.clear();
    drawMushroomShadow(shown.shadow, genes, size, ground, turn);
    // Written into the hit area `show` registered, the object Phaser keeps testing.
    const canvas = toCanvas(size);
    const area = tapArea(genes, turn);
    for (const part of TAP_PARTS) {
      shown.hit[part] = area[part].map((point) => canvas(point));
    }
  }

  /** Paints `shown`'s body and its house as it now stands, at its haze and light. */
  private paintBody(shown: Shown): void {
    const { graphics, genes, spots, size, lighting, haze, turn, house } = shown;
    graphics.clear();
    drawMushroom(graphics, { ...genes, spots }, size, lighting, { haze, turn });
    house.repaint();
  }

  /** The haze where the view stands `shown`; `undefined` with no view, or out of its sight. */
  private hazeHere({ stands }: Shown): number | undefined {
    return this.view && stands.drawn
      ? hazeAhead(this.view, stands.ahead)
      : undefined;
  }

  /** Stands `shown`, its shadow and its house where the view, or else the layout, puts its foot. */
  private stand(shown: Shown): void {
    const place = this.view
      ? bedPlace(this.view, shown.foot)
      : layoutPlace(shown.laid);
    shown.stands = place;
    standAt(shown.graphics, place);
    standAt(shown.shadow, place, SHADOW_NEARER);
    shown.house.stand(place);
  }

  private requireLighting(): Lighting {
    if (!this.lighting) throw new Error('A mushroom is drawn before its paint');
    return this.lighting;
  }

  private show(mushroom: Planted, plantedAt: number): Shown {
    const hit: TapArea = { cap: [], gills: [], stem: [] };
    // As a config: Phaser reads any other plain object passed here as one,
    // finds no callback in it and leaves the object hit-testing as `null`.
    const graphics = this.scene.add
      .graphics()
      .setInteractive({ hitArea: hit, hitAreaCallback: containsMushroom });
    const shown: Shown = {
      graphics,
      shadow: this.scene.add.graphics(),
      ...pick(mushroom, 'foot'),
      laid: { x: 0, y: 0 },
      stands: UNPLACED,
      hit,
      genes: mushroomGenes(mushroom),
      turn: 0,
      door: undefined,
      spots: [],
      size: 0,
      haze: 0,
      lighting: this.requireLighting(),
      house: new HouseView(
        this.scene,
        this.voice,
        this.now,
        phaseOf(mushroom),
        SPORE_DEPTH,
        mushroom.foot,
        this.nearestDoor,
      ),
      phase: phaseOf(mushroom),
      tappedAt: -Infinity,
      ...UNLIT,
      plantedAt,
      goneAt: Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.tap(mushroom.id);
    });
    this.shown.set(mushroom.id, shown);
    return shown;
  }

  /** Whether a tap at `at`, on screen, goes to `house`'s door of all the shown doors (`tappedDoor`). */
  private readonly nearestDoor = (house: HouseView, at: Point): boolean => {
    const doors = [...this.shown.values()].flatMap(({ house: other }) => {
      const middle = other.doorMiddle();
      return middle
        ? [{ house: other, ...middle, holds: (p: Point) => other.holdsTap(p) }]
        : [];
    });
    return tappedDoor(at, doors)?.house === house;
  };

  /**
   * Answers a tap on `id`'s mushroom, whether it landed there or went
   * through a butterfly resting on it. A mushroom sinking away takes no tap.
   */
  tap(id: string): void {
    const shown = this.shown.get(id);
    if (shown?.goneAt !== Infinity) return;
    shown.tappedAt = this.now();
    const { genes, size } = shown;
    const crown = capFrame(genes)({ x: 0, y: capSurface(genes, 0) * 0.9 });
    puffFrom(this.scene, shown, crown, 0.75, SPORE_DEPTH);
    this.voice.boing(Math.min(1.4, 180 / size));
    this.onTap(id);
  }
}
