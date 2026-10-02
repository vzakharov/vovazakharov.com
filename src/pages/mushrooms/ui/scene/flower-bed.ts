import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { type Flower, flowerGenes } from '../../model/flower-genes';
import { soundOf } from '../../model/flower-sounds';
import type { Action, Meadow } from '../../model/game';
import { placedAt } from '../../model/geometry';
import { CLUMP_DISTANCE, OPENING_EYE } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import { type Dip, drinkDip } from '../../model/insect-motion';
import type { Flier } from '../../model/insects';
import { headedLight } from '../../model/light';
import {
  bloom,
  emerge,
  phaseOf,
  type Sprouted,
  sway,
} from '../../model/motion';
import { isBeeSown, type Sown } from '../../model/pollen';
import { onHost, standAt, UNPLACED, viewedOrLaid } from './bed-place';
import { drawFlower, type FlowerPainting, paintFlowerLit } from './draw-flower';
import { coversShown, inSightPast } from './flower-cover';
import { FlowerHold } from './flower-hold';
import { FLOWER_SWAY, laidFlower } from './flower-layout';
import { type StandingFlower, standingFlowers } from './flower-plots';
import { FlowerRing, type Ringed } from './flower-ring';
import {
  type Centred,
  flowerLift,
  flowerLiftAt,
  flowerTapReach,
} from './flower-sight';
import { FLOWER_TOUCH_ACTIONS, type FlowerTouch } from './flower-touch';
import { containsFlower, type TappedFigure } from './hit-areas';
import type { Lighting } from './ink';
import type { Instrument } from './instrument';
import type { FlowerInView } from './keyed-flowers';
import type { MeadowLayout } from './layout';
import { flowerLight } from './mushroom-light';
import type { Seat } from './perch-hosts';
import { browPale, repaintsDue } from './repaint-queue';
import { type Following, onScreen, type View } from './view';

/**
 * How much a flower sinking behind the brow fades for each share of haze it
 * pales by (`browPale`): a flower is painted with no haze, so it pales by
 * letting the hazy hills behind it through, at no repaint.
 */
const BROW_FADE = 1.5;

/** `plantedAt`: `-Infinity` for a seeded flower, standing from the start. */
/** How far ahead of the eye a thing is laid out at, where it is not where the layout stands it (`viewedOrLaid`). */
type LaidAhead = { opening?: number };

/**
 * Where the bed lays `stood` out to paint it on `layout`: where the layout
 * stands it for one of the visit's `seeded` flowers, any other at
 * `CLUMP_DISTANCE` in a frame of its own (`laidFlower`).
 */
function laidOut(
  layout: MeadowLayout,
  stood: StandingFlower,
  seeded: boolean,
): Pick<StandingFlower, 'foot' | 'place'> & LaidAhead {
  const { foot, place } = stood;
  return seeded
    ? { foot, place }
    : {
        foot,
        place: laidFlower(layout.camera, foot),
        opening: CLUMP_DISTANCE,
      };
}

type Shown = TappedFigure &
  Sprouted &
  Centred &
  Ringed & {
    stem: Phaser.GameObjects.Graphics;
    head: Phaser.GameObjects.Graphics;
    /** Where the head stands on its stem as laid out, before a drinking insect sags it. */
    headY: number;
    /**
     * Its foot on the plane, and where the bed lays it out to paint it, in
     * world px at the opening eye: a seeded flower where the layout stands
     * it, any other `opening` ahead in a frame of its own (`laidFlower`);
     * `undefined` while the screen has no room for it.
     */
    laid: (Pick<StandingFlower, 'foot' | 'place'> & LaidAhead) | undefined;
    /** How it was last painted; `undefined` before its first paint. */
    painting: FlowerPainting | undefined;
  };

/**
 * The meadow's flowers on screen, kept by id, the visit's seeded ones and the
 * ones the bees plant alike: each stands where the layout puts it
 * (`standingFlowers`), sways in the breeze, blooms open when tapped and sags
 * under an insect drinking at it; a planted one, a bee's or the child's,
 * grows up out of the ground and opens sounding its note or drum. A press
 * held on one opens the flower picker on it (`FlowerHold`), and the flower
 * the picker is open on stands in a ring (`FlowerRing`).
 */
export class FlowerBed implements Following {
  private readonly shown = new Map<string, Shown>();
  /** The view it last followed; `undefined` while it stands as laid out. */
  private view: View | undefined;
  private readonly scene: Phaser.Scene;
  private readonly instrument: Instrument;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  /** What a touch on a flower asks of the meadow (`FLOWER_TOUCH_ACTIONS`) goes here. */
  private readonly dispatch: (action: Action) => void;
  readonly seeded: readonly Flower[];
  private planted: readonly Sown[] = [];
  /** The flowers the child pulled up or replaced as of the last `reconcile`, which stand nowhere. */
  private pulled: Meadow['pulled'] = [];
  /** The mushrooms standing as of the last `reconcile`, whose feet a planted flower keeps off. */
  private mushrooms: Meadow['mushrooms'] = [];
  /** The layout it last painted on; `undefined` before its first paint. */
  private layout: MeadowLayout | undefined;
  /** The screen's light as it last stood, which each flower takes from where it stands (`flowerLight`). */
  private lighting: Lighting | undefined;
  private sizes: Readonly<Record<InsectKind, number>> = {
    butterfly: 1,
    fly: 1,
    bee: 1,
  };

  /** A press on a head held long enough to open the flower picker there. */
  private readonly hold: FlowerHold;
  private readonly ring: FlowerRing;
  /** The flower the picker is open on as of the last frame, which a tap on it leaves open. */
  private held: string | undefined;
  /** The flowers a key sowed, sounding them as it did, which open silent once planted. */
  private readonly hushed = new Set<string>();

  /** `heldStill` is how long the pressed finger has stood inside the slop (`EyeInput.heldStill`). */
  constructor(
    scene: Phaser.Scene,
    instrument: Instrument,
    now: () => number,
    seeded: readonly Flower[],
    dispatch: (action: Action) => void,
    heldStill: () => number | undefined,
  ) {
    this.scene = scene;
    this.instrument = instrument;
    this.now = now;
    this.seeded = seeded;
    this.dispatch = dispatch;
    this.hold = new FlowerHold({
      heldStill,
      footOf: (id) => this.shown.get(id)?.laid?.foot,
      dispatch,
    });
    this.ring = new FlowerRing(scene);
  }

  /** Stands every flower where `layout` puts it, into the objects it has. */
  paint(layout: MeadowLayout, lighting: Lighting): void {
    this.layout = layout;
    this.lighting = lighting;
    this.sizes = layout.insectSizes;
    const standing = standingFlowers(
      layout,
      this.seeded,
      this.planted,
      this.mushrooms,
      this.pulled,
    );
    const seededIds = new Set(this.seeded.map(({ id }) => id));
    for (const flower of [...this.seeded, ...this.planted]) {
      const shown = this.shown.get(flower.id) ?? this.show(flower, -Infinity);
      const stood = standing.find(({ id }) => id === flower.id);
      // A screen may have no room for some; they wait, hidden.
      shown.laid = stood && laidOut(layout, stood, seededIds.has(flower.id));
      this.stand(shown);
      if (!stood || !shown.laid) continue;
      const { place } = shown.laid;
      const genes = flowerGenes(flower);
      // Lit from where the layout stands it, as the opening eye sees it,
      // then turned by the heading.
      const openingLight = flowerLight(
        lighting,
        genes,
        stood.place,
        layout.sun,
      );
      shown.painting = {
        openingLight,
        drawIn: (lit) => {
          shown.headR = drawFlower(shown, genes, place.size, lit);
        },
        paintedSunSide: openingLight.toward.x,
      };
      paintFlowerLit(shown.painting, this.heading);
      shown.headY = shown.head.y;
      shown.disc = genes.centre * place.size;
      shown.hit.setTo(0, 0, flowerTapReach(shown.headR));
      // Stood again at its drawn height, which the view's cull reads.
      this.stand(shown);
    }
  }

  /**
   * Shows what `planted` holds as of `clock`, in seconds, among `mushrooms`:
   * each new flower grows up where `layout` stands it,
   * blooming open with its sound, each planted flower stands or hides as
   * the mushrooms' feet leave it ground, and each of `pulled` hides
   * (`standingFlowers`).
   */
  reconcile(
    {
      planted,
      mushrooms,
      pulled,
    }: Pick<Meadow, 'planted' | 'mushrooms' | 'pulled'>,
    layout: MeadowLayout,
    clock: number,
  ): void {
    if (
      planted === this.planted &&
      mushrooms === this.mushrooms &&
      pulled === this.pulled
    ) {
      return;
    }
    const fresh = planted.filter(({ id }) => !this.shown.has(id));
    this.planted = planted;
    this.mushrooms = mushrooms;
    this.pulled = pulled;
    for (const flower of fresh) {
      const shown = this.show(flower, clock);
      shown.tappedAt = clock;
      // The child's own flower leads the melody, as a tap does; a bee's
      // plays from it without moving it.
      if (!this.hushed.delete(flower.id))
        this.sound(flower, !isBeeSown(flower));
    }
    if (!this.lighting) throw new Error('A flower is planted before its paint');
    this.paint(layout, this.lighting);
  }

  /**
   * Stands every flower where `view` sees its foot, and repaints the nearest
   * few whose sun side from its heading has drifted from their paint
   * (`repaintsDue`); a flower is painted with no haze, so its haze never does.
   */
  follow(view: View): void {
    this.view = view;
    const hazing = [...this.shown.values()].flatMap((shown) => {
      this.stand(shown);
      const { laid, painting, stands } = shown;
      return laid && painting && stands.drawn
        ? [
            {
              painting,
              haze: 0,
              painted: 0,
              ...pick(stands, 'ahead'),
              sunSide: headedLight(painting.openingLight, view.eye.heading)
                .toward.x,
              ...pick(painting, 'paintedSunSide'),
            },
          ]
        : [];
    });
    for (const { painting } of repaintsDue(hazing))
      paintFlowerLit(painting, this.heading);
  }

  /** The heading the view looks along, which the flowers are lit from; the opening's while they stand as laid out. */
  private get heading(): number {
    return this.view?.eye.heading ?? OPENING_EYE.heading;
  }

  /**
   * Stands `shown` where the view, or else the layout, puts its foot, fading
   * as it sinks behind the brow.
   */
  private stand(shown: Shown): void {
    const { laid, container, headR, headY } = shown;
    const place = laid
      ? viewedOrLaid(
          this.view,
          laid.foot,
          laid.place,
          headR - headY,
          laid.opening,
        )
      : UNPLACED;
    shown.stands = place;
    standAt(container, place);
    const pale = this.view && place.behind ? browPale(place.distance) : 0;
    container.setAlpha(1 - BROW_FADE * pale);
  }

  /**
   * Sways and blooms every flower at `t`, in seconds, each sagging under
   * whatever of `insects` drinks at it, and rings the one `held` names, the
   * flower picker's, where it stands; a press on a head held long enough
   * opens the picker there.
   */
  update(t: number, insects: readonly Flier[], held: string | undefined): void {
    this.held = held;
    this.hold.update();
    const ringed = held === undefined ? undefined : this.shown.get(held);
    this.ring.stand(ringed?.laid && ringed);
    const drunk = drinkingAt(insects, t * 1000);
    for (const [id, shown] of this.shown) {
      const open = bloom(t - shown.tappedAt);
      const { dip, flicker } = drunk.get(id) ?? { dip: 0, flicker: 0 };
      shown.container
        .setRotation(sway(t, shown.phase) * FLOWER_SWAY)
        .setScale(emerge(t - shown.plantedAt) * shown.stands.zoom);
      shown.head
        .setScale(1 + open)
        .setRotation(open * 0.6 + flicker)
        .setY(shown.headY + dip * shown.headR);
    }
  }

  /**
   * Where an insect sits on the flower `id` this frame, `spot` of its head's
   * radius across (`perchSpot`), and the head's middle it drinks from, both in
   * world px at the opening eye, where the insects fly; with the seat as the
   * flower draws it, the spot at the flower's zoom lifted at the insect's own
   * (`flowerLiftAt`); `undefined` while the screen has no room for the flower.
   */
  seat(id: string, spot: number, kind: InsectKind): Seat | undefined {
    const shown = this.shown.get(id);
    if (!shown?.laid) return undefined;
    const { container, head, headR, disc, laid, stands } = shown;
    const turn = container.rotation;
    const reach = { r: headR, disc };
    const lift = flowerLift(reach, this.sizes[kind], kind);
    const across = { ...pick(head, 'y'), x: head.x + spot * headR };
    const seat = placedAt(laid.place, turn, { ...across, y: head.y - lift });
    const nectar = placedAt(laid.place, turn, head);
    const on = { laidFoot: laid.place, stands };
    const drawnLift = flowerLiftAt(reach, this.sizes[kind], kind, {
      host: stands.zoom,
      insect: CLUMP_DISTANCE / stands.ahead,
    });
    const drawn = placedAt(
      onHost(on, placedAt(laid.place, turn, across)),
      turn,
      {
        x: 0,
        y: -drawnLift,
      },
    );
    return { ...seat, nectar, on, drawn };
  }

  /**
   * Answers a press on the flower `id`, whether it landed there or went
   * through an insect resting on it: a tap, and held long enough, the
   * picker's opening there (`FlowerHold`).
   */
  tap(id: string): void {
    this.touch(id, 'tap');
    this.hold.press(id);
  }

  /**
   * Answers a finger beyond Phaser's, which plays a chord: `object`, the
   * topmost thing under it, is opened and sounded when it is a flower's head,
   * and whether it was is returned. Nothing else takes such a finger.
   */
  chordTap(object: Phaser.GameObjects.GameObject): boolean {
    for (const [id, shown] of this.shown) {
      if (shown.head !== object) continue;
      this.touch(id, 'chord');
      return true;
    }
    return false;
  }

  private touch(id: string, touch: FlowerTouch): void {
    const shown = this.shown.get(id);
    const flower = [...this.seeded, ...this.planted].find(
      (each) => each.id === id,
    );
    if (!shown || !flower) return;
    this.open(shown);
    this.sound(flower, true);
    // The picker open on this very flower stays open under its own tap.
    if (id === this.held) return;
    for (const action of FLOWER_TOUCH_ACTIONS[touch]) this.dispatch(action);
  }

  /**
   * The flowers the view last followed shows, and the sound each makes: drawn,
   * not hidden near the eye, with the head's middle on the screen and no
   * nearer mushroom drawn over it (`inSightPast`).
   */
  inView(): FlowerInView[] {
    const { view, layout, mushrooms, seeded, planted, shown: shownById } = this;
    if (!view || !layout) return [];
    const covers = coversShown(view, layout, mushrooms);
    return [...seeded, ...planted].flatMap((flower) => {
      const shown = shownById.get(flower.id);
      if (!shown?.laid) return [];
      const { stands, head, headR, headY } = shown;
      const { x, y, zoom, drawn, distance } = stands;
      const middle = { x: x + head.x * zoom, y: y + headY * zoom };
      return drawn &&
        onScreen(view, middle, -headR * zoom) &&
        inSightPast(covers, middle, distance)
        ? [{ ...pick(flower, 'id'), sound: soundOf(flowerGenes(flower)) }]
        : [];
    });
  }

  /** Opens the flower `id` silent once it is planted: the key that sows it sounds it. */
  hush(id: string): void {
    this.hushed.add(id);
  }

  /** Opens each of `flowers`, as a played key's sound answers through it. */
  answer(flowers: readonly FlowerInView[]): void {
    for (const { id } of flowers) {
      const shown = this.shown.get(id);
      if (shown) this.open(shown);
    }
  }

  /** Blooms `shown` open from the top, mid-bloom or not, as its sound starts again. */
  private open(shown: Shown): void {
    shown.tappedAt = this.now();
  }

  private sound(flower: Flower, leads: boolean): void {
    this.instrument.flower(soundOf(flowerGenes(flower)), leads);
  }

  private show(flower: Flower, plantedAt: number): Shown {
    const hit = new Phaser.Geom.Circle();
    const stem = this.scene.add.graphics();
    const head = this.scene.add.graphics();
    const shown: Shown = {
      container: this.scene.add.container(0, 0, [stem, head]),
      stem,
      head,
      hit,
      headR: 0,
      headY: 0,
      laid: undefined,
      painting: undefined,
      stands: UNPLACED,
      disc: 0,
      plantedAt,
      phase: phaseOf(flower),
      tappedAt: -Infinity,
    };
    head.setInteractive(
      hit,
      containsFlower(() => shown.headR),
    );
    head.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.tap(flower.id);
    });
    this.shown.set(flower.id, shown);
    return shown;
  }
}

/** What the insects do at `time`, in ms, to the flowers under them, by flower id (`drinkDip`). */
function drinkingAt(insects: readonly Flier[], time: number): Map<string, Dip> {
  const drunk = new Map<string, Dip>();
  for (const { leg } of insects) {
    const under = drinkDip(leg, time);
    if (!under) continue;
    const was = drunk.get(under.id) ?? { dip: 0, flicker: 0 };
    drunk.set(under.id, {
      dip: was.dip + under.dip,
      flicker: was.flicker + under.flicker,
    });
  }
  return drunk;
}
