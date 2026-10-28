import * as Phaser from 'phaser';

import { pick } from '@/kernel/shared/lib/collections';

import { placedAt } from '@/mushrooms/shared/lib/geometry';
import { headedLight } from '@/mushrooms/shared/lib/light';
import { bloom, emerge, sway } from '@/mushrooms/shared/lib/motion';
import type { Lighting } from '@/mushrooms/shared/ui';
import {
  browPale,
  CLUMP_DISTANCE,
  type Following,
  gathered,
  inSightPast,
  onHost,
  onScreen,
  OPENING_EYE,
  repaintsDue,
  standAt,
  UNPLACED,
  type View,
  viewedOrLaid,
} from '@/mushrooms/shared/world';
import {
  type Flower,
  FLOWER_SWAY,
  flowerGenes,
  flowerLight,
  FlowerRing,
  flowersOf,
  isBeeSown,
  paintFlowerLit,
  soundOf,
  type Sown,
  type StandingFlower,
  standOf,
  type WithPlanted,
} from '@/mushrooms/entities/flower';
import {
  type Dip,
  drinkDip,
  type Flier,
  flowerLift,
  flowerLiftAt,
  type InsectKind,
  type Seat,
} from '@/mushrooms/entities/insect';
import {
  coversShown,
  drawnUnder,
  flowerTakes,
  occupantsOn,
  shownMushrooms,
} from '@/mushrooms/entities/mushroom';
import {
  closingsDue,
  closingStep,
  meanClosing,
} from '@/mushrooms/features/flowers-close';
import { tuftUnder } from '@/mushrooms/features/plant-flower';
import {
  type Answering,
  type ChordTapped,
  FLOWER_TOUCH_ACTIONS,
  FlowerHold,
  type FlowerInView,
  type FlowerTouch,
  type Instrument,
} from '@/mushrooms/features/play-flowers';

import type { Action, Meadow, Tended } from '../model/game';
import {
  closeShown,
  laidOut,
  paintShown,
  type Shown,
  unplacedShown,
} from './flower-shown';
import type { MeadowLayout } from './layout';

/**
 * How much a flower sinking behind the brow fades for each share of haze it
 * pales by (`browPale`): a flower is painted with no haze, so it pales by
 * letting the hazy hills behind it through, at no repaint.
 */
const BROW_FADE = 1.5;

/**
 * A flower head's hit test, bound with its petals' reach `petals()` in the
 * head's own frame: its tap circle `area` (`flowerTakes`), yielding past the
 * petals to any mushroom drawn under the finger, and to a bare tuft whose
 * reach holds it (`tuftUnder`).
 */
function containsFlower(petals: () => number) {
  return (
    area: Phaser.Geom.Circle,
    x: number,
    y: number,
    flower: Phaser.GameObjects.GameObject,
  ): boolean =>
    flowerTakes(
      Math.hypot(x - area.x, y - area.y),
      { petals: petals(), tap: area.radius },
      () => {
        if (!(flower instanceof Phaser.GameObjects.Graphics)) return false;
        const finger = flower
          .getWorldTransformMatrix()
          .transformPoint(x, y, { x: 0, y: 0 });
        return (
          drawnUnder(finger, shownMushrooms(flower.scene)) ||
          tuftUnder(flower.scene, finger)
        );
      },
    );
}

/**
 * The meadow's flowers on screen, kept by id, the visit's seeded ones and the
 * ones the bees plant alike: each stands where the layout puts it
 * (`flowersOf`), sways in the breeze, blooms open when tapped and sags
 * under an insect drinking at it; a planted one, a bee's or the child's,
 * grows up out of the ground and opens sounding its note or drum. A press
 * held on one opens the flower picker on it (`FlowerHold`), and the flower
 * the picker is open on stands in a ring (`FlowerRing`).
 */
export class FlowerBed implements Following, ChordTapped, Answering {
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

  /** Every flower of the bed as `layout` stands it among the mushrooms (`flowersOf`). */
  private standingOn(layout: MeadowLayout): StandingFlower[] {
    const { seeded, planted, mushrooms, pulled } = this;
    const meadow = { planted, mushrooms, pulled };
    return flowersOf(standOf(layout, seeded, meadow, occupantsOn));
  }

  /** Stands every flower where `layout` puts it, into the objects it has. */
  paint(layout: MeadowLayout, lighting: Lighting): void {
    this.layout = layout;
    this.lighting = lighting;
    this.sizes = layout.insectSizes;
    const standing = this.standingOn(layout);
    const seededIds = new Set(this.seeded.map(({ id }) => id));
    for (const flower of [...this.seeded, ...this.planted]) {
      const shown = this.shown.get(flower.id) ?? this.show(flower, -Infinity);
      const stood = standing.find(({ id }) => id === flower.id);
      // A screen may have no room for some; they wait, hidden.
      shown.laid = stood && laidOut(layout, stood, seededIds.has(flower.id));
      this.stand(shown);
      if (!stood || !shown.laid) continue;
      const genes = flowerGenes(flower);
      // Lit from where the layout stands it, as the opening eye sees it,
      // then turned by the heading.
      const openingLight = flowerLight(
        lighting,
        genes,
        stood.place,
        layout.sun,
      );
      paintShown(
        shown,
        genes,
        shown.laid.place.size,
        openingLight,
        this.heading,
      );
      // Stood again at its drawn height, which the view's cull reads.
      this.stand(shown);
    }
  }

  /**
   * Shows what `planted` holds as of `clock`, in seconds, among `mushrooms`:
   * each new flower grows up where `layout` stands it, blooming open with its
   * sound (grown and silent on the `opening`, as it was left), each planted
   * flower stands or hides as the mushrooms' feet leave it ground, and each
   * of `pulled` hides (`flowersOf`).
   */
  reconcile(
    { planted, mushrooms, pulled }: WithPlanted & Tended,
    layout: MeadowLayout,
    clock: number,
    opening = false,
  ): void {
    const same = planted === this.planted && mushrooms === this.mushrooms;
    if (same && pulled === this.pulled) return;
    const fresh = planted.filter(({ id }) => !this.shown.has(id));
    this.planted = planted;
    this.mushrooms = mushrooms;
    this.pulled = pulled;
    for (const flower of fresh) {
      const at = opening ? -Infinity : clock;
      this.show(flower, at).tappedAt = at;
      // The child's own flower leads the melody, as a tap does; a bee's
      // plays from it without moving it.
      if (!opening && !this.hushed.delete(flower.id))
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
    const pale =
      this.view && place.behind ? browPale(this.view, place.distance) : 0;
    container.setAlpha(1 - BROW_FADE * pale);
  }

  /**
   * Sways and blooms every flower at `t`, in seconds, each sagging under
   * whatever of `insects` drinks at it and shut to `closing`, 0 to 1
   * (`bedClosing`, `closingsDue`), and rings the one `held` names, the
   * flower picker's, where it stands; a press on a head held long enough
   * opens the picker there.
   */
  update(
    t: number,
    closing: number,
    insects: readonly Flier[],
    held: string | undefined,
  ): void {
    this.held = held;
    this.hold.update();
    const step = closingStep(closing);
    for (const shown of closingsDue(this.shown.values(), step))
      closeShown(shown, step);
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
   * radius across as last painted, folded or open (`perch`, `perchSpot`), and
   * the head's middle it drinks from, both in world px at the opening eye,
   * where the insects fly; with the seat as the flower draws it, the spot at the flower's zoom lifted at the insect's own
   * (`flowerLiftAt`); `undefined` while the screen has no room for the flower.
   */
  seat(id: string, spot: number, kind: InsectKind): Seat | undefined {
    const shown = this.shown.get(id);
    if (!shown?.laid) return undefined;
    const { container, head, perch, laid, stands } = shown;
    const turn = container.rotation;
    const lift = flowerLift(perch, this.sizes[kind], kind);
    const across = { ...pick(head, 'y'), x: head.x + spot * perch.r };
    const seat = placedAt(laid.place, turn, { ...across, y: head.y - lift });
    const nectar = placedAt(laid.place, turn, head);
    const on = {
      ...pick(laid, 'foot'),
      laidFoot: laid.place,
      opening: laid.opening ?? gathered(laid.foot).y,
      stands,
    };
    const drawnLift = flowerLiftAt(perch, this.sizes[kind], kind, {
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

  /**
   * How far shut the flowers with room on screen are painted, on average
   * (`meanClosing`), as their paint reports it (`Shown.painted`).
   */
  closing(): number {
    return meanClosing(
      [...this.shown.values()].flatMap(({ laid, painted }) =>
        laid ? [painted] : [],
      ),
    );
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
    const shown = unplacedShown(flower, plantedAt, {
      container: this.scene.add.container(0, 0, [stem, head]),
      stem,
      head,
      hit,
    });
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
