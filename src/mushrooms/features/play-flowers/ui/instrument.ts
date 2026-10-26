import {
  type Drum,
  type FlowerSound,
  HOME_OCTAVE,
  type Melody,
  shiftMelody,
  shiftOctave,
  strike,
} from '@/mushrooms/entities/flower/index.node-safe';

import type { PlayedKey } from './keyboard';

/** What wakes the meadow's sound: a browser lets a page play only after a tap. */
export type Waking = { start: () => void };

/** What a key plays through the meadow's sound: a note, or a drum. */
export type Keyed = {
  note: (note: number) => void;
  drum: (drum: Drum) => void;
};

/** What of the meadow's synth the instrument plays through. */
type Synth = Keyed & Waking;

export type Playable = {
  wake: () => void;
  key: (action: PlayedKey) => FlowerSound | undefined;
};

/**
 * The flowers played as one instrument: a flower's note and a key's sound
 * nearest the melody's last (`strike`), a melody that has rested starting
 * in the keyboard's octave, and either becomes the melody's last, so a child
 * on the flowers and a parent on the keys play in one register. An octave
 * key moves the keyboard's octave and the melody's last note with it.
 */
export class Instrument implements Playable {
  private readonly voice: Synth;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  private melody: Melody;
  private octave = HOME_OCTAVE;

  constructor(voice: Synth, now: () => number) {
    this.voice = voice;
    this.now = now;
  }

  /**
   * Sounds a flower. One that `leads` — tapped — moves the melody on; one a
   * bee planted opening plays from it without moving it, so the bees never
   * pull a child's tune off its register.
   */
  flower(sound: FlowerSound, leads: boolean): void {
    if (sound.kind === 'drum') {
      this.voice.drum(sound.drum);
      return;
    }
    const played = strike(this.melody, sound.pitchClass, this.now());
    if (leads) this.melody = played.melody;
    this.voice.note(played.note);
  }

  /** Lets the sound start, as a key press may, being a gesture the browser counts. */
  wake(): void {
    this.voice.start();
  }

  /** Plays a key, returning the flower sound it made; an octave key sounds nothing, and at the range's end does nothing. */
  key(action: PlayedKey): FlowerSound | undefined {
    if (action.kind === 'octave') {
      this.octave = shiftOctave(this.octave, action.step);
      this.melody = shiftMelody(this.melody, action.step, this.now());
      return undefined;
    }
    if (action.kind === 'drum') {
      this.voice.drum(action.drum);
      return action;
    }
    const played = strike(
      this.melody,
      action.pitchClass,
      this.now(),
      this.octave,
    );
    this.melody = played.melody;
    this.voice.note(played.note);
    return action;
  }
}
