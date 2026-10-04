import type { WithId } from '@/shared/typings';

import type { FlowerColour } from '../../model/flower-genes';
import {
  classOf,
  type FlowerSound,
  sameSound,
} from '../../model/flower-sounds';
import type { Action, Planting } from '../../model/game';
import { pick, type Random } from '../../model/random';
import type { Instrument } from './instrument';
import type { PlayedKey } from './keyboard';

/**
 * A flower the current view shows — on the screen, not culled — and the
 * sound it makes: what a note or drum key can play through.
 */
export type FlowerInView = WithId & { sound: FlowerSound };

/**
 * The flowers in view a key making `sound` plays through: every one that
 * makes it, whatever octave the keyboard stands at.
 */
export function keyedFlowers(
  sound: FlowerSound,
  inView: readonly FlowerInView[],
): FlowerInView[] {
  return inView.filter((flower) => sameSound(flower.sound, sound));
}

/**
 * What a note or drum key making `sound` asks of the meadow with the flower
 * picker as `planting` holds it: open, on a tuft or a flower and at either
 * stage, the picker's own pick of the flower that makes it (`classOf`) — its
 * colour, its seeds drawn by `seedsOf`, unless that colour is chosen already,
 * whose seeds the shape row shows; then its shape. With the picker shut,
 * `undefined`: the key plays through the flowers in view instead.
 */
export function keyPlanting(
  planting: Planting | undefined,
  sound: FlowerSound,
  seedsOf: (colour: FlowerColour) => readonly number[],
): Action[] | undefined {
  if (planting === undefined) return undefined;
  const { colour, shape } = classOf(sound);
  const plant: Action = { kind: 'plant', shape };
  if (planting.chosen?.colour === colour) return [plant];
  return [{ kind: 'colour', colour, seeds: seedsOf(colour) }, plant];
}

/**
 * The tuft a key's flower grows on with the picker shut and none of its sound
 * in view: one of `tufts`, those the view draws, that is still `free` to take
 * a flower, drawn off `random` so a replay grows the same; `undefined` where
 * none is.
 */
export function sowingTuft<Tuft extends object>(
  random: Random,
  tufts: readonly Tuft[],
  free: (tuft: Tuft) => boolean,
): Tuft | undefined {
  const [first, ...rest] = tufts.filter((tuft) => free(tuft));
  return first === undefined ? undefined : pick(random, [first, ...rest]);
}

/**
 * What a key plays through: the flowers the current view shows, on the
 * screen and not culled, as of the key's press, the ones keys sowed since
 * the last frame among them; how the ones it plays answer, as each would a
 * tap; the flower picker, which a key making `sound` plants through while it
 * is open, returning whether it was; and the grass in view, which grows the
 * flower of a sound no flower in view makes (`sow`), where a tuft is free.
 */
export type KeyedPlay = {
  inView: () => readonly FlowerInView[];
  answer: (flowers: readonly FlowerInView[]) => void;
  plant: (sound: FlowerSound) => boolean;
  sow: (sound: FlowerSound) => void;
};

/**
 * A played key through `keyed`: an octave key shifts the keyboard's octave;
 * a note or drum key plants its flower where the flower picker is open, which
 * sounds as a planting does, and otherwise sounds at that octave, through the
 * flowers in view that make its sound, which answer it as a tap, or with none
 * in view grows one that does.
 */
export function playKey(
  instrument: Pick<Instrument, 'wake' | 'key'>,
  keyed: KeyedPlay,
  action: PlayedKey,
): void {
  instrument.wake();
  if (action.kind === 'octave') {
    instrument.key(action);
    return;
  }
  if (keyed.plant(action)) return;
  instrument.key(action);
  const answering = keyedFlowers(action, keyed.inView());
  if (answering.length === 0) keyed.sow(action);
  else keyed.answer(answering);
}
