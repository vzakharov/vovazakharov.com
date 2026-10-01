import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { firstFlowers } from '../../model/flower-sounds';
import {
  type Action,
  firstMeadow,
  type Meadow,
  reduce,
} from '../../model/game';
import { OPENING_EYE } from '../../model/ground';
import type { Flier } from '../../model/insects';
import { sunLight } from '../../model/light';
import { mulberry32 } from '../../model/random';
import { Arrivals } from './arrivals';
import type { Opener } from './clump-shade';
import { Controls } from './controls';
import { EyeInput } from './eye-input';
import { FlowerBed } from './flower-bed';
import type { Stand } from './flower-sight';
import { InsectView } from './insect-view';
import { Instrument } from './instrument';
import { playTheMeadow } from './instrument-input';
import { type MeadowLayout, meadowLayout } from './layout';
import { MushroomBed } from './mushroom-bed';
import { type Backdrop, driftClouds, paintBackdrop } from './paint-backdrop';
import { type PerchHosts, restingOn } from './perch-hosts';
import { Perches } from './perches';
import { Planter, type Scened } from './planter';
import { MeadowSound, readMuted } from './sound';
import { Grass } from './tufts';
import { type View, viewAt } from './view';
import { Gait } from './walking';

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
  private flowers: FlowerBed | undefined;
  private layout: MeadowLayout | undefined;
  /** The mushrooms the visit opened with, which place the flowers. */
  private openers: readonly Opener[] | undefined;
  private backdrop: Backdrop | undefined;
  private grass: Grass | undefined;
  private bed: MushroomBed | undefined;
  private controls: Controls | undefined;
  private insects: InsectView | undefined;
  private readonly perches: Perches;
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
  /** Where the frames are seen from, and what turns and walks it. */
  private readonly eye = new EyeInput(this.now);
  /** The walk as the frames go by: the feet landing and the bob. */
  private readonly gait = new Gait();
  private readonly instrument = new Instrument(this.voice, this.now);
  /** The stand and the reducer, as the planter and the arrivals act through them. */
  private readonly scened: Scened = {
    stand: () => this.stand(),
    meadow: () => this.meadow,
    dispatch: (action) => {
      this.dispatch(action);
    },
  };
  private readonly planter = new Planter(
    this.voice,
    this.now,
    this.scened,
    this.visitSeed ^ 0x7f_10_e5,
  );
  private readonly arrivals = new Arrivals(
    this.voice,
    this.now,
    {
      ...this.scened,
      layout: () => this.requireLayout(),
      view: () => this.eye.view(),
      sight: () => this.perches.sightFrom(this.viewNow()),
    },
    this.visitSeed,
  );

  constructor() {
    super('meadow');
    this.perches = new Perches(() => this.beds());
  }

  create(): void {
    const random = mulberry32(this.visitSeed);
    this.meadow = firstMeadow(random);
    this.flowers = new FlowerBed(
      this,
      this.instrument,
      this.now,
      firstFlowers(random, 14),
      (action) => {
        this.dispatch(action);
      },
      () => this.eye.heldStill(),
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
      () => this.viewNow(),
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
        house: () => {
          this.voice.pop();
          this.dispatch({ kind: 'house' });
        },
        furnish: (piece) => {
          this.dispatch({ kind: 'furnish', piece });
        },
        ...pick(this.arrivals, 'grow', 'roomy', 'release'),
        ...pick(this.planter, 'colour', 'plant', 'plantable'),
        pull: () => {
          this.voice.pop();
          this.dispatch({ kind: 'pull' });
        },
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
    const stopPlaying = playTheMeadow(
      this,
      this.instrument,
      this.flowers,
      this.eye,
      this.planter.plantSounding,
    );
    const stopPanning = this.eye.listen(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      stopPlaying();
      stopPanning();
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
      perches,
      meadow,
    } = this;
    if (!layout || !backdrop) return;
    this.walk(layout.height);
    this.dispatch({
      kind: 'tick',
      now: time,
      ...perches.sightFrom(this.viewNow()),
    });
    driftClouds(backdrop, layout, t);
    const planting = meadow?.planting;
    // The grass marks the tuft the picker is open on; the bed rings a flower.
    grass?.update(
      t,
      planting?.flower === undefined ? planting?.foot : undefined,
    );
    bed?.update(t);
    controls?.update(t);
    // As the tick just left them.
    flowers?.update(t, this.fliers(), planting?.flower);
    // Last, so every perch stands where this frame has put it, a sagging
    // head's included.
    insects?.update(t, perches.at);
  }

  /**
   * Sees the frame from where the eye stands now: everything on the ground
   * and the sky's turning parts through its view, the camera bobbing with
   * the walk (`Gait`) and a footstep for each foot that lands. The camera
   * never scrolls across: the view places everything.
   */
  private walk(height: number): void {
    const { eye, backdrop, grass, bed, flowers, voice, gait, clock, cameras } =
      this;
    const view = eye.view();
    if (!view) return;
    backdrop?.follow(view);
    grass?.follow(view);
    bed?.follow(view);
    flowers?.follow(view);
    const { feet, bob } = gait.step(eye.walked(), clock, height);
    for (const foot of feet) voice.step(foot);
    cameras.main.setScroll(0, bob);
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

  /**
   * Shuts the flower picker once the tuft it is open on no longer takes a
   * flower; one open on a flower stands, with no tuft under it to lose.
   */
  private shutStrayPicker(): void {
    const planting = this.meadow?.planting;
    if (
      planting &&
      planting.flower === undefined &&
      this.grass &&
      !this.grass.holds(planting.foot)
    ) {
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
      ...pick(meadow, 'mushrooms', 'planted', 'pulled'),
    };
  }

  private fliers(): readonly Flier[] {
    return this.meadow?.insects ?? [];
  }

  /** The beds the perches stand on, as the scene holds them now. */
  private beds(): Pick<PerchHosts, 'bed' | 'flowers'> {
    const { bed, flowers } = this;
    return { bed, flowers };
  }

  private dispatch(action: Action): void {
    if (!this.meadow) return;
    const meadow = reduce(this.meadow, action);
    // A frame's tick with nothing due changes nothing, and costs nothing.
    if (meadow === this.meadow) return;
    const regrown = meadow.mushrooms !== this.meadow.mushrooms;
    this.sown ||=
      regrown ||
      meadow.planted !== this.meadow.planted ||
      meadow.pulled !== this.meadow.pulled;
    this.meadow = meadow;
    if (regrown) this.see();
    this.bed?.reconcile(meadow, this.requireLayout(), this.clock);
    this.insects?.reconcile(meadow.insects);
    this.repaintControls();
  }

  /**
   * A tap on the insect `id` startles it; at rest, the tap goes on to
   * whatever it sits on, so a creature never costs the child the thing under
   * it. In flight it takes the tap alone.
   */
  private tapInsect(id: string): void {
    const now = this.clock * 1000;
    const flier = this.meadow?.insects.find((each) => each.id === id);
    const under = restingOn(flier, now);
    this.dispatch({
      kind: 'startle',
      id,
      now,
      ...this.perches.sightFrom(this.viewNow()),
    });
    this.perches.tapThrough(under);
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

  /** The view the frame is drawn through now: the opening eye's before the eye's first fit. */
  private viewNow(): View {
    return this.eye.view() ?? viewAt(this.requireLayout().camera, OPENING_EYE);
  }

  private repaintControls(): void {
    if (this.layout && this.meadow) {
      this.controls?.paint(
        this.layout,
        this.meadow,
        this.voice.muted,
        this.pixelRatio(),
        this.eye.toScreen,
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
    // The visit opens on the clump; a resize keeps where the eye stands
    // and which way it looks.
    this.eye.fit(layout.camera);
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
    this.walk(layout.height);
    this.see();
    this.repaintControls();
  };

  /** Sees the perches afresh, as the screen and the mushrooms now stand. */
  private see(): void {
    const stand = this.stand();
    if (!stand) return;
    this.perches.see(stand);
  }
}
