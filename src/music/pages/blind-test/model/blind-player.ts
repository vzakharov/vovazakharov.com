import { type Variant, VARIANTS } from './blind-test';

/** Short enough to hear as a cut, long enough not to click. */
const FADE_S = 0.015;
const RESYNC_MS = 50;
/** Drift under this is left alone. */
const TOLERANCE_S = 0.003;
/** Past this a silent track seeks rather than catches up by speed. */
const SEEK_S = 0.3;
/** A seek on a playing element lands this late, so it aims this far ahead. */
const SEEK_LEAD_S = 0.06;
/** Speed correction per second of drift, capped at `MAX_NUDGE`. */
const NUDGE_PER_S = 2;
const MAX_NUDGE = 0.05;

type Track = { audio: HTMLAudioElement; gain: GainNode };

/**
 * Every variant of one song playing at once, only one of them audible, so a
 * switch is a gain change rather than a seek. The silent tracks drift, and a
 * timer pulls them back onto the audible one by speed: a seek on a playing
 * element lands behind by its own latency, which a switch would then play.
 */
export class BlindPlayer {
  private readonly context = new AudioContext();
  private readonly tracks = new Map<Variant, Track>();
  private readonly timer: ReturnType<typeof setInterval>;
  private active: Variant = 'mix';

  constructor() {
    this.timer = setInterval(() => {
      this.resync();
    }, RESYNC_MS);
  }

  load(urls: Record<Variant, string>) {
    this.unload();
    for (const variant of VARIANTS) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.src = urls[variant];
      const gain = this.context.createGain();
      gain.gain.value = variant === this.active ? 1 : 0;
      this.context
        .createMediaElementSource(audio)
        .connect(gain)
        .connect(this.context.destination);
      this.tracks.set(variant, { audio, gain });
    }
  }

  async play() {
    await this.context.resume();
    const at = this.time;
    for (const { audio } of this.tracks.values()) audio.currentTime = at;
    await Promise.all(
      [...this.tracks.values()].map(async ({ audio }) => audio.play()),
    );
  }

  pause() {
    for (const { audio } of this.tracks.values()) audio.pause();
  }

  seek(seconds: number) {
    for (const { audio } of this.tracks.values()) audio.currentTime = seconds;
  }

  select(variant: Variant) {
    const now = this.context.currentTime;
    for (const [each, { gain }] of this.tracks) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(each === variant ? 1 : 0, now + FADE_S);
    }
    this.active = variant;
    if (this.lead !== undefined) this.lead.playbackRate = 1;
  }

  private resync() {
    const { lead, active, tracks } = this;
    if (lead === undefined || lead.paused) return;
    lead.playbackRate = 1;
    for (const [variant, { audio }] of tracks) {
      if (variant === active) continue;
      const drift = audio.currentTime - lead.currentTime;
      if (Math.abs(drift) > SEEK_S) {
        audio.playbackRate = 1;
        audio.currentTime = lead.currentTime + SEEK_LEAD_S;
      } else if (Math.abs(drift) < TOLERANCE_S) {
        audio.playbackRate = 1;
      } else {
        const nudge = Math.min(MAX_NUDGE, Math.abs(drift) * NUDGE_PER_S);
        audio.playbackRate = 1 - Math.sign(drift) * nudge;
      }
    }
  }

  get time() {
    return this.lead?.currentTime ?? 0;
  }

  get duration() {
    const seconds = this.lead?.duration;
    return seconds === undefined || Number.isNaN(seconds) ? 0 : seconds;
  }

  get playing() {
    return this.lead !== undefined && !this.lead.paused;
  }

  get ended() {
    return this.lead?.ended ?? false;
  }

  unload() {
    for (const { audio, gain } of this.tracks.values()) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      gain.disconnect();
    }
    this.tracks.clear();
  }

  async close() {
    clearInterval(this.timer);
    this.unload();
    await this.context.close();
  }

  private get lead() {
    return this.tracks.get(this.active)?.audio;
  }
}
