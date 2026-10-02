/**
 * The meadow's voice, synthesized with Web Audio — no sound files. A browser
 * lets a page make sound only after a tap, so nothing is built until `start`,
 * which the scene calls on the first tap's release; a sound asked for before
 * then plays the moment it starts, so the first tap is heard too.
 */

import type { Drum } from '../../model/flower-sounds';
import type { InsectKind } from '../../model/insect-genes';
import { type Foot, FOOT_PAN, footstep } from './footsteps';
import { SHY, TAKE_OFF } from './insect-voices';
import { drumVoice, noteVoice } from './instrument-voices';
import { brownNoise, panned, tone, type Voice } from './synth';

const MUTED_KEY = 'mushrooms-muted';
const LOUDNESS = 0.8;
/** How long a mute takes to fade out before the synth is suspended. */
const FADE_SECONDS = 0.25;
const BIRD_GAP_SECONDS = [5, 12] as const;
/** The most voices asked for before the synth starts that wait for it: a chord's worth. */
const PENDING_VOICES = 5;

/**
 * Whether the player muted the meadow on an earlier visit. Where storage
 * throws (a private window) the meadow opens with sound, and a mute lasts the
 * visit: the one silent fallback in the game, since losing it costs a
 * remembered preference and never the meadow.
 */
export function readMuted(): boolean {
  try {
    return globalThis.localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberMuted(muted: boolean): void {
  try {
    globalThis.localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
  } catch {
    // The same fallback as `readMuted`: the mute holds for this visit.
  }
}

const pop: Voice = (context, out) => {
  tone(context, out, 'sine', [900, 240], 0.14, 0.3);
};

/** A spring's boing, lower for a bigger mushroom (`pitch` below 1). */
function boing(pitch: number): Voice {
  return (context, out) => {
    const body = tone(
      context,
      out,
      'sine',
      [170 * pitch, 440 * pitch, 150 * pitch],
      0.55,
      0.28,
    );
    const wobble = new OscillatorNode(context, { frequency: 13 });
    const depth = new GainNode(context, { gain: 24 * pitch });
    wobble.connect(depth).connect(body.frequency);
    wobble.start();
    wobble.stop(context.currentTime + 0.6);
  };
}

/** A mushroom coming up: a rising bloop, and a pop as the cap opens. */
const grow: Voice = (context, out) => {
  tone(context, out, 'sine', [160, 520], 0.4, 0.26);
  tone(context, out, 'triangle', [640, 900], 0.18, 0.08);
};

/** A mushroom going back into the ground: a falling slide. */
const sink: Voice = (context, out) => {
  tone(context, out, 'sine', [520, 440, 120], 0.45, 0.24);
};

/**
 * A control that cannot act, shaking its head: a low "nuh-uh", the second
 * note lower, reedy where the meadow's other voices are round.
 */
const nuhUh: Voice = (context, out) => {
  const reedy = (pitches: readonly number[], seconds: number, delay = 0) => {
    tone(context, out, 'square', pitches, seconds, 0.07, delay);
    tone(context, out, 'triangle', pitches, seconds, 0.22, delay);
  };
  reedy([196, 185], 0.16);
  reedy([147, 131], 0.26, 0.2);
};

/** Knock-knock on wood, as a window or a door goes in. */
const knock: Voice = (context, out) => {
  for (const delay of [0, 0.14]) {
    tone(context, out, 'triangle', [330, 170], 0.09, 0.4, delay);
    tone(context, out, 'sine', [1100, 520], 0.03, 0.14, delay);
  }
};

/** A mouse's squeak, twice: high and quick, rising and falling back. */
const squeak: Voice = (context, out) => {
  tone(context, out, 'sine', [1900, 2700, 2200], 0.16, 0.11);
  tone(context, out, 'sine', [2100, 2900], 0.1, 0.09, 0.2);
};

const bird: Voice = (context, out) => {
  const notes = 2 + Math.floor(Math.random() * 3);
  const high = 2600 + Math.random() * 900;
  for (let index = 0; index < notes; index++) {
    const at = context.currentTime + index * 0.13;
    const oscillator = new OscillatorNode(context, { frequency: high });
    oscillator.frequency.setValueAtTime(high, at);
    oscillator.frequency.exponentialRampToValueAtTime(high * 1.35, at + 0.07);
    const envelope = new GainNode(context, { gain: 0 });
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(0.035, at + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
    oscillator.connect(envelope).connect(out);
    oscillator.start(at);
    oscillator.stop(at + 0.1);
  }
};

/** A breeze: brown noise through a low filter that opens and closes slowly. */
function startBreeze(context: AudioContext, out: AudioNode): void {
  const noise = new AudioBufferSourceNode(context, {
    buffer: brownNoise(context, 3),
    loop: true,
  });
  const filter = new BiquadFilterNode(context, {
    type: 'lowpass',
    frequency: 420,
  });
  const gust = new OscillatorNode(context, { frequency: 0.09 });
  const gustDepth = new GainNode(context, { gain: 220 });
  gust.connect(gustDepth).connect(filter.frequency);
  noise
    .connect(filter)
    .connect(new GainNode(context, { gain: 0.12 }))
    .connect(out);
  noise.start();
  gust.start();
}

export class MeadowSound {
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private pending: Voice[] = [];
  private birdTimer: ReturnType<typeof setTimeout> | undefined;
  private quietTimer: ReturnType<typeof setTimeout> | undefined;
  private mutedNow: boolean;

  constructor(muted: boolean) {
    this.mutedNow = muted;
  }

  get muted(): boolean {
    return this.mutedNow;
  }

  /**
   * Builds the synth on the first call; each later call resumes it, unless it
   * is muted or the tab is hidden.
   */
  start(): void {
    if (this.context) {
      this.settle();
      return;
    }
    // A browser with no Web Audio keeps the meadow silent, and nothing else changes.
    if (typeof AudioContext === 'undefined') return;
    const context = new AudioContext();
    this.context = context;
    this.master = new GainNode(context, {
      gain: this.mutedNow ? 0 : LOUDNESS,
    });
    // Chords and drums stacked on the breeze stay under full scale.
    this.master
      .connect(
        new DynamicsCompressorNode(context, {
          threshold: -14,
          knee: 12,
          ratio: 4,
          attack: 0.004,
          release: 0.2,
        }),
      )
      .connect(context.destination);
    startBreeze(context, this.master);
    this.scheduleBird();
    document.addEventListener('visibilitychange', this.followVisibility);
    for (const voice of this.pending) voice(context, this.master);
    this.pending = [];
    this.settle();
  }

  /**
   * Fades the sound out and then suspends the whole synth — breeze, gusts and
   * birds — so a muted game costs the tablet no battery; or resumes it and
   * fades back in.
   */
  toggleMuted(): void {
    this.mutedNow = !this.mutedNow;
    rememberMuted(this.mutedNow);
    clearTimeout(this.quietTimer);
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(
        this.mutedNow ? 0 : LOUDNESS,
        this.context.currentTime,
        FADE_SECONDS / 5,
      );
    }
    if (this.mutedNow) {
      this.quietTimer = setTimeout(() => {
        this.settle();
      }, FADE_SECONDS * 1000);
    } else {
      this.settle();
    }
  }

  pop(): void {
    this.play(pop);
  }

  boing(pitch: number): void {
    this.play(boing(pitch));
  }

  /** A flower's note, `note` a MIDI number. */
  note(note: number): void {
    this.play(noteVoice(note));
  }

  drum(drum: Drum): void {
    this.play(drumVoice(drum));
  }

  grow(): void {
    this.play(grow);
  }

  sink(): void {
    this.play(sink);
  }

  nuhUh(): void {
    this.play(nuhUh);
  }

  knock(): void {
    this.play(knock);
  }

  squeak(): void {
    this.play(squeak);
  }

  /**
   * The eye's step landing on `foot`, sounding on its side. A step before
   * the synth exists is dropped rather than waiting for `start`: it belongs
   * to the moment it was walked, and would crowd a tap's note out of the wait.
   */
  step(foot: Foot): void {
    if (this.context) this.play(panned(footstep, FOOT_PAN[foot]));
  }

  /** An insect of `kind` taking wing at `pan` (`panOf`): a butterfly's trill, a fly's or a bee's buzz. */
  takeOff(kind: InsectKind, pan: number): void {
    this.play(panned(TAKE_OFF[kind], pan));
  }

  /** An insect of `kind` caught in the air at `pan` (`panOf`), shying away: a butterfly's tumbling trill, a fly's whine, a bee's sharp buzz. */
  shy(kind: InsectKind, pan: number): void {
    this.play(panned(SHY[kind], pan));
  }

  stop(): void {
    clearTimeout(this.birdTimer);
    clearTimeout(this.quietTimer);
    document.removeEventListener('visibilitychange', this.followVisibility);
    this.context?.close().catch(reportError);
  }

  /**
   * Builds `voice` only while the synth is heard. A suspended context's clock
   * stands still, so a voice built while muted or hidden would wait there and
   * sound, with every other one, the moment it resumes; such a voice is
   * dropped instead. Before the synth exists the latest few voices wait
   * for `start`, so the first tap is heard, or the first chord.
   */
  private play(voice: Voice): void {
    if (!this.context || !this.master) {
      this.pending = [...this.pending, voice].slice(-PENDING_VOICES);
      return;
    }
    if (this.heard()) voice(this.context, this.master);
  }

  private heard(): boolean {
    return (
      !this.mutedNow && !document.hidden && this.context?.state === 'running'
    );
  }

  private scheduleBird(): void {
    const [min, max] = BIRD_GAP_SECONDS;
    this.birdTimer = setTimeout(
      () => {
        this.play(bird);
        this.scheduleBird();
      },
      (min + Math.random() * (max - min)) * 1000,
    );
  }

  /** Running only while unmuted and the tab is shown, as the picture is. */
  private settle(): void {
    const change =
      this.mutedNow || document.hidden
        ? this.context?.suspend()
        : this.context?.resume();
    change?.catch(reportError);
  }

  private readonly followVisibility = (): void => {
    this.settle();
  };
}
