import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isAloft, isLeaving, type Perch, type Sight } from '../../model/flight';
import { firstFlowers } from '../../model/flower-sounds';
import {
  type Action,
  firstMeadow,
  type Meadow,
  reduce,
} from '../../model/game';
import type { Point } from '../../model/geometry';
import type { Ground } from '../../model/ground';
import type { Flier } from '../../model/insects';
import { sunLight } from '../../model/light';
import { mulberry32, nextSeed, type Random } from '../../model/random';
import type { Opener } from './clump-shade';
import { Controls } from './controls';
import { FlowerBed } from './flower-bed';
import type { Stand } from './flower-sight';
import { InsectView, type Perched } from './insect-view';
import { Instrument } from './instrument';
import { playTheFlowers } from './instrument-input';
import { type MeadowLayout, meadowLayout } from './layout';
import { MushroomBed } from './mushroom-bed';
import { keptRoom } from './mushroom-room';
import { type Backdrop, driftClouds, paintBackdrop } from './paint-backdrop';
import { airSpots, perchSight, perchSpot } from './perch-sight';
import { Planter } from './planter';
import { MeadowSound, readMuted } from './sound';
import { Grass } from './tufts';

/** The registry key the host writes the device pixel ratio under. */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/** Above everything in the meadow, spores included. */
const HUD_DEPTH = 2e5;
/**
 * Above everything in the meadow too, taking a tap first and passing one at
 * rest on to its perch (`tapInsect`), but under the buttons, which keep their
 * taps.
 */
const INSECT_DEPTH = 1.5e5;

/**
 * The meadow. Everything that varies between visits comes from one seed, so a
 * resize repaints the same meadow rather than a new one — into the objects
 * already on screen. Every movement is set each frame from the clock
 * (`model/motion.ts`), so a resize changes where a thing stands and never
 * interrupts how it moves.
 */
export class MeadowScene extends Phaser.Scene {
  private readonly visitSeed = Math.floor(Math.random() * 2 ** 32);
  /** What the player has made of the meadow; changed only by `dispatch`, which the screen follows. */
  private meadow: Meadow | undefined;
  /** The seeds each grown mushroom takes, a stream of its own. */
  private readonly growing: Random = mulberry32(this.visitSeed ^ 0x9e_0a);
  /** The seed the next mushroom grows from, drawn before the tap so where it grows is known. */
  private upcoming = nextSeed(this.growing);
  /** Where the next mushroom grows (`roomFor`), found again once the stand changes. */
  private readonly room = keptRoom();
  /** The seeds each released insect takes. */
  private readonly releasing: Random = mulberry32(this.visitSeed ^ 0xb7_7e_f1);
  private flowers: FlowerBed | undefined;
  private layout: MeadowLayout | undefined;
  /** The mushrooms the visit opened with, which place the flowers. */
  private openers: readonly Opener[] | undefined;
  private backdrop: Backdrop | undefined;
  private grass: Grass | undefined;
  private bed: MushroomBed | undefined;
  private controls: Controls | undefined;
  private insects: InsectView | undefined;
  /** What the insects see of the perches, as the screen and the mushrooms stand now. */
  private sight: Sight = {
    flowers: [],
    air: [],
    crowded: [],
    room: [],
    seededFlowers: 0,
  };
  /** Where each spot in the open air stands, by id, as the screen stands now. */
  private air = new Map<string, Point>();
  /**
   * Whether flowers were planted, or mushrooms grown or thinned, since the
   * flower bed last caught up: the bed draws them and the insects see them on
   * the next frame, so a planting never adds a repaint of every flower and a
   * fresh sight to the frame whose tick planted it.
   */
  private sown = false;
  private readonly voice = new MeadowSound(readMuted());
  /** Seconds on the scene's clock, as of the last frame. */
  private clock = 0;
  private readonly now = (): number => this.clock;
  private readonly instrument = new Instrument(this.voice, this.now);
  private readonly planter = new Planter(
    this.voice,
    this.now,
    {
      stand: () => this.stand(),
      meadow: () => this.meadow,
      dispatch: (action) => {
        this.dispatch(action);
      },
    },
    this.visitSeed ^ 0x7f_10_e5,
  );

  constructor() {
    super('meadow');
  }

  create(): void {
    const random = mulberry32(this.visitSeed);
    this.meadow = firstMeadow(random);
    this.flowers = new FlowerBed(
      this,
      this.instrument,
      this.now,
      firstFlowers(random, 7),
      (action) => {
        this.dispatch(action);
      },
    );
    this.bed = new MushroomBed(this, this.voice, this.now, (id) => {
      this.dispatch({ kind: 'select', id });
    });
    this.insects = new InsectView(
      this,
      this.voice,
      this.now,
      INSECT_DEPTH,
      (id) => {
        this.tapInsect(id);
      },
    );
    this.controls = new Controls(
      this,
      {
        mute: () => {
          this.voice.toggleMuted();
          this.voice.pop();
          this.dispatch({ kind: 'shut' });
          this.repaintControls();
        },
        pick: () => {
          this.voice.pop();
          this.dispatch({ kind: 'pick' });
        },
        remove: () => {
          this.dispatch({ kind: 'remove' });
        },
        grow: (species) => {
          const foot = this.roomNow();
          if (!foot) return;
          this.dispatch({ kind: 'grow', species, seed: this.upcoming, foot });
          this.upcoming = nextSeed(this.growing);
        },
        house: () => {
          this.voice.pop();
          this.dispatch({ kind: 'house' });
        },
        furnish: (piece) => {
          this.dispatch({ kind: 'furnish', piece });
        },
        release: (insect) => {
          this.voice.takeOff(insect);
          this.dispatch({
            kind: 'release',
            insect,
            seed: nextSeed(this.releasing),
            now: this.clock * 1000,
            ...this.sight,
          });
        },
        ...pick(this.planter, 'colour', 'plant', 'plantable'),
        roomy: () => this.roomNow() !== undefined,
        refuse: () => {
          this.voice.nuhUh();
        },
      },
      this.now,
      HUD_DEPTH,
    );
    this.paint();
    this.bed.reconcile(this.meadow, this.requireLayout(), this.clock, true);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.paint, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.tapMeadow, this);
    // A browser lets sound start only on a tap's release.
    this.input.on(Phaser.Input.Events.POINTER_UP, this.startSound, this);
    const stopPlaying = playTheFlowers(this, this.instrument, this.flowers);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      stopPlaying();
      this.scale.off(Phaser.Scale.Events.RESIZE, this.paint, this);
      this.input.off(Phaser.Input.Events.POINTER_DOWN, this.tapMeadow, this);
      this.input.off(Phaser.Input.Events.POINTER_UP, this.startSound, this);
      this.voice.stop();
    });
  }

  override update(time: number): void {
    this.clock = time / 1000;
    if (this.sown) this.sow();
    const t = this.clock;
    const {
      layout,
      backdrop,
      grass,
      flowers,
      bed,
      controls,
      insects,
      perchAt,
      sight,
      meadow,
    } = this;
    if (!layout || !backdrop) return;
    this.dispatch({ kind: 'tick', now: time, ...sight });
    driftClouds(backdrop, layout, t);
    grass?.update(t, meadow?.planting?.foot);
    bed?.update(t);
    controls?.update(t);
    // As the tick just left them.
    flowers?.update(t, this.fliers());
    // Last, so every perch stands where this frame has put it, a sagging
    // head's included.
    insects?.update(t, perchAt);
  }

  /** Draws the flowers as the plantings and the mushrooms now stand, and sees the perches with them. */
  private sow(): void {
    this.sown = false;
    if (!this.meadow) return;
    this.flowers?.reconcile(this.meadow, this.requireLayout(), this.clock);
    this.see();
    this.tendGrass();
  }

  /** Tends the tufts to the meadow as it now stands (`Grass.tend`). */
  private tendGrass(): void {
    const stand = this.stand();
    if (!stand) return;
    this.grass?.tend(stand);
    this.shutStrayPicker();
  }

  /** Shuts the flower picker once the tuft it is open on no longer takes a flower. */
  private shutStrayPicker(): void {
    const open = this.meadow?.planting?.foot;
    if (open && this.grass && !this.grass.holds(open)) {
      this.dispatch({ kind: 'shut' });
    }
  }

  /** The meadow as it stands on the screen last painted, once there is one. */
  private stand(): Stand | undefined {
    const { layout, flowers, meadow } = this;
    if (!layout || !meadow) return undefined;
    return {
      layout,
      flowers: flowers?.seeded ?? [],
      ...pick(meadow, 'mushrooms', 'planted'),
    };
  }

  /** Where the next mushroom grows as the meadow stands now: `undefined` where there is no room. */
  private roomNow(): Ground | undefined {
    const stand = this.stand();
    return stand && this.room(stand, this.upcoming);
  }

  private fliers(): readonly Flier[] {
    return this.meadow?.insects ?? [];
  }

  private dispatch(action: Action): void {
    if (!this.meadow) return;
    const meadow = reduce(this.meadow, action);
    // A frame's tick with nothing due changes nothing, and costs nothing.
    if (meadow === this.meadow) return;
    const regrown = meadow.mushrooms !== this.meadow.mushrooms;
    this.sown ||= regrown || meadow.planted !== this.meadow.planted;
    this.meadow = meadow;
    if (regrown) this.see();
    this.bed?.reconcile(meadow, this.requireLayout(), this.clock);
    this.insects?.reconcile(meadow.insects);
    this.repaintControls();
  }

  /**
   * Where `perch` stands this frame: over a flower's head, as it sways and
   * sags, with the head's middle it drinks from, or a cap's top, as it
   * breathes, wobbles and sinks, each butterfly at a spot of its own along
   * it; or a spot in the open air.
   */
  private readonly perchAt = (
    perch: Perch,
    insect: Flier,
  ): Perched | undefined => {
    const spot = perchSpot(insect);
    switch (perch.kind) {
      case 'cap': {
        return this.bed?.capTop(perch.id, spot);
      }
      case 'flower': {
        return this.flowers?.seat(perch.id, spot, insect.kind);
      }
      case 'air': {
        return this.air.get(perch.id);
      }
      case 'away': {
        return undefined;
      }
      default: {
        return perch satisfies never;
      }
    }
  };

  /**
   * A tap on the insect `id` startles it; at rest, the tap goes on to
   * whatever it sits on, so a creature never costs the child the thing under
   * it. In flight it takes the tap alone.
   */
  private tapInsect(id: string): void {
    const now = this.clock * 1000;
    const flier = this.meadow?.insects.find((each) => each.id === id);
    const under =
      flier && !isAloft(flier, now) && !isLeaving(flier)
        ? flier.leg.to
        : undefined;
    this.dispatch({ kind: 'startle', id, now, ...this.sight });
    switch (under?.kind) {
      case 'cap': {
        this.bed?.tap(under.id);
        break;
      }
      case 'flower': {
        this.flowers?.tap(under.id);
        break;
      }
      case 'air':
      case 'away':
      case undefined: {
        break;
      }
      default: {
        under satisfies never;
      }
    }
  }

  /**
   * A tap that lands on nothing else lands on a tuft or the bare meadow,
   * either of which lets go of the selection.
   */
  private readonly tapMeadow = (
    pointer: Phaser.Input.Pointer,
    over: readonly Phaser.GameObjects.GameObject[],
  ): void => {
    if (over.length > 0) return;
    const { grass, cameras, planter } = this;
    const at = cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tuft = grass?.at(at);
    if (grass && tuft) planter.tapTuft(tuft, grass);
    else this.dispatch({ kind: 'deselect' });
  };

  private readonly startSound = (): void => {
    this.voice.start();
  };

  private requireLayout(): MeadowLayout {
    if (!this.layout) throw new Error('The meadow is used before its paint');
    return this.layout;
  }

  private repaintControls(): void {
    if (this.layout && this.meadow) {
      this.controls?.paint(
        this.layout,
        this.meadow,
        this.voice.muted,
        this.pixelRatio(),
      );
    }
  }

  private pixelRatio(): number {
    return Number(this.registry.get(PIXEL_RATIO_KEY) ?? 1);
  }

  /**
   * The canvas is sized in device pixels for a sharp picture on a dense
   * screen; the camera's zoom brings the world back to CSS pixels, which is
   * what the layout is written in.
   */
  private readonly paint = (): void => {
    const ratio = this.pixelRatio();
    this.cameras.main.setOrigin(0, 0).setZoom(ratio);
    const screen = {
      width: this.scale.width / ratio,
      height: this.scale.height / ratio,
    };
    // The flowers are placed on the world against the mushrooms the visit
    // opens with, and stay put.
    this.openers ??= this.meadow?.mushrooms ?? [];
    const layout = meadowLayout(
      screen.width,
      screen.height,
      // Its own stream, apart from the creatures' and the backdrop's.
      this.visitSeed ^ 0xf1_0e_25,
      this.openers,
    );
    this.layout = layout;
    // Its own stream, so the backdrop never shifts the creatures' seeds.
    const random = mulberry32(this.visitSeed ^ 0x5e_ed);
    this.backdrop = paintBackdrop(this, this.backdrop, layout, random, ratio);
    // Its own stream, so a planting never shifts the backdrop's.
    this.grass ??= new Grass(this, mulberry32(this.visitSeed ^ 0x70_f7_5e));
    const stand = this.stand();
    if (stand) this.grass.paint(stand, random);
    this.shutStrayPicker();
    // One device pixel is the thinnest line the screen shows.
    const lighting = { ...sunLight(layout), hairline: 1 / ratio };
    if (this.meadow) this.bed?.paint(this.meadow, layout, lighting);
    this.insects?.paint(layout, lighting);
    this.flowers?.paint(layout, lighting);
    this.see();
    this.repaintControls();
  };

  /** Sees the perches afresh, as the screen and the mushrooms now stand. */
  private see(): void {
    const stand = this.stand();
    if (!stand) return;
    this.sight = perchSight(stand);
    this.air = new Map(
      airSpots(stand.layout).map(({ id, x, y }) => [id, { x, y }]),
    );
  }
}
