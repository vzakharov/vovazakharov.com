/**
 * The meadow's voice, synthesized with Web Audio — no sound files. A browser
 * lets a page make sound only after a tap, so nothing is built until `start`,
 * which the scene calls on the first tap's release; a sound asked for before
 * then plays the moment it starts, so the first tap is heard too.
 */

const MUTED_KEY = 'mushrooms-muted';
const LOUDNESS = 0.8;
/** A major pentatonic from C5, so any run of chimes is in tune. */
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
const BIRD_GAP_SECONDS = [5, 12] as const;

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

type Voice = (context: AudioContext, out: AudioNode) => void;

/** One enveloped oscillator: `shape` gliding through `pitches` over `seconds`. */
function tone(
  context: AudioContext,
  out: AudioNode,
  shape: OscillatorType,
  pitches: readonly number[],
  seconds: number,
  peak: number,
): OscillatorNode {
  const now = context.currentTime;
  const oscillator = new OscillatorNode(context, {
    type: shape,
    frequency: pitches[0],
  });
  for (const [index, pitch] of pitches.slice(1).entries()) {
    oscillator.frequency.exponentialRampToValueAtTime(
      pitch,
      now + (seconds * (index + 1)) / pitches.length,
    );
  }
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.linearRampToValueAtTime(peak, now + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  oscillator.connect(envelope).connect(out);
  oscillator.start(now);
  oscillator.stop(now + seconds + 0.05);
  return oscillator;
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

/** A soft bell on the scale's `step`th note, the same note for the same step. */
function chime(step: number): Voice {
  const pitch = PENTATONIC[step % PENTATONIC.length] ?? PENTATONIC[0] ?? 440;
  return (context, out) => {
    tone(context, out, 'triangle', [pitch, pitch], 0.9, 0.16);
    tone(context, out, 'sine', [pitch * 2, pitch * 2], 0.5, 0.05);
  };
}

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
  const length = context.sampleRate * 3;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let last = 0;
  for (let index = 0; index < length; index++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    samples[index] = last * 3.5;
  }
  const noise = new AudioBufferSourceNode(context, { buffer, loop: true });
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
  private pending: Voice | undefined;
  private birdTimer: ReturnType<typeof setTimeout> | undefined;
  private mutedNow: boolean;

  constructor(muted: boolean) {
    this.mutedNow = muted;
  }

  get muted(): boolean {
    return this.mutedNow;
  }

  /** Builds the synth on the first call; each later call resumes it. */
  start(): void {
    if (this.context) {
      this.context.resume().catch(reportError);
      return;
    }
    const context = new AudioContext();
    this.context = context;
    this.master = new GainNode(context, {
      gain: this.mutedNow ? 0 : LOUDNESS,
    });
    this.master.connect(context.destination);
    startBreeze(context, this.master);
    this.scheduleBird();
    document.addEventListener('visibilitychange', this.followVisibility);
    this.pending?.(context, this.master);
    this.pending = undefined;
  }

  toggleMuted(): void {
    this.mutedNow = !this.mutedNow;
    rememberMuted(this.mutedNow);
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(
        this.mutedNow ? 0 : LOUDNESS,
        this.context.currentTime,
        0.05,
      );
    }
  }

  pop(): void {
    this.play(pop);
  }

  boing(pitch: number): void {
    this.play(boing(pitch));
  }

  chime(step: number): void {
    this.play(chime(step));
  }

  stop(): void {
    clearTimeout(this.birdTimer);
    document.removeEventListener('visibilitychange', this.followVisibility);
    this.context?.close().catch(reportError);
  }

  private play(voice: Voice): void {
    if (this.context && this.master) voice(this.context, this.master);
    else this.pending = voice;
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

  /** Silent while the tab is hidden, as the picture is. */
  private readonly followVisibility = (): void => {
    const change = document.hidden
      ? this.context?.suspend()
      : this.context?.resume();
    change?.catch(reportError);
  };
}
