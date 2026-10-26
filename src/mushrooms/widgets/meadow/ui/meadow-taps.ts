import type * as Phaser from 'phaser';

import type { Dispatching } from '@/mushrooms/shared/world';
import type { RainTapped } from '@/mushrooms/entities/landscape/index.node-safe';
import {
  restingOn,
  type TappedThrough,
} from '@/mushrooms/features/insects-fly/index.node-safe';
import type { Grass } from '@/mushrooms/features/plant-flower/index.node-safe';

import type { Action } from '../model/game';
import type { DuskTapped } from './dusk-view';
import type { Sporing } from './mushroom-bed';
import type { MeadowActed, SightSeen, TuftTapping } from './planter';

/** What of the scene, as it stands at the tap, a tap on the meadow acts through. */
type MeadowTapped = Dispatching<Action> & {
  camera: Phaser.Cameras.Scene2D.Camera;
  planter: TuftTapping;
  grass: Grass | undefined;
  rain: RainTapped | undefined;
  dusk: DuskTapped | undefined;
  bed: Sporing | undefined;
};

/**
 * A tap that lands on nothing else (`over` empty) lands on a cloud, which
 * starts the rain, on the sun or the moon, which turns the light, on a spore,
 * which it picks up, or on a tuft or the bare meadow, either of which lets go
 * of the selection.
 */
export function tapMeadow(
  scene: MeadowTapped,
  pointer: Phaser.Input.Pointer,
  over: readonly Phaser.GameObjects.GameObject[],
): void {
  if (over.length > 0) return;
  const { camera, planter, grass, rain, dusk, bed, dispatch } = scene;
  const at = camera.getWorldPoint(pointer.x, pointer.y);
  // The sun's or moon's own disc first: a cloud's tap box reaches past its
  // puffs, over a disc it does not cover.
  if (dusk?.tap(at, camera.scrollY, 'disc') === true) return;
  if (rain?.tap(at, camera.scrollY) === true) return;
  if (dusk?.tap(at, camera.scrollY, 'rays') === true) return;
  const spore = bed?.spores.pickUp(at);
  const tuft = grass?.at(at);
  if (spore !== undefined) dispatch({ kind: 'unsow', id: spore });
  else if (grass && tuft) planter.tapTuft(tuft, grass);
  else dispatch({ kind: 'deselect' });
}

/** What of the scene a tap on an insect acts through: the arrivals' own. */
type InsectTapped = MeadowActed & SightSeen;

/**
 * A tap on the insect `id`, at `now` ms, startles it; at rest, the tap goes
 * on to whatever it sits on, so a creature never costs the child the thing
 * under it. In flight it takes the tap alone.
 */
export function tapInsect(
  scene: InsectTapped,
  perches: TappedThrough,
  id: string,
  now: number,
): void {
  const flier = scene.meadow()?.insects.find((each) => each.id === id);
  const under = restingOn(flier, now);
  scene.dispatch({ kind: 'startle', id, now, ...scene.sight() });
  perches.tapThrough(under);
}
