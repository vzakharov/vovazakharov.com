import type { WithId } from '@/shared/typings';

import { type FlowerSound, sameSound } from '../../model/flower-sounds';
import type { Instrument } from './instrument';
import type { PlayedKey } from './keyboard';

/**
 * A flower the current view shows — on the screen, not culled — and the
 * sound it makes: what a note or drum key can play through.
 */
export type FlowerInView = WithId & { sound: FlowerSound };

/**
 * The flowers in view a key making `sound` plays through: every one that
 * makes it. None means the key stays silent, there being no flower before
 * the player to play it.
 */
export function keyedFlowers(
  sound: FlowerSound,
  inView: readonly FlowerInView[],
): FlowerInView[] {
  return inView.filter((flower) => sameSound(flower.sound, sound));
}

/**
 * What a key plays through: the flowers the current view shows, on the
 * screen and not culled, as of the key's press; and how the ones it plays
 * answer, as each would a tap.
 */
export type KeyedPlay = {
  inView: () => readonly FlowerInView[];
  answer: (flowers: readonly FlowerInView[]) => void;
};

/**
 * A played key through `keyed`: an octave key shifts the keyboard's octave;
 * a note or drum key sounds, at that octave, only through the flowers in view
 * that make its sound, which answer it as a tap, and with none in view stays
 * silent.
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
  const answering = keyedFlowers(action, keyed.inView());
  if (answering.length === 0) return;
  instrument.key(action);
  keyed.answer(answering);
}
