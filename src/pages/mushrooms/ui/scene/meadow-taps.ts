import type * as Phaser from 'phaser';

import type { Arrivals } from './arrivals';
import type { DuskView } from './dusk-view';
import type { MushroomBed } from './mushroom-bed';
import { restingOn } from './perch-hosts';
import type { Perches } from './perches';
import type { Planter, Scened } from './planter';
import type { RainView } from './rain-view';
import type { Grass } from './tufts';

/** What of the scene, as it stands at the tap, a tap on the meadow acts through. */
type MeadowTapped = Pick<Scened, 'dispatch'> & {
  camera: Phaser.Cameras.Scene2D.Camera;
  planter: Pick<Planter, 'tapTuft'>;
  grass: Grass | undefined;
  rain: Pick<RainView, 'tap'> | undefined;
  dusk: Pick<DuskView, 'tap'> | undefined;
  bed: Pick<MushroomBed, 'spores'> | undefined;
};

/**
 * A tap that lands on nothing else (`over` empty) lands on a cloud, which
 * starts the rain, on the sun or the moon, which turns the light, on a spore, which it picks up, or on a tuft or the bare
 * meadow, either of which lets go of the selection.
 */
export function tapMeadow(
  scene: MeadowTapped,
  pointer: Phaser.Input.Pointer,
  over: readonly Phaser.GameObjects.GameObject[],
): void {
  if (over.length > 0) return;
  const { camera, planter, grass, rain, dusk, bed, dispatch } = scene;
  const at = camera.getWorldPoint(pointer.x, pointer.y);
  if (rain?.tap(at, camera.scrollY) === true) return;
  if (dusk?.tap(at, camera.scrollY) === true) return;
  const spore = bed?.spores.pickUp(at);
  const tuft = grass?.at(at);
  if (spore !== undefined) dispatch({ kind: 'unsow', id: spore });
  else if (grass && tuft) planter.tapTuft(tuft, grass);
  else dispatch({ kind: 'deselect' });
}

/** What of the scene a tap on an insect acts through: the arrivals' own. */
type InsectTapped = Pick<
  ConstructorParameters<typeof Arrivals>[2],
  'meadow' | 'dispatch' | 'sight'
>;

/**
 * A tap on the insect `id`, at `now` ms, startles it; at rest, the tap goes
 * on to whatever it sits on, so a creature never costs the child the thing
 * under it. In flight it takes the tap alone.
 */
export function tapInsect(
  scene: InsectTapped,
  perches: Pick<Perches, 'tapThrough'>,
  id: string,
  now: number,
): void {
  const flier = scene.meadow()?.insects.find((each) => each.id === id);
  const under = restingOn(flier, now);
  scene.dispatch({ kind: 'startle', id, now, ...scene.sight() });
  perches.tapThrough(under);
}
