import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Meadow, Planted } from '../../model/game';
import { placedAt, type Point } from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
import { type DoorPlace, paintedSpots } from '../../model/house';
import { headedLight } from '../../model/light';
import { letGo, lightUp, phaseOf, SINK_DURATION } from '../../model/motion';
import { type MushroomGenes, mushroomGenes } from '../../model/mushroom-genes';
import {
  TAP_PARTS,
  type TapArea,
  tapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { splayed } from '../../model/mushroom-pose';
import { onHost, standAt, viewedOrLaid } from './bed-place';
import { laidOf, placeIn } from './clump-layout';
import { doorSeats } from './door-seats';
import { tappedDoor } from './door-tap';
import type { Lights } from './dusk-view';
import { containsMushroom } from './hit-areas';
import { HouseView } from './house-view';
import type { Lighting } from './ink';
import type { MeadowLayout } from './layout';
import { MouseRuns } from './mouse-runs';
import { moveMushroom } from './mushroom-frame';
import { mushroomLights } from './mushroom-light';
import { MushroomSelection } from './mushroom-selection';
import {
  paintLit,
  type Shown,
  stepsHere,
  unplacedShown,
} from './mushroom-shown';
import type { Seat } from './perch-hosts';
import {
  type Detailing,
  type Dusking,
  hazeAhead,
  type Hazing,
  repaintsDue,
} from './repaint-queue';
import type { MeadowSound } from './sound';
import { SporeBed } from './spore-bed';
import { crownOf, driftSpores } from './spore-drift';
import { drawnSize, puffFrom } from './spores';
import type { Following, View } from './view';

/** Above everything in the meadow, whose depth is where its foot stands. */
const SPORE_DEPTH = 1e5;
/** How much nearer than its mushroom its shadow is drawn: just behind it, before anything standing behind it. */
const SHADOW_NEARER = -0.5;

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
  /** The spores lying on the ground, which the meadow's bare-ground tap picks up. */
  readonly spores: SporeBed;
  private selected: string | undefined;
  /** The screen's light as it last stood, which each mushroom takes from where it stands (`mushroomLights`). */
  private lighting: Lighting | undefined;
  /** How far toward dusk the meadow showed at the last frame (`duskness`), which the haze's air turns with. */
  private dusk = 0;
  /** How many mice each house holds, and their runs between the houses. */
  readonly runs: MouseRuns;

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
    this.spores = new SporeBed(scene, voice, SPORE_DEPTH, SHADOW_NEARER);
    this.runs = new MouseRuns(scene, voice, now, () => this.shown);
  }

  /**
   * Shows what `meadow` holds as of `clock`. A mushroom already there when
   * the meadow opens is shown standing, with no growth.
   */
  reconcile(
    { mushrooms, selected, spores }: Meadow,
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
      this.runs.sink(id, clock);
      this.voice.sink();
    }
    const planted = new Set<string>();
    const born: Shown[] = [];
    for (const mushroom of mushrooms) {
      if (this.shown.has(mushroom.id)) continue;
      const shown = this.show(mushroom, opening ? -Infinity : clock);
      this.place(shown, mushroom, layout);
      planted.add(mushroom.id);
      if (!opening) born.push(shown);
    }
    driftSpores(this.scene, this.voice, born, SPORE_DEPTH);
    this.spores.reconcile(spores, this.shown, layout, opening);
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
   * Stands every mushroom where `layout` stands its foot, into the objects it
   * has. A door keeps the station it was seated at, which is in its
   * mushroom's own frame and so grows and shrinks with it.
   */
  paint(meadow: Meadow, layout: MeadowLayout, lighting: Lighting): void {
    this.lighting = lighting;
    for (const mushroom of meadow.mushrooms) {
      const shown = this.shown.get(mushroom.id);
      if (shown) this.place(shown, mushroom, layout);
    }
    this.spores.reconcile(meadow.spores, this.shown, layout, false);
    this.selection.paint(this.lit());
  }

  /**
   * Stands every mushroom where `view` sees its foot, and repaints the
   * nearest few whose haze there, sun side from its heading, chords to a
   * curve for its size there, or air the dusk turns have drifted from their
   * paint (`repaintsDue`).
   */
  follow(view: View): void {
    this.view = view;
    this.spores.follow(view);
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
              sunSide: headedLight(shown.sunFrom, view.eye.heading).toward.x,
              ...pick(shown, 'paintedSunSide'),
              steps: stepsHere(shown),
              paintedSteps: shown.steps,
              ...this.dusking(shown),
            },
          ];
    });
    const lit = this.lit();
    if (lit) this.selection.stand(lit);
    this.repaint(hazing);
  }

  /**
   * Moves every mushroom at `t`, in seconds (`moveMushroom`), in the meadow's
   * `wetness` and the dusk's `lights`, its ring and the seats on its cap
   * following its drawing, and its haze toward the air as `dusk`
   * (`duskness`) turns it; destroys one once it has sunk away.
   */
  update(t: number, wetness: number, lights?: Lights, dusk = 0): void {
    this.dusk = dusk;
    // Laid out, with no view to follow, the far ones still turn with the dusk.
    if (!this.view) {
      const standing = [...this.shown.values()].filter(
        ({ goneAt }) => goneAt === Infinity,
      );
      this.repaint(
        standing.map((shown) => ({
          shown,
          ...pick(shown, 'haze', 'paintedSunSide'),
          painted: shown.haze,
          ...pick(shown.stands, 'ahead'),
          sunSide: shown.paintedSunSide,
          ...this.dusking(shown),
        })),
      );
    }
    for (const [id, shown] of this.shown) {
      if (t - shown.goneAt >= SINK_DURATION) {
        shown.graphics.destroy();
        shown.shadow.destroy();
        shown.house.destroy();
        this.shown.delete(id);
        continue;
      }
      moveMushroom(shown, t, wetness, lights);
      if (id === this.selected) this.selection.pose(shown);
    }
    this.runs.update(t, this.view);
  }

  /** Where on its stem the bed seated `id`'s door: `undefined` while it has none. */
  seatedDoor(id: string): DoorPlace | undefined {
    return this.shown.get(id)?.door;
  }

  /**
   * Where an insect sits on or under `id`'s cap as it stands this frame, at
   * the point `local` puts in its own frame from its genes (`capSeat`,
   * `capUnder`), in world px at the opening eye, where the insects fly, and
   * the mushroom it sits on, which draws it, with the seat as it draws it
   * this frame; `undefined` for a mushroom it does not hold.
   */
  seat(id: string, local: (genes: MushroomGenes) => Point): Seat | undefined {
    const shown = this.shown.get(id);
    if (!shown) return undefined;
    const { genes, size, graphics, laid, stands } = shown;
    const seat = toCanvas(size)(local(genes));
    const on = { laidFoot: laid, ...pick(shown, 'stands', 'foot', 'opening') };
    const at = placedAt(laid, graphics.rotation, {
      x: (seat.x * graphics.scaleX) / stands.zoom,
      y: (seat.y * graphics.scaleY) / stands.zoom,
    });
    return { ...at, on, drawn: onHost(on, at) };
  }

  /** Seats the door of each of `mushrooms` shown that `due` picks, as the eye stands now (`doorSeats`). */
  private seatDoors(
    mushrooms: readonly Planted[],
    layout: MeadowLayout,
    due: (shown: Shown, mushroom: Planted) => boolean,
  ): void {
    const shown = mushrooms.flatMap((mushroom) => {
      const each = this.shown.get(mushroom.id);
      return each ? [{ ...mushroom, shown: each }] : [];
    });
    const eye = this.view?.eye ?? OPENING_EYE;
    const seats = doorSeats(layout.mushrooms, eye, shown, (mushroom) =>
      due(mushroom.shown, mushroom),
    );
    for (const { id, shown: each } of shown) {
      const seat = seats.get(id);
      if (!seat) continue;
      each.door = seat;
      each.house.repaint();
    }
  }

  private lit(): Shown | undefined {
    return this.selected === undefined
      ? undefined
      : this.shown.get(this.selected);
  }

  private place(shown: Shown, mushroom: Planted, layout: MeadowLayout): void {
    const laid = laidOf(layout.camera, mushroom);
    const { x, y, size, splay, haze, opening } = laid;
    const stood = splayed(mushroomGenes(mushroom), splay);
    const { genes, turn } = stood;
    const spots = paintedSpots(genes, mushroom.house);
    const light = this.requireLighting();
    // Lit from where the layout stands it, toward the layout's sun, as the
    // opening eye sees it there, then turned by the heading.
    const at = placeIn(layout.mushrooms, mushroom) ?? laid;
    const lightsAt = (heading: number) =>
      mushroomLights(light, stood, at, layout.sun, heading);
    const sunFrom = lightsAt(OPENING_EYE.heading).ground;
    Object.assign(shown, { genes, turn, size, spots, lightsAt, sunFrom });
    // Written into the hit area `show` registered, the object Phaser keeps testing.
    const canvas = toCanvas(size);
    const area = tapArea(genes, turn);
    for (const part of TAP_PARTS) {
      shown.hit[part] = area[part].map((point) => canvas(point));
    }
    shown.tall = -Math.min(
      ...TAP_PARTS.flatMap((part) => shown.hit[part].map((point) => point.y)),
    );
    Object.assign(shown, { laid: { x, y }, opening });
    this.stand(shown);
    shown.haze = this.hazeHere(shown) ?? haze;
    shown.dusk = this.dusk;
    paintLit(shown, this.heading);
  }

  /** The dusk now and the one `shown` was painted at. */
  private dusking({ dusk: paintedDusk }: Shown): Dusking {
    const { dusk } = this;
    return { dusk, paintedDusk };
  }

  /** Repaints those of `hazing` due (`repaintsDue`) at their haze now and the dusk's air. */
  private repaint(
    hazing: ReadonlyArray<
      Hazing & Partial<Detailing> & Dusking & { shown: Shown }
    >,
  ): void {
    const { dusk, heading } = this;
    for (const { shown, haze } of repaintsDue(hazing)) {
      Object.assign(shown, { haze, dusk });
      paintLit(shown, heading);
    }
  }

  /** The heading the view looks along, which the mushrooms are lit from; the opening's while they stand as laid out. */
  private get heading(): number {
    return this.view?.eye.heading ?? OPENING_EYE.heading;
  }

  /** The haze where the view stands `shown`; `undefined` with no view, or out of its sight. */
  private hazeHere({ stands }: Shown): number | undefined {
    return this.view && stands.drawn ? hazeAhead(this.view, stands) : undefined;
  }

  /**
   * Stands `shown`, its shadow and its house where the view, or else the
   * layout, puts its foot: all three hidden together once it has sunk away.
   */
  private stand(shown: Shown): void {
    const place = viewedOrLaid(
      this.view,
      shown.foot,
      shown.laid,
      shown.tall,
      shown.opening,
    );
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
    const shown = unplacedShown(mushroom, plantedAt, this.requireLighting(), {
      graphics,
      hit,
      shadow: this.scene.add.graphics(),
      house: new HouseView(
        this.scene,
        this.voice,
        this.now,
        phaseOf(mushroom),
        SPORE_DEPTH,
        this.nearestDoor,
        this.runs.doorOf(mushroom),
      ),
    });
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
    puffFrom(this.scene, shown, crownOf(shown.genes), 0.75, SPORE_DEPTH);
    this.voice.boing(Math.min(1.4, 180 / drawnSize(shown)));
    this.onTap(id);
  }
}
